def generate_g_aspect_prompt(job_details, o_aspects):
    prompt = f"""
Please review the following job details and the overall evaluation parameters that have been generated based on HR’s evaluation metrics and clarifications. Your task is to organize these overall parameters into distinct, meaningful groups (aspects) that reflect different evaluation domains relevant to the job role. Each group should capture a specific domain of evaluation—such as Technical Skills, Soft Skills, or Project Experience—and include the relevant parameters with new, aspect-specific weights (w). Note that penalties are not required in this output.

### Job Details and HR Clarifications:
{job_details}

### Overall Evaluation Parameters:
{o_aspects}

### Your Task:
1. Group the overall evaluation parameters into logical aspects. For example, group parameters related to programming languages, frameworks, and technical proficiency under "Technical Skills"; parameters like analytical thinking and communication under "Soft Skills"; and parameters related to practical experience under "Project Experience". You may also create additional groups if the job description implies other evaluation domains.
2. For each aspect, include all relevant parameters. If additional parameters are implied by the job details and HR clarifications but were not present in the overall list, you may include them as long as they directly align with HR's intended evaluation.
3. For each parameter within an aspect, assign an aspect-specific weight (w) between 0 and 100 that reflects its importance in that domain. These weights are separate from the overall weights and penalties.
4. Ensure that if HR intended that a candidate only needs to be proficient in any one programming language (and not all), then those alternatives are combined into a single parameter.
5. Your output must be strictly in JSON format with the following structure:

{{
  "Aspect Name 1": [
    {{ "par": "Parameter Name", "w": <weight value between 0 and 100> }},
    ...
  ],
  "Aspect Name 2": [
    {{ "par": "Parameter Name", "w": <weight value between 0 and 100> }},
    ...
  ]
}}

### Final Instructions:
- Ensure that the grouping and weights directly reflect the job details, evaluation metrics, and HR clarifications.
- Do not include any penalty values in this output.
- Your output should be valid JSON and strictly adhere to the structure provided above.
"""
    return prompt.strip()
