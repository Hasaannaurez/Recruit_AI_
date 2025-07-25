from google.oauth2 import id_token
from google.auth.transport import requests
from django.conf import settings

def verify_google_token(token):
    try:
        idinfo = id_token.verify_oauth2_token(token, requests.Request(), settings.GOOGLE_CLIENT_ID)
        email = idinfo['email']
        name = idinfo.get('name', '')
        return email, name
    except ValueError:
        return None, None
