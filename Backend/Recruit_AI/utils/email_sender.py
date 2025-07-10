from django.core.mail import send_mail
from django.conf import settings
import smtplib
import os

def send_custom_mail(to_email, subject, message):
    print("Sending mail")
    try:
        send_mail(
            subject,
            message,
            settings.EMAIL_HOST_USER,
            [to_email],
            fail_silently=False,
        )
    except smtplib.SMTPAuthenticationError as e:
        print("SMTP Authentication Error")
        print("EMAIL_HOST_USER:", os.getenv("EMAIL_HOST_USER"))
        print("EMAIL_HOST_PASSWORD:", os.getenv("EMAIL_HOST_PASSWORD"))
        print("Full error:", e)
        raise e  # optionally re-raise if you want it to crash