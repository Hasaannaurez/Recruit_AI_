def join_responses(job_title, role_type, domain, level_of_position, department, job_summary, key_responsibilities, candidate_requirements, evaluation_metrics, additional_inputs, questions, answers):
    prompt = f"""
### **Job Details Provided:**
- **Job Title:** {job_title}
- **Role Type:** {role_type}
- **Domain:** {domain}
- **Level of Position:** {level_of_position}
- **Department:** {department}
- **Job Summary:** {job_summary}
- **Key Responsibilities:** {key_responsibilities}
- **Candidate Requirements:** {candidate_requirements}
- **Evaluation Metrics:** {evaluation_metrics}
- **Additional Inputs:** {additional_inputs}

### **Issues & Clarifications:**
The following section lists the issues and ambiguities detected in the job description and evaluation metrics. Each category includes the clarification questions raised by our AI agent. Additionally, any corresponding answers or fixes provided by HR or the company are included alongside each question.
"""
    for category_index, category in enumerate(questions["categories"]):
        prompt += f"\n## {category['name']}:\n"
        for question_index, question in enumerate(category["questions"]):
            key = f"{category_index}-{question_index}"
            answer = answers.get(key, "No answer provided.")
            prompt += f"\n**Q: {question}**\n**A: {answer}**\n"
    
    return prompt.strip()
