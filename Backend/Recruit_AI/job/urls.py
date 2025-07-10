#job/urls.py
from django.conf import settings
from django.conf.urls.static import static
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from . import views

# Initialize the router
router = DefaultRouter()

# Register viewsets
router.register(r'jobs', views.JobOpeningViewSet, basename='job')

## for changing active/inactive status , call it as a get request :- /api/jobs/<uuid:job_id>/toggle-status/

# router.register(r'resumes', views.ResumeViewSet, basename='resume')
router.register(r'register', views.RegistrationView, basename='register')

urlpatterns = [
    # API endpoints
    path('api/', include(router.urls)),
    
    # Authentication endpoints
    path('api/token/', TokenObtainPairView.as_view(), name='token_obtain_pair'), #token generation
    path('api/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'), #refresh token
    path('job/save_2nd_form/', views.save_2nd_form, name="save_2nd_form"),  # save_2nd_form
    path('job/job_card_candidate/<uuid:job_id>/', views.job_candidate_count, name = "job_card_candidate"), # for giving total_candidates number and each phase count number
    path('job/home_all_job_details/', views.home_all_job_details, name = "home_all_job_details"), # to get all details of home page 
    path('job/save_1st_form/', views.save_1st_form, name="save_1st_form"), # save_1st_form
    path('job/get_phase/<uuid:job_id>', views.get_phase, name="get_phase"), # gives phase as stored in backend without modifications
    path('job/get_job_pointer/<uuid:job_id>', views.get_job_pointer, name="get_job_pointer"), # get job_pointer for pointer logic
    path('job/home_other_details/', views.home_other_details, name = "home_other_details"), # to get all details of home page 
    
] + static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)