from celery import shared_task
import asyncio
from django.shortcuts import get_object_or_404

# models
from aspect.models import Aspect, AspectsProcessingStatus
from job.models import JobOpening
from .models import Question, Question_processing_status
from asgiref.sync import sync_to_async

# for llm agents
from question.agents.o_aspects_agent import O_AspectsAgent
from question.agents.g_aspects_agent import G_AspectsAgent
from .agents.questions_agent import QuestionnaireAgent
from .agents.issues_agent import IssuesAgent
from .agents.fixes_agent import FixesAgent

# for llm prompts
from .prompts.questions_promt import generate_ques_prompt
from .prompts.issues_prompt import generate_issues_prompt
from .prompts.fixes_prompt import generate_fixes_prompt
from question.prompts.o_aspect_prompt import generate_o_aspect_prompt
from question.prompts.g_aspect_prompt import generate_g_aspect_prompt

#utils
from .utils.tool_final_job_profile import final_job_profile
from .utils.tool_final_job_details import final_job_details
from .utils.tool_join_responses import join_responses
from question.utils.tool_extract_parameters import extract_parameters,extract_u_parameters


######################################################################################################################################################################
async def update_processing_status(job):
    await sync_to_async(Question_processing_status.objects.update_or_create)(
        job=job, defaults={"status": "processing"}
    )

async def create_aspects_processing_status(job):
    await sync_to_async(AspectsProcessingStatus.objects.update_or_create)(
        job=job, defaults={"status": "processing"}
    )

async def mark_completed(job):
    await Question_processing_status.objects.filter(job=job).aupdate(status="completed")

async def mark__aspects_status_completed(job):
    await AspectsProcessingStatus.objects.filter(job=job).aupdate(status="completed")



@shared_task(bind=True)
def gen_ques(self, job_id, job_title, role_type, domain, level_of_position, department, job_summary, key_responsibilities, candidate_requirements, evaluation_metrics, additional_inputs):
    print("in task.py generating questions")
    asyncio.run(_gen_ques( job_id, job_title, role_type, domain, level_of_position, department, job_summary, key_responsibilities, candidate_requirements, evaluation_metrics, additional_inputs))


async def _gen_ques(job_id, job_title, role_type, domain, level_of_position, department, job_summary, key_responsibilities, candidate_requirements, evaluation_metrics, additional_inputs):


    job = await JobOpening.objects.aget(id=job_id)

    await update_processing_status(job)

    prompt = generate_ques_prompt(
        job_title, role_type, domain, level_of_position,
        department, job_summary, key_responsibilities,
        candidate_requirements, evaluation_metrics, additional_inputs
    )

    agent = QuestionnaireAgent()
    response = await agent.run(prompt)
    generated_questions = response['questions']

    await Question.objects.acreate(job=job, questions=generated_questions)
    
    ## creating Aspects_processing_status_object
    await create_aspects_processing_status(job)

    await mark_completed(job)
######################################################################################################################################################################


@shared_task(bind=True)
def gen_issues_fixes_and_aspects(self, job_id):
    print("In tasks.py generating issues_fixes_and_aspects")
    asyncio.run(_gen_issues_fixes_and_aspects(job_id))


async def _gen_issues_fixes_and_aspects(job_id):
        job = await JobOpening.objects.select_related("questions").aget(id = job_id)
        questions_object = await Question.objects.aget(job_id = job_id)


        tries = 0
        answers = questions_object.answers
        while answers == None and tries<=20:
            await asyncio.sleep(3)
            questions_object = await Question.objects.aget(job_id = job_id)
            answers = questions_object.answers
            tries += 1
            # print(f"tried {tries} times")
     
        job_title = job.title
        role_type = job.role_type
        domain = job.domain
        level_of_position = job.level_of_position
        department = job.department
        job_summary = job.job_summary
        key_responsibilities = job.key_responsibilities
        candidate_requirements = job.candidate_requirements
        evaluation_metrics = job.evaluation_metrics
        additional_inputs = job.additional_inputs
        questions = questions_object.questions
        answers = questions_object.answers

        job_details = join_responses(job_title, role_type, domain, level_of_position, department, job_summary, key_responsibilities, candidate_requirements, evaluation_metrics, additional_inputs,questions,answers)
        # print("going for generate_issue_fixes, generate_issue_fixes ")
        tasks = [
            asyncio.create_task(generate_aspects(job, job_details)),
            asyncio.create_task(generate_issue_fixes(job, job_details))
        ] 

        await asyncio.gather(*tasks)

        print("Tasks completed of creating issues, fixes and aspects")

    


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

        aspects, created = await sync_to_async(Aspect.objects.update_or_create)(
            job=job,
            defaults={
                'aspects_all_parameters': response['all_aspects'],
                'overall_score': response['o_aspects']['o_aspects']['overall score'],
                'group_aspects': response['g_aspects']['g_aspects'],
                'group_aspects_name_list': list(response['g_aspects']['g_aspects'].keys()),
            }
        )

        # print("saved aspects successfully")
    except Exception as e:
        print("Error while saving Aspects:", e)

    await mark__aspects_status_completed(job)
    print("Done with aspects generation task")


async def generate_issue_fixes(job, job_details):
    try: 
        print("inside generate_issue_fixes")
        response = {}

        # Finding issues (if any exist even after HR's clarification)
        prompt1 = generate_issues_prompt(job_details)
        llm1 = IssuesAgent()
        response['issues'] = await llm1.run(prompt1)

        # Fixing those issues
        prompt2 = generate_fixes_prompt(job_details,response['issues'])
        llm2 = FixesAgent()
        response['fixes'] = await llm2.run(prompt2)

        # print("issue and fixes :")
        # print(response)

        job_id = job.id
        p = job.pointer 
        # print("job_id:", job_id, "...", "job_pointer check a :", p)

        job = await sync_to_async(get_object_or_404)(JobOpening, id=job_id)
        # print("job_pointer check b : ",job.pointer)

        job.issues = response['issues']['issues']
        job.fixes = response['fixes']['fixes']

        await sync_to_async(job.save)()
        # print("issues and Fixes saved in job object successfully")

    except Exception as e:
        print("Error while saving Aspects:", e)

    print("Done with issues and fixes task")


######################################################################################################################################################################
