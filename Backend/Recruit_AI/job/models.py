# job models

from django.db import models
from django.contrib.auth.models import User
import os
import uuid


class JobOpening(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    job_unique_id = models.CharField(max_length=200)
    title = models.CharField(max_length=200)    # mandatory
    role_type = models.CharField(max_length=200)   # mandatory
    domain = models.CharField(max_length=200)  # mandatory
    level_of_position = models.CharField(max_length=200)   # mandatory
    department = models.CharField(max_length=200)
    job_summary = models.TextField(null=True, blank=True)
    key_responsibilities = models.TextField(null=True, blank=True)
    candidate_requirements =  models.TextField()
    evaluation_metrics = models.TextField()
    additional_inputs = models.TextField(blank = True, null = True)
    # description = models.TextField()  # mandatory
    candidates_required = models.IntegerField(blank = True, null = True)   # not mandatory
    location = models.JSONField(blank=True, null=True)  # Optional location
    onsite  = models.JSONField(blank = True, null= True)
    phase  = models.JSONField(default=list) # Stores list directly
    salary = models.TextField(blank=True, null=True)  # Optional salary
    created_at = models.DateTimeField(auto_now_add=True)
    is_active = models.CharField(max_length=20,default="active")  # New field for active/inactive status
    pointer = models.IntegerField(default = 0)
    issues = models.JSONField(null=True, blank=True)
    fixes = models.JSONField(null=True, blank=True)
    uploaded =  models.BooleanField(default=False)



    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return self.title


class UserExtendedModel(models.Model):
    id = models.UUIDField(primary_key=True, default = uuid.uuid4, editable = False)
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name = 'user_extended_fields')
    resume_limit = models.IntegerField(default=50)
    no_resumes_left = models.IntegerField(default=50)
    company = models.CharField(max_length=150, blank=True, null=True)


    def __str__(self):
        return self.user.username



