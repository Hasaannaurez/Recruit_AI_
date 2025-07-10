def generate_o_aspect_prompt(job_details):
    prompt = f"""
Please review the following job details and HR clarifications. Your task is to extract and decompose all evaluation parameters that HR intends to evaluate from candidate resumes. All evaluations will be based solely on resume information. You must fully understand the job role, candidate requirements, evaluation metrics, and the clarifications provided by HR.

### Job Details Provided:
{job_details}

### Task:
1. Analyze the provided job details, which include:
   - Job Title, Role Type, Domain, Level of Position, Department, Job Summary, Key Responsibilities, Candidate Requirements, Evaluation Metrics, and Additional Inputs.
   - An "Issues & Clarifications" section that includes HR’s Q&A clarifications to resolve any ambiguities.
2. Based on this analysis, extract all evaluation parameters that HR expects to assess. These parameters should cover all dimensions that HR mentioned, such as technical skills, soft skills, project experience, etc.
3. Decompose any broad aspects into specific, measurable parameters. For example, if "Technical Skills" is mentioned, break it down into "Python Proficiency," "JavaScript Proficiency," "Experience with Frameworks," etc.
4. For each parameter, determine:
   - **Parameter Name (par):** The exact name of the evaluation parameter as implied by HR.
   - **Category (c):** Assign one of the following:
       - "n" for non-negotiable (critical, must-have),
       - "e" for essential (important but not disqualifying),
       - "d" for desirable (nice-to-have).
   - **Weight (w):** A number between 0 and 100 indicating the importance of this parameter in the overall score. Typically, non-negotiables should have weights near 90-100, essentials 50-100, and desirables 0-25.
   - **Penalty (p):** A number between 0 and 100 indicating the penalty if evidence for this parameter is missing in a resume. Non-negotiables should incur high penalties (50-100), essentials moderate (0-50), and desirables minimal or zero.
5. Ensure that every parameter is directly derived from the provided HR inputs and clarifications. Do not invent new parameters beyond what is implied by HR’s evaluation metrics.
6. Your final output must be strictly in JSON format with the following structure:

{{
  "overall score": [
    {{
      "par": "Parameter Name",
      "c": "n/e/d",
      "w": <weight value between 0 and 100>,
      "p": <penalty value between 0 and 100>
    }},
    ...
  ]
}}

### Final Instructions:
- Think critically about the job role and HR’s instructions.
- Mimic HR's evaluation perspective exactly.
- Do not include any additional commentary; only output valid JSON in the structure specified.

"""
    return prompt.strip()
