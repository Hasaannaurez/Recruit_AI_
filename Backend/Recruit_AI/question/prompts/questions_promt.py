def generate_ques_prompt(job_title, role_type, domain, level_of_position, department, job_summary, key_responsibilities, candidate_requirements, evaluation_metrics, additional_inputs):
    prompt = f"""
You have been provided with job details and evaluation criteria from an HR professional. Your task is to analyze the given input and check for **any missing, unclear, or contradictory fields**, with a special focus on **evaluation criteria** since it directly affects candidate scoring.  

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

## **Your Task:**
1. **Check for Missing Fields:**  
   - Ensure all required fields are present:  
     - **Job Title, Role Type, Domain, Level of Position, Department, Job Summary, Key Responsibilities, Candidate Requirements, Evaluation Metrics, Additional Inputs**  
   - If any field is missing, flag it and request HR to provide details.

2. **Detect Unclear or Contradictory Information:**  
   - Identify any **vague**, **incomplete**, or **ambiguous** descriptions (e.g., *"proficient in Python"* without defining proficiency level).  
   - Spot contradictions, such as **entry-level jobs requiring senior-level experience**.  
   - Ensure **numerical values** (e.g., experience in years) are specified where necessary.

3. **Deeply Analyze Evaluation Criteria (Most Important Step)**  
   - HR's **evaluation criteria are NOT about assigning scores but about guiding what to focus on during resume evaluation**.  
   - Ensure that essential vs. desirable aspects are clearly defined.  
   - If a skill or requirement is mentioned, but it's unclear how to assess it from a resume, ask for clarification.  
   - Examples of clarification questions:  
     - *"You mentioned 'strong leadership skills' as a key requirement. How should this be evaluated from a resume—previous managerial roles, leadership in projects, or another indicator?"*  
     - *"The role requires 'expertise in cloud computing.' Should this be validated through certifications, work experience, or project experience?"*  

4. **Generate Clarification Questions for HR:**  
   - Create **specific, concise** questions addressing any missing or unclear points.  
   - Ensure questions **help HR refine evaluation criteria** for accurate AI-based scoring.  

---

These questions will establish the necessary context for the AI assistant to accurately evaluate resumes and shortlist candidates and the questions should be clear, direct, and concise.

## **Response Format:**  
Provide a structured response using the following sections:

### **1. Missing Fields (if any)**  
_List any missing fields from the job description and request clarification._

### **2. Unclear or Contradictory Information (if any)**  
_List any vague or conflicting statements and suggest how they can be improved._

### **3. Issues in Evaluation Criteria (Most Critical)**  
- List any gaps in the evaluation process.  
- Suggest improvements to make the criteria more structured and quantifiable.  
- If weightages are missing, recommend asking HR for them.  

### **4. Clarification Questions for HR**  
_A structured list of targeted questions based on detected issues._

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
---
"""
    return prompt