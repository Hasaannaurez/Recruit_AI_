def generate_issues_prompt(job_details):
    prompt = f"""
Please review the following job details and the Q&A clarifications provided by HR. Note that some issues have already been flagged and answered by HR. Your task is to analyze the job description and the existing Q&A to identify any additional issues that may still hinder the clear and accurate evaluation of candidates from their resumes.

Focus especially on the evaluation criteria, ensuring that every aspect is explicitly defined and can be directly mapped to resume content.

### Job Details and Clarifications:
{job_details}

### Your Analysis Tasks:
1. **Missing Fields:**  
   - Identify any required fields that are missing from the job description (e.g., Job Title, Role Type, Domain, Level of Position, Department, Job Summary, Key Responsibilities, Candidate Requirements, Evaluation Metrics, Additional Inputs).

2. **Unclear or Contradictory Information:**  
   - Flag any vague or ambiguous statements. For example, phrases like "proficient in Python" should include measurable indicators (e.g., years of experience, project examples, or certifications).
   - Detect any contradictions, such as an entry-level job requiring senior-level experience, or missing numerical values (e.g., years of experience).
   - Additionally, review the existing clarifications and flag any unresolved issues or instances where HR's answers do not fully resolve the ambiguity.

3. **Issues in Evaluation Criteria:**  
   - Examine each evaluation metric provided by HR. Ensure that these criteria are clear and can be directly assessed from a candidate's resume.
   - If any criterion is too generic or lacks specific, measurable indicators (e.g., "strong leadership skills" without specifying whether to look for managerial roles or project leadership), flag it and specify what additional details or indicators are needed.
   - Compare the flagged issues in this category with HR’s answers; if HR's responses are insufficient or leave ambiguity, flag those issues again.

### Expected Output Format:
Your response must be strictly in JSON format with the following structure:
{{
  "categories": [
    {{
      "name": "Missing Fields",
      "issues": [ "Issue 1", "Issue 2", ... ]
    }},
    {{
      "name": "Unclear or Contradictory Information",
      "issues": [ "Issue 1", "Issue 2", ... ]
    }},
    {{
      "name": "Issues in Evaluation Criteria",
      "issues": [ "Issue 1", "Issue 2", ... ]
    }}
  ]
}}

Please ensure that your response is valid JSON and strictly adheres to the structure above.
"""
    return prompt.strip()
