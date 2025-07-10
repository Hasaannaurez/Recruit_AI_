# Create your models here.
from django.db import models
from job.models import JobOpening  #  import for the JobOpening model
from django.dispatch import Signal
import os 
from django.conf import settings
from django.contrib.auth.models import User
import uuid

def resume_upload_path(instance, filename):
    """Generate file path for new resume upload"""
    user_folder = instance.job.user
    job_folder = f"{instance.job.id}"
    return os.path.join("resumes", user_folder, job_folder, filename)


def default_comments():
    return {"subjects": {}, "comments": {}}


class Candidates(models.Model): 
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    job = models.ForeignKey(JobOpening, on_delete=models.CASCADE, related_name='candidates') # connects to corresponding job
    name = models.CharField(max_length=200)
    resume = models.FileField(upload_to=resume_upload_path, max_length=500) # giving custom path in resume_upload_path
    general_details = models.JSONField(blank = True, null=True)
    feedback_details = models.JSONField(blank = True, null=True)
    scores_lookup = models.JSONField(null=True, blank=True)
    score_details = models.JSONField(blank=True, null = True) # this will store the score details
    updated_at = models.DateTimeField(auto_now_add=True)  # Add created_at field for ordering 
    bold_value  = models.BooleanField(default=True)
    phase = models.CharField(max_length=50, default='new_applicant')
    comments = models.JSONField(default= default_comments) # this will store all the added comments in candidate profile
    value = models.IntegerField(default= 0)

    def __str__(self):
        return self.name 
    # PHASE_CHOICES = [
    #     ('new_applicant', 'New Applicant'),
    #     ('in_review', 'In Review'),
    #     ('interview', 'Interview'),
    #     ('offered', 'Offered'),
    #     ('hired', 'Hired'),
    #     ('rejected', 'Rejected'),
    # ]
    


class CandidateAccess(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    candidate = models.OneToOneField(Candidates, on_delete=models.CASCADE, related_name = "candidate_access")
    user = models.ForeignKey(User, on_delete= models.CASCADE) # Owner who shared the access
    shared_with = models.JSONField(default = list, null = True, blank=True) # Emails of the person with whom access is shared
    access_level = models.JSONField(default = list, null=True,blank = True)  #(view, edit)

    def __str__(self):
        return f"Job_Id: {self.candidate.job.id}, Candidate_Id: {self.candidate.id}"

# Track processing status per job
class ResumeProcessingStatus(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    job = models.OneToOneField(JobOpening, on_delete=models.CASCADE, related_name='general_details_processing_status')
    status = models.CharField(max_length=20, default="idle")
    n_resumes = models.IntegerField(default=0)

    def __str__(self):
        return self.status