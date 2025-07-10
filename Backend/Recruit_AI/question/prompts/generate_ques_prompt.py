def generate_ques_prompt(job_title, role_type, domain, job_description, level_of_position):
    prompt = f"""
We are hiring for the following job opening:
- Job Title: {job_title}
- Role Type: {role_type}
- Domain: {domain}
- Job Description: {job_description}
- Level of Position: {level_of_position}

### **Task**:
Based on the provided job details, generate a focused and efficient set of questions to help the recruiter clarify the most critical requirements of the role.
These questions will establish the necessary context for the AI assistant to accurately evaluate resumes and shortlist candidates.
The questions should be clear, direct, and concise, helping the recruiter gather the essential information about the skills, experience and othe important aspects required for the position.

The response should be in the following JSON format:
{{
  "categories": [
    {{
      "name": "Category Name",
      "questions": [
        "Question 1",
        "Question 2",
        ...
      ]
    }},
    ...
  ]
}}
"""
    return prompt
