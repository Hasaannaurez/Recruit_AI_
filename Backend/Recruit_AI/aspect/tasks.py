from celery import shared_task
import asyncio

from job.models import JobOpening
from question.models import Question
from .models import Aspect


# agents
from question.agents.metrics_agent import MetricsAgent

#prompts
from question.prompts.metrics_prompt import generate_metrics_prompt, generate_metrics_instructions


from question.utils.tool_join_responses import join_responses


@shared_task(bind = True)
def gen_metrics(self, job_id):
    asyncio.run(_gen_metrics(job_id))



async def _gen_metrics(job_id):

    job = await JobOpening.objects.aget(id = job_id)
    question_obj = await Question.objects.aget(job_id = job_id)
    aspect_obj = await Aspect.objects.aget(job_id = job_id)

    
    # Unpack role
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
    questions = question_obj.questions
    answers = question_obj.answers

    # Prepare job details context
    job_details = join_responses(
        job_title, role_type, domain, level_of_position, department,
        job_summary, key_responsibilities, candidate_requirements,
        evaluation_metrics, additional_inputs, questions, answers
    )

    all_params = aspect_obj.aspects_all_parameters
    # print("all_params")
    instructions = generate_metrics_instructions(job_details)
    prompt = generate_metrics_prompt(all_params)
    agent = MetricsAgent(instructions=instructions)
    resp = await agent.run(prompt)

    aspect_obj.metrics = resp
    # print("Saving metrics")
    await aspect_obj.asave()



    

