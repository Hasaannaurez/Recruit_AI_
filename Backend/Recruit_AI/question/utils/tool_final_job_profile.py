import json

def final_job_profile(job_title, role_type, domain, job_description, level_of_position, job_details):
    prompt = f"""
### **Job Overview**  
This job profile outlines the critical details and expectations for the role, providing a structured view of its significance, responsibilities, required skills, and industry trends.

#### **Position Details**  
- **Job Title:** {job_title}  
- **Role Type:** {role_type}  
- **Domain:** {domain} 
- **Job Description:** {job_description} 
- **Level of Position:** {level_of_position}  

#### The following structured object represents a comprehensive and data-driven job profile for the given role.
- It captures key details such as business context, core responsibilities, required skills, tools & technologies, industry trends, and future expectations 
{job_details}  
"""
    return prompt.strip()