from django.urls import path
from aspect import views
from .views import *


urlpatterns = [
    path('get_job_aspects/<uuid:job_id>/', views.get_job_aspects, name = 'get_job_aspects'), # get_job_aspects
    path('add_new_parameter/<uuid:job_id>/', views.add_new_parameter, name = 'add_new_parameter'), # add_new_parameter
    path('edit_overall_parameters/<uuid:job_id>/', views.edit_overall_parameters, name = 'edit_overall_parameters'), # edit_overall_parameters
    path('edit_group_aspects/<uuid:job_id>/', views.edit_group_aspects, name = 'edit_group_aspects'), # edit_group_aspects
    path('get_aspects_status/<uuid:job_id>/', views.get_aspects_status, name = 'get_aspects_status'), # get_aspects


]
