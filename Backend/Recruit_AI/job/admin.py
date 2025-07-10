from django.contrib import admin
from .models import JobOpening
from django.contrib import admin
from .models import *


class JobOpeningAdmin(admin.ModelAdmin):
    list_display = ('id','title', 'user', 'candidates_required', 'created_at')  # Add more fields if needed

admin.site.register(JobOpening, JobOpeningAdmin)
admin.site.register(UserExtendedModel)


