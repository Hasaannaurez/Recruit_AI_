def generate_details_prompt(resume_text):
    prompt = f"""
Below is the complete text of a candidate's resume. Your task is to extract all the details from the resume and organize the information into the JSON structure provided. Ensure that every detail from the resume is captured accurately and contextually. If a section is missing, return that section with empty values.

### Resume Text:
{resume_text}

# === Early Exit Instructions ===
If `resume_text` is **null**, **empty**, **only whitespace**, or clearly **not a resume**, immediately return a JSON object with every field present in the following structure, setting all string fields to empty strings (`""`) and all lists to empty lists (`[]`). Do not fabricate any information or include placeholder names.

### Extract and Format the Resume Details into the Following JSON Structure:

{{
  "personal_info": {{
    "name": "",
    "contact_details": [
      {{ "email": "" }},
      {{ "phone": "" }},
      {{ "linkedin": "" }},
      {{ "portfolio": "" }},
      {{ "other": "" }}
    ],
    "location": ""
  }},
  "profile_summary": "",
  "highest_degree": "",
  "education": [
    {{
      "degree": "",
      "institution": "",
      "graduation_year": "",
      "grade": "",
      "highlights": [""]
    }}
  ],
  "work_experience": [
    {{
      "job_title": "",
      "company": "",
      "duration": "",
      "technologies": [""],
      "highlights": [""],
      "short_summary": "",
      "achievements": [""]
    }}
  ],
  "projects": [
    {{
      "title": "",
      "technologies": [""],
      "short_summary": "",
      "description": "",
    }}
  ],
  "skills": {{
    "technical_skills": [
      {{ "Programming languages": [""] }},
      {{ "frameworks": [""] }},
      {{ "tools": [""] }},
      {{ "databases": [""] }}
    ],
    "soft_skills": [""],
    "domain_skills": [""]
  }},
  "certifications": [
    {{
      "name": "",
      "organization": "",
      "year": ""
    }}
  ],
  "key_achievements": [""],
  "additional_info": [""],
}}

### Important:
- Capture all information from the resume exactly as presented.
- Preserve the context, formatting cues, and details (including tables and bullet points if present).
- Do not add or remove any keys from the JSON structure.
- Return only valid JSON in your final output.
"""
    return prompt.strip()


def generate_details_instructions(job_title, role_type, domain, level_of_position, 
                                  department, job_summary, key_responsibilities, 
                                  candidate_requirements, evaluation_metrics, additional_inputs):
    instructions = f"""
### Context and Background
You are an AI-powered Profile Agent tasked with extracting and formatting detailed information from a candidate's resume. Your extraction must be fully tailored to the specific job role for which the candidate is being considered. The job description provided below defines the role requirements, expectations, and evaluation metrics that HR uses to shortlist candidates.

### 🚨 Early Exit for Missing, Invalid, or Non-Resume Input
If the provided resume text is **null**, **empty**, **only whitespace**, or contains clearly **non-resume content** (e.g., random gibberish, lorem ipsum, generic documents), **do not attempt any extraction or hallucinate details**. Instead:
1. Immediately return the full JSON schema (as defined below) with each field set to its empty default.
2. Do not include any placeholder names (e.g., John Doe) or fabricate information.

### Job Description Summary:
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

### Your Objectives:
1. **Validate Resume Text**
   - Check for null, empty, whitespace-only, or obviously non-resume content.
   - If invalid, perform the early exit as described above.

2. **Extract and Structure Resume Details:**
   - Parse the resume text and accurately segment the content into standard sections.
   - The output must be structured in the JSON format required by HR.

3. **Sections to Extract:**
   You must extract the following sections (populate missing sections with empty values or empty arrays):
   
   - **Personal Information:**
     - **Purpose:** Quickly identify the candidate and their contact information.
     - **Details to Extract:** 
       - **Name:** The candidate's full name.
       - **Contact Details:** Key channels such as email, phone number, LinkedIn profile URL, portfolio URL, and any other relevant professional links.
       - **Location:** City, state, and/or country.
   
   - **Profile Summary:**
     - **Purpose:** Provide a brief snapshot of the candidate's overall profile, highlighting their core strengths, career objectives, and **suitability** for the role.
   
   - **Education:**
     - **Purpose:** Detail the candidate's formal academic training and achievements that support their technical credentials.
     - **Details to Extract:** 
       - **Highest Degree:** E.g., Bachelor's, Master's, or Ph.D. in the relevant field (e.g., Computer Science).
       - **Institution:** Name of the college or university attended.
       - **Graduation Year:** When the degree was or will be completed.
       - **Grade:** GPA or other grade indicators if provided.
       - **Highlights:** Any special recognitions, honors, relevant coursework, or academic projects that underscore the candidate's academic strengths during that education.
   
   - **Work Experience:**
     - **Purpose:** Demonstrate the candidate's professional background and practical application of technical skills.
     - **Details to Extract:** 
       - **Job Title:** The position held.
       - **Company:** Name of the organization.
       - **Duration:** The period during which the candidate held the position.
       - **Technologies Used:** Specific programming languages, software, tools, or frameworks applied.
       - **Highlights:** Key responsibilities, major tasks, or projects handled.
       - **Short Summary:** A brief overview summarizing the overall responsibilities and impact.
       - **Achievements:** Measurable outcomes or notable contributions (e.g., performance improvements, awards).
       - **Important:** Ensure that you extract **all** work experience entries present in the resume—do not stop after the first one. There may be multiple entries across different sections or pages.

   - **Projects:**
     - **Purpose:** Showcase hands-on, practical experience through academic, personal, or professional projects that demonstrate technical proficiency and problem-solving skills.
     - **Details to Extract:** 
       - **Title:** Name of the project.
       - **Technologies Used:** Tools, languages, frameworks, or methodologies employed.
       - **Short Summary:** A brief overview of the project's purpose and key outcomes.
       - **Detailed Description:** An in-depth explanation covering methodologies, technical implementation, and outcomes to illustrate the project's complexity and the candidate's contribution.
       - **Important:** Ensure that you extract **all** relevant project entries present in the resume—do not stop after the first one. There may be multiple entries across different sections or pages.
   
   - **Skills:**
     - **Purpose:** Provide a quick reference to the candidate's competencies relevant to the role.
      - **Technical Skills:** A list of programming languages, frameworks, tools, databases, and other technologies.
      - **Soft Skills:** Key interpersonal skills such as communication, teamwork, and problem-solving.
      - **Domain Skills:** Specific skills applicable to the industry or role beyond general technical knowledge.
   
   - **Certifications:**
     - **Purpose:** Validate the candidate's expertise with recognized qualifications.
   
   - **Key Achievements / Awards:**
     - **Purpose:** Highlight significant accomplishments that distinguish the candidate and proves the potential **relevant** to the role.
   
   - **Additional Information:**
     - **Purpose:** Capture any extra details or activities done by candidate that are relevant to the role and proves candidates potential, experience and skills.
   
4. **Context-Sensitive Extraction:**
   - The extraction must be fully guided by the above job description. Ensure no context is lost even if text is presented in tables, bullet points, or other formats.
   
5. **Output Format Requirement:**
   Your output must be in valid JSON format that strictly adheres to the structure required in prompt. If a section is missing in the resume, output empty values (e.g., empty strings, empty arrays) for that section.

### Final Notes:
- Ensure you extract information without losing any context, including text in various formats (tables, bullet points, etc.).
- Ensure you extract all the information from resume relevant to the role and don't miss any details.
- The profile should be concise yet detailed enough for HR to evaluate the candidate in the very short screening time.
- Do not add or remove sections from the schema; if a section is not present in the resume, output it as empty.
- Do not repeat the same points in multiple sections

"""
    return instructions.strip()
