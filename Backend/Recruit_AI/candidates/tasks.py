from celery import shared_task

from .models import *
from job.models import JobOpening, UserExtendedModel
from question.models import Question
from aspect.models import *
import json
import asyncio
from django.http import JsonResponse
# from .views import update_resume_limit
from django.db import transaction


# Agents
from question.agents.profile_agent import ProfileAgent
from question.agents.score_agent import ScoreAgent
from question.agents.feedback_agent import FeedbackAgent

# Prompts
import question.prompts.general_details_prompt as gp
import question.prompts.score_prompt as sp
import question.prompts.feedback_prompt as fp

# Utils
from question.utils.resume_parser import extract_text_from_pdf
from question.utils.tool_final_score import get_final_score
from question.utils.tool_final_candidate import get_final_candidate
from question.utils.tool_join_responses import join_responses
from utils.email_sender import send_custom_mail



from asgiref.sync import sync_to_async
from django.shortcuts import get_object_or_404


@sync_to_async
def update_resume_limit(job_owner, no_of_uploaded_files, sign=1):
    with transaction.atomic():
        # Lock the row
        resume_limit_object = UserExtendedModel.objects.select_for_update().get(user=job_owner)
        no_of_resumes_left = resume_limit_object.no_resumes_left

        if sign == 1 and (no_of_uploaded_files > no_of_resumes_left):
            # print(f"Resume limit reached, you cannot upload more than {no_of_resumes_left} resumes")
            return {"error": f"Resume limit reached, you cannot upload more than {no_of_resumes_left} resumes"}

        # Update the field and save
        resume_limit_object.no_resumes_left = no_of_resumes_left - sign * no_of_uploaded_files
        resume_limit_object.save()
        return {"success": True}




@shared_task(bind=True)
def scan_candidates(self,job_id,n_uploaded, file_paths):
    print("in task.py of candidates")
    asyncio.run(_ascan_candidates(self,job_id,n_uploaded, file_paths))


async def _ascan_candidates(self,job_id,n_uploaded, file_paths):
        try:
        
            job = await JobOpening.objects.aget(id=job_id)

            await update_processing_status(job, n_uploaded) # update the status to processing 

            # Create tasks without awaiting them immediately
            tasks = [asyncio.create_task(get_candidate_details(file, job_id)) for file in file_paths] 

            # Run all tasks concurrently
            await asyncio.gather(*tasks)

            # print("All tasks completed")

            # update status to complete
            await mark_completed(job, n_uploaded)
        except Exception as e:
            result = await update_resume_limit(job.user, n_uploaded, -1)
            await mark_completed_in_error(job, n_uploaded)
            return JsonResponse({"error": str(e)}, status =500)


# new with locking
async def update_processing_status(job, n_uploaded):
    def update_status():
        with transaction.atomic():
            obj, created = ResumeProcessingStatus.objects.select_for_update().get_or_create(job=job)
            obj.n_resumes += n_uploaded  # Increment the count
            obj.status = "processing"
            obj.save()

    await sync_to_async(update_status)()  # Ensure it's non-blocking


# Function to update status to "completed" and decrement n_resumes
async def mark_completed(job, n_uploaded):
    def complete_status(job):
        with transaction.atomic():
            obj = ResumeProcessingStatus.objects.select_for_update().filter(job=job).first()
            if obj:
                # print("before this batch no. of resumes:", obj.n_resumes)
                obj.n_resumes -= n_uploaded  # Decrease count
                obj.status = "completed"
                obj.save()
                # print("after this batch no. of resumes:",obj.n_resumes)
    
    await sync_to_async(complete_status)(job)  # Ensure it's non-blocking

    print("Batch completed frontend will automatically refresh now")
    await asyncio.sleep(5)
    await update_processing_status_last(job.id)



async def mark_completed_in_error(job, n_uploaded):
    def complete_status_in_error(job):
        with transaction.atomic():
            obj = ResumeProcessingStatus.objects.select_for_update().filter(job=job).first()
            if obj:
                # print("before this batch no. of resumes:", obj.n_resumes)
                obj.n_resumes -= n_uploaded  # Decrease count
                obj.status = "completed"
                obj.save()
                # print("after this batch no. of resumes:",obj.n_resumes)
    
    await sync_to_async(complete_status_in_error)(job)  # Ensure it's non-blocking

    print("Error happened in processing of this batch ,setting status to completed frontend will automatically refresh now")
    await asyncio.sleep(5)
    await update_processing_status_last(job.id)

## old one without transaction.atomic
# async def update_processing_status_last(job_id):  
#     try:
#         # print("Checking status for job:", job_id)

#         # Fetch job instance
#         job = await sync_to_async(JobOpening.objects.get)(id=job_id)

#         def fetch_status():
#             return ResumeProcessingStatus.objects.filter(job=job).first() #if no object exists then .first() returns None instead of raising an exception

#         status_obj = await sync_to_async(fetch_status)()  # Fetch ResumeProcessingStatus
#         # print("n_resumes", status_obj.n_resumes)
#         if status_obj:
#             if status_obj.n_resumes > 0:
#                 # print("setting job status to processing, n_resumes =", status_obj.n_resumes)
#                 status_obj.status = "processing"
#             else:
#                 # print("n_resumes:", status_obj.n_resumes)
#                 status_obj.status = "idle"
#                 status_obj.n_resumes = 0
#                 # print("Setting job status to idle")
#             await sync_to_async(status_obj.save)()  # Save updated object

#         return JsonResponse({"message": "Status updated successfully"})

#     except JobOpening.DoesNotExist:
#         return JsonResponse({"error": "Job not found"}, status=404)
#     except json.JSONDecodeError:
#         return JsonResponse({"error": "Invalid JSON format"}, status=400)

async def update_processing_status_last(job_id):  
    try:
        # print("Checking status for job:", job_id)

        # Fetch job instance
        job = await sync_to_async(JobOpening.objects.get)(id=job_id)

        def update_status_last():
            with transaction.atomic():
                status_obj = ResumeProcessingStatus.objects.select_for_update().filter(job=job).first() # Fetch ResumeProcessingStatus
                # print("n_resumes", status_obj.n_resumes)
                if status_obj:
                    if status_obj.n_resumes > 0:
                        # print("setting job status to processing, n_resumes =", status_obj.n_resumes)
                        status_obj.status = "processing"
                    else:
                        # print("n_resumes:", status_obj.n_resumes)
                        status_obj.status = "idle"
                        status_obj.n_resumes = 0
                        # print("Setting job status to idle")
                    status_obj.save()  # Save updated object

        await sync_to_async(update_status_last)()
        return JsonResponse({"message": "Status updated successfully"})

    except JobOpening.DoesNotExist:
        return JsonResponse({"error": "Job not found"}, status=404)
    except json.JSONDecodeError:
        return JsonResponse({"error": "Invalid JSON format"}, status=400)


async def get_score_details(resume_text, job_title, role_type, domain, level_of_position, department, job_summary, key_responsibilities, candidate_requirements, evaluation_metrics, additional_inputs, questions, answers, job_issues, job_fixes, all_params,new_eval, o_aspects, g_aspects, metrics):
    job_details = join_responses(job_title, role_type, domain, level_of_position, department, job_summary, key_responsibilities, candidate_requirements, evaluation_metrics, additional_inputs, questions, answers)

    instructions = sp.generate_score_instructions()
    context_msg = sp.generate_context_prompt(job_details, job_issues, job_fixes)
    score_msg   = sp.generate_score_prompt(resume_text, metrics)

    messages = [
        {"role": "system", "content": instructions},
        {"role": "user",   "content": context_msg},
        {"role": "user",   "content": score_msg},
    ]

    scoreagent = ScoreAgent()
    response = await scoreagent.run(messages)
    
    # save this score_lookup
    scores_lookup = {
        item["par"]: item["score"]
        for item in response.get("score_details", {}).get("scores", [])
    }
    
    return scores_lookup

async def get_feedback_details(resume_text, job_title, role_type, domain, level_of_position, department, job_summary, key_responsibilities, candidate_requirements, evaluation_metrics, additional_inputs, questions, answers, scores_lookup, metrics):
    job_details = join_responses(job_title, role_type, domain, level_of_position, department, job_summary, key_responsibilities, candidate_requirements, evaluation_metrics, additional_inputs, questions, answers)
    instructions = fp.generate_feedback_instructions(job_details)
    prompt = fp.generate_feedback_prompt(resume_text, metrics, scores_lookup)
    feedbackagent = FeedbackAgent(instructions)
    response = await feedbackagent.run(prompt)

    return response

async def get_general_details(resume_text,job_title,role_type,domain,level_of_position,department,job_summary,key_responsibilities,candidate_requirements,evaluation_metrics,additional_inputs):
    instructions = gp.generate_details_instructions(job_title,role_type,domain,level_of_position,department,job_summary,key_responsibilities,candidate_requirements,evaluation_metrics,additional_inputs)
    prompt = gp.generate_details_prompt(resume_text)
    profileagent = ProfileAgent(instructions=instructions)
    response = await profileagent.run(prompt)
    # print("here1###################################")
    # print(response)
    # print("here1###################################")
    # return profileagent._parse_json_safely(response['general_details'])
    return response['general_details']



async def get_candidate_details(pdf_path, job_id): 
    try:
        """Extract and process details from a single resume."""
        # Extract text from resume
        resume_text = extract_text_from_pdf(pdf_path)
        job = await sync_to_async(get_object_or_404)(JobOpening, id=job_id) #fetch job object corresponding to job_id
        # question = await sync_to_async(get_object_or_404)(Question, job_id = job_id)
        aspects = await sync_to_async(get_object_or_404)(Aspect, job_id= job_id)
        # new_parameter = await sync_to_async(get_object_or_404)(Parameter, job_id = job_id)

        question_object = await sync_to_async(get_object_or_404)(Question, job_id = job_id)
        job_title = job.title
        role_type = job.role_type
        domain = job.domain
        # job_description = job.description
        level_of_position = job.level_of_position
        # job_profile = job.job_profile
        # job_rubrics = job.job_rubrics

        job_issues = job.issues
        job_fixes = job.fixes

        #newly added fields
        department = job.department
        candidate_requirements = job.candidate_requirements
        job_summary = job.job_summary
        key_responsibilities = job.key_responsibilities
        evaluation_metrics = job.evaluation_metrics
        additional_inputs = job.additional_inputs

        all_params = aspects.aspects_all_parameters or []
        o_aspects = aspects.overall_score
        g_aspects = aspects.group_aspects
        new_eval =  []
        questions = question_object.questions
        answers = question_object.answers

        metrics = aspects.metrics



    #######################################################################################################################
        task1 = asyncio.create_task(get_general_details(resume_text,job_title,role_type,domain,level_of_position,department,job_summary,key_responsibilities,candidate_requirements,evaluation_metrics,additional_inputs))
    #######################################################################################################################
        # getting initial phase
        phase_list = job.phase
        if (type(phase_list[0]) is list) and phase_list[0][0] == "Interview":
            if len(phase_list[0]>1):
                initial_phase = phase_list[0][0] +" " + phase_list[0][1]
            else:
                intial_phase = phase_list[0][0]
        else:
            intial_phase = job.phase[0]
        # print("Initial phase: ", intial_phase)

    # checking for job rubrics and job profile
        tries = 0
        while (job_issues == None or job_fixes == None or all_params == None or metrics ==None) and tries < 20:
            await asyncio.sleep(5)
            job = await sync_to_async(get_object_or_404)(JobOpening, id=job_id) #fetch job object corresponding to job_id
            aspects = await sync_to_async(get_object_or_404)(Aspect, job_id= job_id)

            job_issues = job.issues
            job_fixes = job.fixes
            all_params = aspects.aspects_all_parameters
            metrics = aspects.metrics
            tries += 1
            # print(f"tried {tries} times")

        if tries == 20:
            print(f"job issues, job fixes and aspects not created yet, returning candidate without score and feedback")

            candidate = Candidates(
                job = job,
                # name = general_details['personal_info']['name'],
                name = general_details.get('personal_info', {}).get('name', 'no_name'),
                resume = pdf_path,
                general_details = await asyncio.gather(task1),
                phase = intial_phase,
            )

            await sync_to_async(candidate.save)() # save candidate object to database
            # print(f"done with all tasks for {pdf_path}")
    ###############################################################################################################################################################################

        # Run both tasks and store their results properly
        general_details, scores_lookup = await asyncio.gather(
            task1,
            get_score_details(resume_text, job_title, role_type, domain, level_of_position, department, job_summary, key_responsibilities, candidate_requirements, evaluation_metrics, additional_inputs, questions, answers, job_issues, job_fixes, all_params,new_eval, o_aspects, g_aspects, metrics),
        )

        feedback_details = await get_feedback_details(resume_text, job_title, role_type, domain, level_of_position, department, job_summary, key_responsibilities, candidate_requirements, evaluation_metrics, additional_inputs, questions, answers, scores_lookup, metrics)

        score_details = get_final_score(scores_lookup,o_aspects,g_aspects)


        # print(f"done with all LLM response for {pdf_path}")

        candidate = Candidates(
            job = job,
            # name = general_details['personal_info']['name'],
            name = general_details.get('personal_info', {}).get('name', 'no_name'),
            resume = pdf_path,
            general_details = general_details,
            feedback_details = feedback_details["feedback_details"],
            score_details = score_details["score_details"],
            scores_lookup = scores_lookup,
            phase = intial_phase,

        )

        await candidate.asave() # save candidate object to database

        if not job.uploaded:
            job.uploaded = True
            await job.asave()

        print(f"done with all tasks for {pdf_path}")
    except Exception as e:
        print("Error: ", str(e))

###############################################################################################################################################################################
from dotenv import load_dotenv
load_dotenv()
BASE_IP = os.getenv('BASE_IP')

@shared_task(bind = True)
def send_mail(self, candidate_id, shared_with_email, username, shared_with_access_level): 
    to_email = shared_with_email
    subject = "A Candidate Profile Has Been Shared with You"

    profile_link = f"https://{BASE_IP}:5173/Home/cp?id={candidate_id}" ## http://13.201.82.160:5173

    message = f"""
    Dear {shared_with_email},

    {username} has shared a candidate profile with you through our platform.

    Access Level: {shared_with_access_level}

    You can view the profile at the secure link below:
    {profile_link}

    If you received this in error, please contact us at support@yourdomain.com.

    Best regards,  
    Your Platform Team
    """

    send_custom_mail(to_email, subject, message)

################################################################################################

@shared_task(bind=True)
def update_candidates_score(self,job_id):
    print("in task.py update_candidates_score of candidates")
    asyncio.run(a_update_candidates_score(self,job_id))



async def a_update_candidates_score(self,job_id):
        try:
            aspect = await Aspect.objects.aget(job_id = job_id)
            o_aspects = aspect.overall_score
            g_aspects = aspect.group_aspects
            all_candidates = await sync_to_async(list)(Candidates.objects.filter(job_id=job_id))

            for candidate in all_candidates:
                scores_lookup  = candidate.scores_lookup
                score_details = get_final_score(scores_lookup,o_aspects,g_aspects)

                candidate.score_details = score_details["score_details"]

                await candidate.asave() # save candidate object to database

            print("Re scored all candidates succesfully")
        except Exception as e:
            print("Error in re-evaluating candidates: ", str(e))
