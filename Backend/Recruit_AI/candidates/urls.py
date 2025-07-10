# candidate.urls
from django.urls import path
from candidates import views
from django.conf import settings
from django.conf.urls.static import static


urlpatterns = [
    path("upload/", views.upload_resumes, name="upload_resumes"), # url for upoloading resumes and processing them
    path("check_status/<uuid:job_id>/", views.check_processing_status, name="check_status"),  # for leaderboard to check the status 
    # path("update_status/<uuid:job_id>/", views.update_processing_status_last, name="update_status"),
    path("candidate/<uuid:candidate_id>/edit/", views.edit_candidate, name="edit_candidate"), # send me general_details in body this is for editing og candidate profile
    path("job_data/", views.job_data, name="job_data"), # 1) do not give pass and id or ids in this url, 2) gives id, title, job_status, domain for all jobs created by user , and also gives common phases list in all jobs, to be called in global leaderboard page
    path("candidates/", views.candidates_list, name="candidates_list"),  # 1) the API call should look like: /candidates/?job_ids=1,2,3 (to get candidates for only some jobs)  or /candidates (to get candidates for all jobs) ||||  2) gives all candidates of the corresponding jobs
    path("candidate/<uuid:candidate_id>/", views.candidate_detail, name="candidate_detail"), # to get candidadate profile
    path("candidates_job/<uuid:job_id>/", views.candidates_list_old, name="candidates_list"), #ignore this for testing purposes
    path("change_phase/", views.change_phase, name= "change_phase"), # the API call should look like: /change_phase/?candidate_ids=1,2,3
    path("add_comments/<uuid:candidate_id>/", views.add_comments, name = "add_comments"),# API call for adding reviews and comments in candidate profile 
    path("delete_candidates/", views.delete_candidates, name = "delete_candidates"),
    path('share_cp/<uuid:candidate_id>/', views.share_candidate_profile, name = "share_candidate_profile"),
    path('get_job_phase/<uuid:job_id>/', views.get_job_phase, name = "get_job_phase"), # get_job_phase in individual leaderboard page

    path('api/cp-google-access/', views.cp_google_access, name = "cp_google_access"), # url for giving access to candidate profile to any external user
    path('get_shared_candidate_profile/<uuid:candidate_id>', views.get_shared_candidate_profile, name = "get_shared_candidate_profile"), # url for giving access to candidate profile to any external user

    path('get_all_groups/<uuid:job_id>', views.get_all_groups, name="get_all_groups"),
    path("delete_comments/<uuid:candidate_id>/", views.delete_comments, name = "delete_comments"),
    path('get_resume_url/<uuid:candidate_id>', views.get_resume_url, name ="get_resume_url")




] + static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)