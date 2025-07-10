def final_job_details(job_title, role_type, domain, job_description, level_of_position, questions, answers):
    prompt = f"""
### JOB DATA  
(Job Title, Role Type, Domain, Job Description, Level of Position, and any additional information from the recruiter)  

Job Title: {job_title}  
Role Type: {role_type}  
Domain: {domain}  
Job Description: {job_description}  
Level of Position: {level_of_position}  

Below are the HR’s responses to detailed questions about the job role:  
"""
    
    for category_index, category in enumerate(questions["categories"]):
        prompt += f"\n## {category['name']}\n"
        for question_index, question in enumerate(category["questions"]):
            key = f"{category_index}-{question_index}"
            answer = answers.get(key, "No answer provided.")
            prompt += f"\n**Q: {question}**\nA: {answer}\n"
    
    return prompt.strip()