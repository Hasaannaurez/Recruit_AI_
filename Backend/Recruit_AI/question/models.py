from django.db import models
from job.models import JobOpening  #  import for the JobOpening model
import uuid
class Question(models.Model): 
    id = models.UUIDField(primary_key=True, default= uuid.uuid4,editable=False )
    job = models.OneToOneField(JobOpening, on_delete=models.CASCADE, related_name='questions') # connects to corresponding job
    questions = models.JSONField(null = True)
    answers = models.JSONField(blank = True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)  # Add created_at field for ordering 



    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"Question for {self.job.user} for {self.job.title} and question id: {self.id}"  


class Question_processing_status(models.Model):
    id = models.UUIDField(primary_key=True, default= uuid.uuid4,editable=False )
    job = models.ForeignKey(JobOpening, on_delete=models.CASCADE, related_name = "question_process_status")
    status = models.CharField(max_length=20, default="idle")