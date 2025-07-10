from django.db import models
from job.models import JobOpening
# Create your models here.
import uuid

class Aspect(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    job = models.OneToOneField(JobOpening, on_delete=models.CASCADE, related_name='aspects')
    aspects_all_parameters = models.JSONField(default =list,null =True, blank=True)
    metrics = models.JSONField(null =True, blank=True)
    overall_score = models.JSONField(default =list,null =True, blank=True)
    group_aspects = models.JSONField(null =True, blank=True)
    group_aspects_name_list = models.JSONField(default=list, null= True, blank=True)
    aspect_pointer = models.IntegerField(default = 0)
    created_at = models.DateTimeField(auto_now_add=True)  # Add created_at field for ordering 

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"Aspects for {self.job.user} for {self.job.title} and Aspects id: {self.id}" 
    

class Parameter(models.Model):
    job = models.ForeignKey(JobOpening, on_delete=models.CASCADE, related_name='new_parameters')
    parameter = models.TextField()
    evaluation_method = models.TextField()

    def __str__(self):
        return self.parameter


class AspectsProcessingStatus(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    job = models.OneToOneField(JobOpening, on_delete=models.CASCADE, related_name='aspects_processing_status')
    status = models.CharField(max_length=15, default="processing")
