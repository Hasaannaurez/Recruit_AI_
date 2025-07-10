# import pdfplumber

# def extract_text_from_pdf(pdf_path):
#     with pdfplumber.open(pdf_path) as pdf:
#         text = ""
#         for page in pdf.pages:
#             text += page.extract_text()
#     return text



import pdfplumber
import requests
from io import BytesIO
from storages.backends.s3boto3 import S3Boto3Storage


def extract_text_from_pdf(pdf_url):
    response = requests.get(pdf_url)
    if response.status_code != 200:
        raise Exception(f"Failed to fetch PDF: {response.status_code}")
    
    storage = S3Boto3Storage()
    response = storage.url(response) 
    pdf_file = BytesIO(response.content)

    with pdfplumber.open(pdf_file) as pdf:
        text = ""
        for page in pdf.pages:
            text += page.extract_text()
    return text
