def generate_fixes_prompt(job_details, issues):
    prompt = f"""
Please review the following job details and the Q&A clarifications provided by HR, along with the list of issues flagged by the Issues Agent. Your task is to provide concrete fixes by mimicking HR’s perspective. For any missing fields, supply the information as HR would have provided it. For any unclear or contradictory information, offer clear clarifications by defining measurable resume indicators. For each issue in the evaluation criteria, propose specific ways to evaluate these aspects from resumes, while preserving HR’s original evaluation intentions.

### Job Details and Clarifications:
{job_details}

### Flagged Issues:
{issues}

### Your Task:
1. **Missing Fields:**  
   - Provide the complete information for any missing fields as HR would, filling in the required content.
  
2. **Unclear or Contradictory Information:**  
   - Clarify any ambiguous or contradictory statements by specifying measurable indicators (e.g., for "proficient in Python", indicate a minimum of 1-2 years of experience, relevant projects, or certifications).
  
3. **Issues in Evaluation Criteria:**  
   - Propose specific resume-based evaluation suggestions that align with HR’s intended evaluation aspects. For instance, for "strong analytical thinking", recommend looking for evidence of data analysis projects, research work, or quantifiable problem-solving achievements.

### Expected Output Format:
Your output must be strictly in JSON format with the following structure:
{{
  "categories": [
    {{
      "name": "Missing Fields",
      "fixes": [ "Fix for missing field 1", "Fix for missing field 2", ... ]
    }},
    {{
      "name": "Unclear or Contradictory Information",
      "fixes": [ "Fix for ambiguous statement 1", "Fix for contradictory statement 2", ... ]
    }},
    {{
      "name": "Issues in Evaluation Criteria",
      "fixes": [ "Fix for evaluation metric 1", "Fix for evaluation metric 2", ... ]
    }}
  ]
}}

Please ensure your response is valid JSON and strictly adheres to the structure above.
"""
    return prompt.strip()
