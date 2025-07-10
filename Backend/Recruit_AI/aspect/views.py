from .models import *
from utils.authentication_decorator import jwt_required, jwt_required_sync
from django.http import JsonResponse
from job.models import JobOpening
import json
# import asyncio
from asgiref.sync import sync_to_async
from django.views.decorators.http import require_http_methods
import asyncio
from django.core.exceptions import ObjectDoesNotExist

# for llm
from question.agents.o_aspects_agent import O_AspectsAgent
from question.agents.g_aspects_agent import G_AspectsAgent

from question.prompts.o_aspect_prompt import generate_o_aspect_prompt
from question.prompts.g_aspect_prompt import generate_g_aspect_prompt

from question.utils.tool_extract_parameters import extract_parameters,extract_u_parameters

from candidates.tasks import update_candidates_score

####################################################################################################################################################################
async def mark__aspects_status_completed(job):
    await AspectsProcessingStatus.objects.filter(job=job).aupdate(status="completed")

async def generate_aspects(job, job_details):
    try:
        response = {}
        print("inside generate_aspects")
        # Generating overall aspects to evaluate
        prompt1 = generate_o_aspect_prompt(job_details)
        llm1 = O_AspectsAgent()
        response['o_aspects'] = await llm1.run(prompt1)

        o_aspects = extract_parameters(response["o_aspects"]['o_aspects'])

        # Generating groups aspects to evaluate
        prompt2 = generate_g_aspect_prompt(job_details,o_aspects)
        llm2 = G_AspectsAgent()
        response['g_aspects'] = await llm2.run(prompt2)

        response['all_aspects'] = extract_u_parameters(response["o_aspects"],response["g_aspects"])

        # print(response)
    
        # aspects = Aspect(
        #     job = job,
        #     aspects_all_parameters = response['all_aspects'],
        #     overall_score = response['o_aspects']['o_aspects']['overall score'],
        #     group_aspects = response['g_aspects']['g_aspects'],
        # )
        # await sync_to_async(aspects.save)()
        aspects, created = await sync_to_async(Aspect.objects.update_or_create)(
            job=job,
            defaults={
                'aspects_all_parameters': response['all_aspects'],
                'overall_score': response['o_aspects']['o_aspects']['overall score'],
                'group_aspects': response['g_aspects']['g_aspects'],
                'group_aspects_name_list': list(response['g_aspects']['g_aspects'].keys()),
            }
        )

        print("saved aspects successfully")
    except Exception as e:
        print("Error while saving Aspects:", e)

    await mark__aspects_status_completed(job)
    print("Done with aspects generation task")

    return
######################################################################################################################################################################

# helper function
def job_exists(job_id, user):
    return JobOpening.objects.filter(id=job_id,user=user).exists()

async def job_exists_async(job_id, user):
    return await JobOpening.objects.filter(id=job_id, user=user).aexists()

@jwt_required
async def get_job_aspects(request, job_id):
    try:
        exists = await job_exists_async(job_id, request.user)
        
        if not exists:
            return JsonResponse({"error": "This is not your job"}, status = 403)
        try:
            aspects = await Aspect.objects.aget(job_id = job_id)  
        except Aspect.DoesNotExist:
            aspects = None
        tries = 0

        while not aspects and tries<=25:
            print("inside while of get_job_aspects")
            try:
                aspects = await Aspect.objects.aget(job_id = job_id)  
            except Aspect.DoesNotExist:
                aspects = None 
            await asyncio.sleep(3)
            tries = tries +1
            print("trial no. :", tries)
        
        if not aspects:
            print("trial limit completed")
            return JsonResponse({'error' : "trial exceded"}, status = 400)


        response = {
            "overall_score" : aspects.overall_score,
            "group_aspects" : aspects.group_aspects,
            "aspects_all_parameters" : aspects.aspects_all_parameters,
            "aspect_pointer" : aspects.aspect_pointer

        }

        return JsonResponse(response, status = 200)
    
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)


@jwt_required_sync
def add_new_parameter(request, job_id):
    try:
        exists = job_exists(job_id, request.user)
        
        if not exists:
            return JsonResponse({"error": "This is not your job"}, status = 403)
        
        job = JobOpening.objects.get(id = job_id)
        aspects = Aspect.objects.get(job_id = job_id)
        
        data = json.loads(request.body)

        parameter= data.get('parameter')
        evaluation_method = data.get('evaluation_method')

        if not parameter or not evaluation_method:
            return JsonResponse({"error": "Parameter or evaluation_method not provided"}, status = 400)
        

        new_parameter = Parameter(
            job= job,
            parameter =  parameter,
            evaluation_method = evaluation_method,
        )
        new_parameter.save()

        if aspects.aspects_all_parameters is None:
            aspects.aspects_all_parameters = []
        
        aspects.aspects_all_parameters.append(parameter)
        aspects.save()

        return JsonResponse({'message': 'Parameter created and added successfully'}, status=200)
    
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)

@jwt_required
@require_http_methods(["POST"])
async def edit_overall_parameters(request, job_id):
    try:
        exists = await job_exists_async(job_id, request.user)
        
        if not exists:
            return JsonResponse({"error": "This is not your job"}, status = 403)
        
        job = await JobOpening.objects.aget(id = job_id)
        aspects = await Aspect.objects.aget(job_id = job_id)
        
        data = json.loads(request.body)
        edited_overall_parameters = data
        aspects.overall_score = edited_overall_parameters
        await aspects.asave()

        if job.uploaded:
            #calling celery to update_candidates_score
            update_candidates_score.delay(job_id)

        return JsonResponse({"message": "Overall score updated successfully"})
    
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500) 


@jwt_required
@require_http_methods(["POST"])
async def edit_group_aspects(request, job_id):
    try:
        exists = await job_exists_async(job_id, request.user)
        
        if not exists:
            return JsonResponse({"error": "This is not your job"}, status = 403)
        
        job = await JobOpening.objects.aget(id = job_id)
        aspects = await Aspect.objects.aget(job_id = job_id)
        
        data = json.loads(request.body)
        edited_group_aspects = data
        aspects.group_aspects = edited_group_aspects
        await sync_to_async(aspects.save)()
        
        if job.uploaded:
            #calling celery to update_candidates_score
            update_candidates_score.delay(job_id)
        
        return JsonResponse({"message": "group_aspects updated successfully"})
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)
    
@require_http_methods(['GET'])
@jwt_required
async def get_aspects_status(request, job_id):
    try:
        exists = await job_exists_async(job_id, request.user)
        if not exists:
            return JsonResponse({"error": "This is not your job"}, status = 403)
        
        status_obj = await AspectsProcessingStatus.objects.aget(job_id = job_id)
        return JsonResponse({"Status": status_obj.status}, status = 200)
    except ObjectDoesNotExist:
        return JsonResponse({"error": "Apects_status not available"}, status =404)
    except Exception as e:
        return JsonResponse({"error": str(e)}, status=500)
    

