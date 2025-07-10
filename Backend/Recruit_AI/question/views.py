from .models import Question, Question_processing_status
from job.models import JobOpening
from aspect.models import Aspect, AspectsProcessingStatus
from django.shortcuts import get_object_or_404

from django.views import View
from django.http import JsonResponse
import asyncio
from .agents.questions_agent import QuestionnaireAgent
from .prompts.questions_promt import generate_ques_prompt
from django.utils.decorators import method_decorator
import json
from asgiref.sync import sync_to_async
import asyncio
from django.core.exceptions import ObjectDoesNotExist
from utils.authentication_decorator import jwt_required, jwt_required_sync


from .tasks import gen_ques, gen_issues_fixes_and_aspects
from aspect.tasks import gen_metrics

#####################################################################################################################################################
# helper functions

# function to return True or False based on whether the job_id provided belongs to the user or not
def job_exists(job_id, user):
    return JobOpening.objects.filter(id=job_id, user=user).exists()

async def job_exists_async(job_id, user):
    return await JobOpening.objects.filter(id=job_id, user=user).aexists()


def get_question_object_with_job(job_id):
     return get_object_or_404(Question.objects.select_related("job"),job__id= job_id)

def get_question_field(job_id):
    try:
        question_obj = Question.objects.only("questions").get(job__id = job_id)
        return question_obj.questions
    except Question.DoesNotExist:
        return None
          
async def create_aspects_processing_status(job):
    await sync_to_async(AspectsProcessingStatus.objects.update_or_create)(
        job=job, defaults={"status": "processing"}
    )

#################################################################################################################################################
# class GenerateQuestionsView(View):
@jwt_required
async def generate_questions(request):
    try:
        # Parse JSON data from the request body
        data = json.loads(request.body)

        # Extract job-specific data
        job_id = data.get('job_id')
        # print(job_id)
        # authorisation check
        user = request.user
        exists = await job_exists_async(job_id, user)
        if not exists:
            return JsonResponse({"error": "this Job does not belong to you"}, status = 400)


        job_title = data.get('title')
        role_type = data.get('role_type')
        # job_description = data.get('description') # removed
        domain = data.get('domain')
        level_of_position = data.get('level_of_position')
        #newly added fields
        department = data.get('department')
        candidate_requirements = data.get('candidate_requirements')
        role_definition = data.get('role_definition')
        evaluation_metrics = data.get('evaluation_metrics')
        additional_inputs = data.get('additional_inputs')
        job_summary = role_definition.get('job_summary'),
        key_responsibilities = role_definition.get('key_responsibilities'),

        # Validate required fields
        if not job_title or not job_summary or not key_responsibilities or not  role_type or not domain or not level_of_position:
            return JsonResponse({'error': 'Missing some fields'}, status=400)
        try:
            gen_ques.delay(job_id, job_title, role_type, domain, level_of_position, department, job_summary, key_responsibilities, candidate_requirements, evaluation_metrics, additional_inputs)

        except Exception as e:
            print(f"Error occurred : {e}")
            return JsonResponse({"error": str(e)}, status=500)
        return JsonResponse({'message': 'Questions saved successfully'}, status=201)
    

    except json.JSONDecodeError:
        return JsonResponse({'error': 'Invalid JSON format'}, status=400)
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)



####################################################################################################################################################################################

@jwt_required
async def issues_fixes_and_aspects(request, job_id):
    try:
        # authorisation check
        user = request.user
        exists = await job_exists_async(job_id, user)
        if not exists:
                return JsonResponse({"error": "this Job does not belong to you"}, status = 400)
        

        gen_issues_fixes_and_aspects.delay(job_id)
        return JsonResponse({'message': 'Tasks completed of issues, fixes and aspects'}, status=200)

    except Exception as e:
        # log the error appropriately
        return JsonResponse({'error': str(e)}, status=500)

################################################################################################################################################################################################

def get_question_with_job(job_id):
     return get_object_or_404(Question.objects.select_related("job"))
     

#helper function
def get_question(job):
            try:
                return getattr(job, 'questions', None)
            except ObjectDoesNotExist:
                return None

# main function to fetch questions corresponding to job_id provided
@jwt_required
async def fetch_questions(request, job_id):
        try:
            # authorisation check
            user = request.user
            exists = await sync_to_async(job_exists)(job_id, user)
            if not exists:
                return JsonResponse({"error": "this Job does not belong to you"}, status = 400)
            
            # job = await sync_to_async(get_object_or_404)(JobOpening, id = job_id)
            # question = await sync_to_async(get_question)(job) # Assuming job_id is unique to a job
            question_obj = await sync_to_async(get_question_object_with_job)(job_id)  # optimised 
            tries = 0

            while not question_obj and tries<20:
                # print("inside while")
                await asyncio.sleep(3)
                # job = await sync_to_async(get_object_or_404)(JobOpening, id = job_id)
                # question = await sync_to_async(get_question)(job) # Assuming job_id is unique to a job
                question_obj = await sync_to_async(get_question_object_with_job)(job_id)
                tries = tries +1
                # print("trial no :" , tries)

            
            if not question_obj:
                print("trial limit completed")
                return JsonResponse({'error' : "trial exceded"}, status = 400)

            # Prepare the response data
            response_data = {
                'job_title': question_obj.job.title,  # Access the title of the related JobOpening
                'questions': question_obj.questions,  # The JSONField with the questions
                'created_at': question_obj.created_at.strftime("%d %b %Y, %I:%M %p"),  # The creation timestamp
            }
            return JsonResponse(response_data, status=200)
        
        except Exception as e:
            return JsonResponse({'error': str(e)}, status=500)


##################################################################################################################################################################################################################



# class SaveAsDraftView(View):
@jwt_required
async def save_answers_as_draft(request, job_id):
    try:
        # authorisation check
        user = request.user
        exists = await sync_to_async(job_exists)(job_id, user)
        if not exists:
                return JsonResponse({"error": "this Job does not belong to you"}, status = 400)

        # Parse request data
        data = json.loads(request.body)
        answers = data.get('answers')
        
        if answers is None:
            return JsonResponse({'error': 'Answers field is required'}, status=400)
        
        # Fetch question entry for the given job_id
        question = await sync_to_async(get_object_or_404)(Question, job_id=job_id)
        
        # Update and save answers field
        question.answers = answers
        await sync_to_async(question.save)()
        
        return JsonResponse({'message': 'Draft saved successfully'}, status=200)
    except json.JSONDecodeError:
        return JsonResponse({'error': 'Invalid JSON format'}, status=400)
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)



# class SaveAnswersView(View):
@jwt_required
async def save_answers(request, job_id):
    try:
        # print("Inside save answers")
        # authorisation check
        user = request.user
        exists = await sync_to_async(job_exists)(job_id, user)
        if not exists:
                return JsonResponse({"error": "this Job does not belong to you"}, status = 400)
        
        # Parse request data
        data = json.loads(request.body)
        answers = data.get('answers')
        
        if answers is None:
            return JsonResponse({'error': 'Answers field is required'}, status=400)
        
        # Fetch question entry for the given job_id
        # question = await sync_to_async(get_object_or_404)(Question, job_id=job_id)
        # job = await sync_to_async(get_object_or_404)(JobOpening, id=job_id)

        # optimised
        question = await sync_to_async(get_question_object_with_job)(job_id)
        job = question.job

        
        # Update and save final answers field
        question.answers = answers
        job.pointer = 2
        await sync_to_async(job.save)()
        await sync_to_async(question.save)()
        # print("In save answers function updating pointer value for job_id:",job.title, "Updated Job_pointer :", job.pointer)

        # await issues_fixes_and_aspects(job_id)
        # asyncio.create_task(issues_fixes_and_aspects(job_id))
        
        # print("Done with save answers")
        return JsonResponse({'message': 'Answers saved successfully'}, status=200)
    except json.JSONDecodeError:
        return JsonResponse({'error': 'Invalid JSON format'}, status=400)
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)


# class FetchAnswersView(View):
@jwt_required_sync
def fetch_answers(request, job_id):
    try:

        # Fetch the question entry for the given job_id
        question = get_object_or_404(Question, job_id=job_id)

        # authorisation check
        user  = question.job.user
        # print("User requesting:", user)
        # print("owner:", request.user)
        if user != request.user :
            return JsonResponse({"error": "this Job does not belong to you"}, status = 400)
        
        # Prepare response data
        response_data = {
            'job_title': question.job.title,
            'answers': question.answers,
            'created_at': question.created_at.strftime("%d %b %Y, %I:%M %p"),
        }
        return JsonResponse(response_data, status=200)
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)


@jwt_required_sync
def check_status(request, job_id):
    try:
        exists = job_exists(job_id, request.user)
        if not exists:
            return JsonResponse({"error": "this Job does not belong to you"}, status = 400)

        question_process = Question_processing_status.objects.get(job_id= job_id)
        return JsonResponse({"status": question_process.status})
    except Question_processing_status.DoesNotExist:
        return JsonResponse({"status": "idle"})



async def update_processing_status(job):
    await sync_to_async(Question_processing_status.objects.update_or_create)(
        job=job, defaults={"status": "processing"}
    )

async def mark_completed(job):
    await sync_to_async(Question_processing_status.objects.filter(job=job).update)(status="completed")




@jwt_required_sync
def submit_aspects(request, job_id):
    try:
        exists = job_exists(job_id, request.user)
        if not exists:
            return JsonResponse({"error": "Not your job"}, status = 400)
        
        job = JobOpening.objects.get(id = job_id)

        gen_metrics.delay(job_id) # calling celery

        job.pointer = 3
        job.save()
        return JsonResponse({"message": "submitted aspects and incremented pointer to 3"}, status = 200)
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)
