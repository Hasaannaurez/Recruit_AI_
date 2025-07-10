from django.conf import settings
from django.urls import path
from question import views
from .views import *


urlpatterns = [
    
    # path('questionnaire', GenerateQuestionsView.as_view(), name = 'questionnaire'),
    path('questionnaire', views.generate_questions, name = 'questionnaire'), # generates questions
    # path('fetch-questions/<uuid:job_id>/', FetchQuestionsView.as_view(), name='fetch_questions'),
    path('fetch-questions/<uuid:job_id>/', views.fetch_questions, name='fetch_questions'), # fetch_questions
    # path('fetch-answers/<uuid:job_id>/', FetchAnswersView.as_view(), name='fetch_answers'),
    path('fetch-answers/<uuid:job_id>/', views.fetch_answers, name='fetch_answers'),  # fetch_answers
    # path('save-as-draft/<uuid:job_id>/', SaveAsDraftView.as_view(), name='save_as_draft'),
    path('save-as-draft/<uuid:job_id>/', views.save_answers_as_draft, name='save_as_draft'), # save_answers_as_draft
    # path('save-answers/<uuid:job_id>/', SaveAnswersView.as_view(), name='save_answers'),
    path('save-answers/<uuid:job_id>/', views.save_answers, name='save_answers'), # save_answers
    path('check_status/<uuid:job_id>/', views.check_status, name= "check_question_status"), # check_status currently not used anywhere
    path('issues_fixes_and_aspects/<uuid:job_id>/', views.issues_fixes_and_aspects, name='issues_fixes_and_aspects'), # call for initialising generation of issues_fixes_and_aspects
    path('submit_aspects/<uuid:job_id>/', views.submit_aspects, name='submit_aspects'), # submit aspects
    
]
