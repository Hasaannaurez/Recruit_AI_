# #signals.py

from django.dispatch import Signal
from django.db.models.signals import pre_delete
from django.dispatch import receiver
from django.core.files.storage import default_storage
from .models import Candidates  # Import your model
from storages.backends.s3boto3 import S3Boto3Storage


@receiver(pre_delete, sender=Candidates)
def delete_file_from_s3(sender, instance, **kwargs):
    # Delete the file from S3 before the object is deleted
    storage = S3Boto3Storage()
    if instance.resume:
        print(instance.resume.name)
        storage.delete(instance.resume.name)


all_tasks_completed = Signal()
