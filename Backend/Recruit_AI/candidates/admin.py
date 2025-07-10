
from django.contrib import admin
from .models import *
class Candidate_Admin(admin.ModelAdmin):
    list_display = ('candidate_id','name', 'job_title', 'user', 'updated_at') # fields to be shown in admin
    readonly_fields = ('updated_at',)  # Ensure updated_at is visible in the detail view as read-only

    def candidate_id(self, obj):
        return obj.id
    candidate_id.short_description = 'Candidate ID'

    # def job_id(self, obj): #bringing the job_id
    #     return obj.job.id
    # job_id.short_description = 'Job ID' # column name in admin

    def job_title(self, obj):  #bringing the Job Title
        return obj.job.title
    job_title.short_description = 'Job_Title' # column name in admin
    job_title.admin_order_field = 'job__title'  # Enables sorting



    def user(self, obj): #bringing the user name
        return obj.job.user
    user.short_description = 'USER'  # column name in admin

    

    def updated_at(self, obj):  #bringing the Job Title
        return obj.updated_at
    updated_at.short_description = 'Updated At' # column name in admin


class Status(admin.ModelAdmin):
    list_display = ('job_title','job_id', 'user', 'status')

    def user(self, obj):
        return obj.job.user
    user.short_description = 'user'  # column name in admin

    def job_id(self, obj): #bringing the job_id
        return obj.job.id
    job_id.short_description = 'Job ID' # column name in admin

    def job_title(self, obj):  #bringing the Job Title
        return obj.job.title
    job_title.short_description = 'Job Title' # column name in admin



admin.site.register(Candidates, Candidate_Admin)
admin.site.register(ResumeProcessingStatus,Status)
admin.site.register(CandidateAccess)