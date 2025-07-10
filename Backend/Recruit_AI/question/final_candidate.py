import os
import json
import asyncio

# Agents
from agents.profile_agent import ProfileAgent
from agents.score_agent import ScoreAgent
from agents.feedback_agent import FeedbackAgent

# Prompts
from prompts.general_details_prompt import generate_details_prompt
from prompts.score_prompt import generate_score_prompt
from prompts.feedback_prompt import generate_feedback_prompt

# Utils
from utils.resume_parser import extract_text_from_pdf
from utils.tool_final_score import get_final_score
from utils.tool_final_candidate import get_final_candidate

# Directory containing the resumes
RESUME_DIR = r"C:\Users\rithv\Files\prototype2\resume_data\data_scientist"
OUTPUT_FILE = "output.txt"

# Role details
from job_object import datascientist_role

job_title = datascientist_role['job_title']
role_type = datascientist_role['role_type']
domain = datascientist_role['domain']
job_description = datascientist_role['job_description']
level_of_position = datascientist_role['level_of_position']

job_profile = datascientist_role['job_profile']
job_rubrics = datascientist_role['job_rubrics']


#######################################################################################################################

async def get_score_details(general_details,job_profile,job_rubrics):
    prompt = generate_score_prompt(general_details,job_profile,job_rubrics)
    scoreagent = ScoreAgent()
    response = await scoreagent.run(prompt)
    score_details = scoreagent._parse_json_safely(response['score_details'])
    get_final_score(score_details)
    
    return score_details

async def get_feedback_details(general_details,job_profile):
    prompt = generate_feedback_prompt(general_details,job_profile)
    feedbackagent = FeedbackAgent()
    response = await feedbackagent.run(prompt)
    # feedback_details = feedbackagent._parse_json_safely(response['feedback_details'])
    
    # currently feedback_details is still in progress
    feedback_details = {"summary":"","advantages":"","disadvantages":""} # default value
    return feedback_details

async def get_general_details(resume_text,job_title, role_type, domain, job_description, level_of_position):
    prompt = generate_details_prompt(resume_text, job_title, role_type, domain, job_description, level_of_position)
    profileagent = ProfileAgent()
    response = await profileagent.run(prompt)
    
    return profileagent._parse_json_safely(response['general_details'])

async def get_candidate_details(pdf_path,cand_list):
    """Extract and process details from a single resume."""
    # Extract text from resume
    resume_text = extract_text_from_pdf(pdf_path)

    general_details = await get_general_details(resume_text,job_title, role_type, domain, job_description, level_of_position)
    print(f"Done with general details extraction for {pdf_path}")

    # Run both tasks and store their results properly
    score_details, feedback_details = await asyncio.gather(
        get_score_details(general_details, job_profile, job_rubrics),
        get_feedback_details(general_details, job_profile)
    )

    print(f"done with all LLM response for {pdf_path}")

    # clubbing the 3 responses to get the final candidate object
    final_candidate = get_final_candidate(general_details,score_details,feedback_details)

    print(f"done with all tasks for {pdf_path}")

    cand_list.append(final_candidate)
    return


async def process_resumes():
    """Process all resumes in the specified directory concurrently."""
    files = [os.path.join(RESUME_DIR, file) for file in os.listdir(RESUME_DIR)]
    cand_list = []

    # Create tasks without awaiting them immediately
    tasks = [asyncio.create_task(get_candidate_details(file,cand_list)) for file in files]
    
    # Run all tasks concurrently
    await asyncio.gather(*tasks)
    print("All tasks completed")

    with open(OUTPUT_FILE,"w") as file:
        for item in cand_list:
            file.write(json.dumps(item,indent=4))
            file.write("\n")

if __name__ == "__main__":
    asyncio.run(process_resumes())
