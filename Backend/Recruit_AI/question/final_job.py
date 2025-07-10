import json
import asyncio
from agents.job_agent import JobAgent
from agents.rubrics_agent import RubricsAgent
from prompts.job_prompt import generate_job_prompt
from prompts.rubrics_prompt import generate_rubrics_prompt
from utils.tool_final_job_details import final_job_details
from utils.tool_final_job_profile import final_job_profile

async def main():
    # Load JSON data from a file
    with open('job_description.json', 'r') as file:
        data = json.load(file)
    
    for role in data:

        job_title = role['job_title']
        role_type = role['role_type']
        domain = role['domain']
        job_description = role['job_description']
        level_of_position = role['level_of_position']
        questions = role['questions']
        answers = role['answers']

        job_details = final_job_details(job_title, role_type, domain, job_description, level_of_position, questions, answers)
        prompt = generate_job_prompt(job_details)

        jobagent = JobAgent()
        response = await jobagent.run(prompt)

        # added those 5 parameters to the response
        # job_profile should be saved in the database (type = str)
        job_profile = final_job_profile(job_title, role_type, domain, job_description, level_of_position, response['job_details'])


        print(f"input tokens : {response["response"].usage.prompt_tokens}\noutput tokens : {response["response"].usage.completion_tokens}")
        print(f"Job details: \n{job_profile}")
        print("------------------------------------------------------------------------\n")

        rubrics_agent = RubricsAgent()
        rubrics_prompt = generate_rubrics_prompt(job_profile)
        rubrics = await rubrics_agent.run(rubrics_prompt)

        # final_rubrics should be saved to the database (type = dict)
        job_rubrics = jobagent._parse_json_safely(rubrics['rubric_details'])

        print(f"input tokens : {rubrics["response"].usage.prompt_tokens}\noutput tokens : {rubrics["response"].usage.completion_tokens}")
        print(f"Job Rubrics: \n{json.dumps(job_rubrics,indent=4)}")
        print("===================================================================================================================\n")

# Run the async main function
asyncio.run(main())







import json
import asyncio
from agents.issues_agent import IssuesAgent
from agents.fixes_agent import FixesAgent
from prompts.issues_prompt import generate_issues_prompt
from prompts.fixes_prompt import generate_fixes_prompt
from utils.tool_join_responses import join_responses

with open('job_description.json', 'r') as file:
    data = json.load(file)

async def get_response(role):
    response = {}

    job_title = role["job_title"]
    role_type = role["role_type"]
    domain = role["domain"]
    level_of_position = role["level_of_position"]
    department = role["department"]
    job_summary = role["job_summary"]
    key_responsibilities = role["key_responsibilities"]
    candidate_requirements = role["candidate_requirements"]
    evaluation_metrics = role["evaluation_metrics"]
    additional_inputs = role["additional_inputs"]
    questions = role["questions"]
    answers = role["answers"]

    job_details = join_responses(job_title, role_type, domain, level_of_position, department, job_summary, key_responsibilities, candidate_requirements, evaluation_metrics, additional_inputs,questions,answers)

    # Finding issues (if any exist even after HR's clarification)
    prompt1 = generate_issues_prompt(job_details)
    llm1 = IssuesAgent()
    response['issues'] = await llm1.run(prompt1)

    # Fixing those issues
    prompt2 = generate_fixes_prompt(job_details,response['issues'])
    llm2 = FixesAgent()
    response['fixes'] = await llm2.run(prompt2)

    return response

async def main():
    for role in data:
        response = await get_response(role)
        print("Issues:")
        print(f"{response['issues']}")
        print("------------------------------------------------------\n")
        print("Fixes:")
        print(f"{response['fixes']}")
        print("======================================================\n")

# Run the async main function
asyncio.run(main())



import json
import asyncio
from agents.o_aspects_agent import O_AspectsAgent
from agents.g_aspects_agent import G_AspectsAgent
from prompts.o_aspect_prompt import generate_o_aspect_prompt
from prompts.g_aspect_prompt import generate_g_aspect_prompt
from utils.tool_join_responses import join_responses
from utils.tool_extract_parameters import extract_parameters,extract_u_parameters

with open('job_description.json', 'r') as file:
    data = json.load(file)

async def get_response(role):
    response = {}

    job_title = role["job_title"]
    role_type = role["role_type"]
    domain = role["domain"]
    level_of_position = role["level_of_position"]
    department = role["department"]
    job_summary = role["job_summary"]
    key_responsibilities = role["key_responsibilities"]
    candidate_requirements = role["candidate_requirements"]
    evaluation_metrics = role["evaluation_metrics"]
    additional_inputs = role["additional_inputs"]
    questions = role["questions"]
    answers = role["answers"]

    job_details = join_responses(job_title, role_type, domain, level_of_position, department, job_summary, key_responsibilities, candidate_requirements, evaluation_metrics, additional_inputs,questions,answers)

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

    return response

async def main():
    for role in data:
        response = await get_response(role)
        print("All parameters")
        print(response['all_aspects'])
        print("------------------------------------------------------\n")
        print("Overall Aspects:")
        print(f"{response['o_aspects']}")
        print("------------------------------------------------------\n")
        print("Grouped Aspects:")
        print(f"{response['g_aspects']}")
        print("======================================================\n")

# Run the async main function
asyncio.run(main())