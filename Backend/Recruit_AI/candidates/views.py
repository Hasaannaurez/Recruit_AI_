from django.shortcuts import render
from .models import *
from job.models import *
from question.models import Question
from aspect.models import *
import json
from question.agents.profile_agent import ProfileAgent
from question.prompts.general_details_prompt import generate_details_prompt
from question.utils.resume_parser import extract_text_from_pdf
from asgiref.sync import sync_to_async
from django.shortcuts import get_object_or_404
import os
from django.views.decorators.http import require_http_methods
from django.views.decorators.csrf import csrf_exempt
from django.conf import settings
from django.http import JsonResponse
from .models import ResumeProcessingStatus
from .signals import all_tasks_completed
from django.db import transaction
from django.db.models import Q
from asgiref.sync import async_to_sync
from django.http import JsonResponse
from django.utils import timezone
from django.utils.timezone import localtime
import time

from rest_framework.decorators import api_view, permission_classes, authentication_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework_simplejwt.authentication import JWTAuthentication
import jwt
from functools import wraps
from utils.authentication_decorator import jwt_required, jwt_required_sync
from utils.verify_google_token import verify_google_token
from utils.tool_generate_presigned_url import generate_presigned_url

from .tasks import scan_candidates, send_mail
########################################################################################################
from django.core.files.storage import default_storage
from django.core.files.base import ContentFile
from storages.backends.s3boto3 import S3Boto3Storage

####################################################################################################################

#helper function
def job_exists(user, job_id):
    return JobOpening.objects.filter(id = job_id, user = user).exists()

def get_job_user(job):
    return job.user

def get_candidate_with_job_and_user(candidate_id):
    return get_object_or_404(Candidates.objects.select_related("job__user"), id = candidate_id)

def get_candidate_user(candidate):
    return candidate.job.user

def return_candidate_access_object(candidate):
    try:
        return CandidateAccess.objects.get(candidate = candidate)
    except CandidateAccess.DoesNotExist:
        return None
    
def get_candidate_created_by_user_count(user):
    return Candidates.objects.filter(job__user=user).count()

def flatten_phases(phase_list):
    flattened = []
    for phase in phase_list:
        if isinstance(phase, list) and phase[0] == "Interview" and len(phase) > 1:
            # Handle nested interview rounds only if there are rounds
            flattened.extend([f"{phase[0]} {round}" for round in phase[1:]])
        elif not isinstance(phase, list) or (isinstance(phase, list) and phase[0] != "Interview"):
            # Otherwise, just append the phase as is
            flattened.append(phase)
    return flattened

def group_aspects_name_list_field(job_id):
    try:
        result = Aspect.objects.filter(job_id=job_id).values_list('group_aspects_name_list', flat=True).first()
        # print(result)
        return result
    except Exception:
        return []
    
# Lock this logic in a transaction
@sync_to_async
def update_resume_limit(job_owner, no_of_uploaded_files, sign=1):
    with transaction.atomic():
        # Lock the row
        resume_limit_object = UserExtendedModel.objects.select_for_update().get(user=job_owner)
        no_of_resumes_left = resume_limit_object.no_resumes_left

        if sign == 1 and (no_of_uploaded_files > no_of_resumes_left):
            # print(f"Resume limit reached, you cannot upload more than {no_of_resumes_left} resumes")
            return {"error": f"Resume limit reached, you cannot upload more than {no_of_resumes_left} resumes"}

        # Update the field and save
        resume_limit_object.no_resumes_left = no_of_resumes_left - sign * no_of_uploaded_files
        resume_limit_object.save()
        return {"success": True}
###########################################################################################################################

# post request to upload multiple resumes
@require_http_methods(["POST"])
@jwt_required
async def upload_resumes(request ):
    start_time = time.time()  # Record the start time
    job_id = request.POST.get("job_id")  # Get job_id from POST data
    
    if not job_id:
        return JsonResponse({"error": "Missing job_id"}, status=400)
    
    user = request.user
    exists = await sync_to_async(job_exists)(user, job_id)

    if not exists:
        return JsonResponse({"error": "this job does not belong to you"}, status = 403)

    job = await sync_to_async(JobOpening.objects.get)(id=job_id)  



    files = request.FILES.getlist("resumes") # Get uploaded files
    user = await sync_to_async(get_job_user)(job) #get user who made the job
    no_of_uploaded_files = len(files)

    result = await update_resume_limit(user, no_of_uploaded_files)

    if "error" in result:
        print("error in resume limit")
        return JsonResponse({"error": result["error"]}, status=400)
    try:
        user_folder = user.username
        job_folder = str(job.job_unique_id)

        
        # #  code for using local media folder :
        # try:
        #     resume_dir = os.path.join(settings.MEDIA_ROOT, "resumes", user_folder, job_folder) # Target directory files will be stored in media/resume/username/job_id
        #     os.makedirs(resume_dir, exist_ok=True) # Create Target directory if not exists
        #     file_paths = []  # Initialize an empty list

        #     for f in files:  # for saving files in target directory
        #         file_path = os.path.join(resume_dir, f.name)
        #         with open(file_path, "wb") as destination:
        #             for chunk in f.chunks():
        #                 destination.write(chunk)
        #         file_paths.append(file_path)  # Add each file path to the list
        # except Exception as e:
        #     print(f"Error while file upload: {e}")
        #     result = await update_resume_limit(user, no_of_uploaded_files, -1)
        #     return JsonResponse({"error": str(e)}, status=500)

        
        # code for s3 bucket
        # Target path for S3:
        s3_folder_path = f"media/resumes/{user_folder}/{job_folder}/"


        file_paths = []

        # Upload files directly to S3
        
        try:
            storage = S3Boto3Storage()
            for f in files:
                s3_file_path_storage = f"{s3_folder_path}{f.name}"
                saved_path = storage.save(s3_file_path_storage, f)

                print(f"Uploaded to S3: {saved_path}")
                
                # accessible_url = storage.url(saved_path)
                file_paths.append(saved_path)
                print("file path at",saved_path)
        except Exception as e:
            print("error in file upload", str(e))
            result = await update_resume_limit(user,no_of_uploaded_files,-1)
            return JsonResponse({'error': str(e)}, status =500)


        n_uploaded = len(file_paths)

        try:
            scan_candidates.delay(job_id,n_uploaded, file_paths)
        except Exception as e:
            print(f"Error occurred : {e}")
            result = await update_resume_limit(user, no_of_uploaded_files, -1)
            return JsonResponse({"error": str(e)}, status=500)
        # Calculate and print the time taken
        end_time = time.time()  # Record the end time
        elapsed_time = end_time - start_time  # Time difference
        # print(f"Total time taken: {elapsed_time:.2f} seconds")
        return JsonResponse({"message": "Processing started"}, status = 200)
    except Exception as e:
        print(f"Error occurred during resume processing: {e}")
        result = await update_resume_limit(user, no_of_uploaded_files, -1)
        return JsonResponse({"error": str(e)}, status=500)


# this is part of signal returning the processing status
@jwt_required
async def check_processing_status(request, job_id):
    try:
        user = request.user
        exists = await sync_to_async(job_exists)(user, job_id)

        if not exists:
            return JsonResponse({"error": "this job does not belong to you"}, status = 403)
        
        status = await ResumeProcessingStatus.objects.aget(job_id=job_id)
        # print("resume processing status:", status.status)
        return JsonResponse({"status": status.status, "n_resumes": status.n_resumes})
    except ResumeProcessingStatus.DoesNotExist:
        return JsonResponse({"status": "idle", "n_resumes": 0})
    except Exception as e:
        print("error while sending status: ", str(e))
        return JsonResponse({'error': str(e)}, status= 500)



# actual
# job_id needed from frontend
# get function through this frontend can fetch all saved candidates
@require_http_methods(["GET"])
@jwt_required
async def candidates_list_old(request, job_id):
    """Fetch all candidates for a given job ID (Async)"""
    job = await sync_to_async(get_object_or_404)(JobOpening,id = job_id)
    candidates = await sync_to_async(list)(Candidates.objects.filter(job_id=job_id).values())  #.values() returns a QuerySet of dictionaries instead of model instances
    job_owner = await sync_to_async(get_job_user)(job)
    if job_owner != request.user:
            return JsonResponse({"error": "Permission denied"}, status=403)
    return JsonResponse({"candidates": candidates})



# for candidate_profile 
# this the best one without shareability
@jwt_required
async def candidate_detail(request, candidate_id):
    # Fetch the candidate asynchronously
    candidate = await sync_to_async(get_object_or_404)(
        Candidates.objects.select_related('job'), id=candidate_id
    )
    candidate_access = await sync_to_async(getattr)(candidate, 'candidate_access', None)
    job_owner = await sync_to_async(get_candidate_user)(candidate)
    # print("job owner:",job_owner.username)
    if job_owner != request.user:
            return JsonResponse({"error": "Permission denied"}, status=403)

    # Update bold_value to False and save the candidate
    candidate.bold_value = False
    await sync_to_async(candidate.save)()

    # Prepare candidate data
    candidate_data = {
        "id": candidate.id,
        # job details form here
        "job_id": candidate.job.id,
        "job_unique_id": candidate.job.job_unique_id,
        "job_title": candidate.job.title,
        "job_role_type": candidate.job.role_type,
        "job_domain": candidate.job.domain,
        "job_level_of_position": candidate.job.level_of_position,
        "job_department": candidate.job.department,
        "job_job_summary": candidate.job.job_summary,
        "job_key_responsibilities": candidate.job.key_responsibilities,
        "job_candidate_requirements": candidate.job.candidate_requirements,
        "job_evaluation_metrics": candidate.job.evaluation_metrics,
        "job_additional_inputs": candidate.job.additional_inputs,
        "job_location": candidate.job.location,
        "job_onsite": candidate.job.onsite,
        "job_salary": candidate.job.salary,
        "job_created_at": candidate.job.created_at,
        "job_is_active": candidate.job.is_active,
        # till here
        # shared cp details:
        "shared_with": candidate_access.shared_with if candidate_access else [],
        "access_level": candidate_access.access_level if candidate_access else [],
        # till here
        "name": candidate.name,
        "resume": candidate.resume.url if candidate.resume else None,  # Return file URL
        "general_details": candidate.general_details,  # JSONField
        # "details": candidate.details,  # JSONField /// earlier
        "scores_lookup" :  candidate.scores_lookup,
        "score_details": candidate.score_details,
        "feedback_details": candidate.feedback_details,
        "comments": candidate.comments, # JSONField
        "updated_at": localtime(candidate.updated_at).strftime("%d %b %Y, %I:%M %p"), 
        "phase": candidate.phase
    }

    return JsonResponse(candidate_data)


@jwt_required
async def share_candidate_profile(request,candidate_id):
    candidate = await sync_to_async(get_object_or_404)(Candidates, id = candidate_id)
    candidate_access_object = await sync_to_async(return_candidate_access_object)(candidate)

    user = request.user
    owner = await sync_to_async(get_candidate_user)(candidate)

    if user != owner:
        return JsonResponse({"error": "Not allowed"}, status = 403)
    
    data = json.loads(request.body)
    # print(data)
    shared_with_email = data['email']
    shared_with_access_level = data["access_level"]

    shared_with_list = candidate_access_object.shared_with if candidate_access_object else []
    access_level_list = candidate_access_object.access_level if candidate_access_object else []

    # print("lengths before appending", len(shared_with_list), len(access_level_list))
    # print(shared_with_list, access_level_list, data['email'])

    if len(shared_with_list) != len(access_level_list):
        return JsonResponse({"error": "Backend error in shared lists"}, status = 400)

    if shared_with_email in shared_with_list:
        # print("Email present")
        index= shared_with_list.index(shared_with_email)
        if access_level_list[index] == shared_with_access_level:
            print("Already shared with the same access level")
        else:
            access_level_list[index] = shared_with_access_level
            # print("Updated Access_level")
    else:
        shared_with_list.append(shared_with_email)
        access_level_list.append(shared_with_access_level)
        # print("lengths after appending", len(shared_with_list), len(access_level_list))

    if not candidate_access_object:
        candidate_access_object = CandidateAccess(
            candidate = candidate,
            user = user,
            shared_with = shared_with_list,
            access_level = access_level_list
        )

    await sync_to_async(candidate_access_object.save)()

    send_mail.delay(candidate_id, shared_with_email, user.username, shared_with_access_level) # calling celery to send mail

    return JsonResponse({"message": "Shared successfully"}, status= 200)


@require_http_methods(["GET"])
@async_to_sync
@jwt_required
async def candidates_list(request):
    # Fetch candidates based on selected job IDs
    job_ids = request.GET.get("job_ids")
    sorted_by = request.GET.get("sorted_by",None)
    job_ids = set(map(uuid.UUID, job_ids.split(","))) if job_ids else set() # making set removes duplicates - [1,2,3,2] goes to [1,2,3]
    # print(job_ids)
    
    is_single_job = len(job_ids)==1
    # print("is_single_job : ",is_single_job, "and sorted_by : ", sorted_by)

    """
    defining sort key:
    1) in case when only one job(corresponding to individual leaderboard page), then if sorted_by is not provided - default value- "o_score" and all the candidates will be sorted using o_score
    2) in case when multiple jobs(global leaderboard page)- as nothing will be provided as sorted_by: default value- "o_score", but this would not be used for sorting , candidates will be sorted according to -updated_at
    """
    sort_key = sorted_by if (is_single_job and sorted_by) else "-updated_at"
    score_key = sorted_by if (is_single_job and sorted_by) else "o_score"
    # print("Sort_key:", sort_key, "and score_key:", score_key)
    # Fetch all job IDs belonging to the authenticated user
    """The lambda function runs synchronously inside sync_to_async,
       which makes it run in a separate thread to avoid blocking the main async event loop"""
    # all_jobs = await sync_to_async(lambda: set(JobOpening.objects.filter(user=request.user).values_list("id", flat=True)))() # Implemantation 1

    # Implementation 2  (both Implementation 1 and Implementation 2 do the same task but 2 is better)
    def get_user_jobs(user):
        return list(JobOpening.objects.filter(user=user).values_list("id", flat=True))
    all_jobs = await sync_to_async(get_user_jobs) (request.user)
    """ 
        values_list("id") returns a list of tuples whereas .values_list("id", flat=True) returns a list
        JobOpening.objects.filter(user=user).values_list("id")    --- Output: [(1,), (2,), (3,)]        
        JobOpening.objects.filter(user=user).values_list("id", flat=True)  --- Output: [1, 2, 3]
        Wrapping it with list(...) ensures that we get a real Python list
        
    """

    # all_jobs - list , job_ids - set 
    """set_name.issubset(list_or_set_name) - valid
       list_name.issubset(list_or_set_name) - invalid  beacause the first(which is being checked for subset must be a set) 
       the second(in which we are looking for the subset can be anything list or set)
       therefore have kept - all_jobs - list , job_ids - set 
    """
    # print(all_jobs)
    # print(job_ids.issubset(all_jobs)) 

    # If job_ids were provided, check if they belong to the user
    if job_ids and not job_ids.issubset(all_jobs):
        return JsonResponse({"error": "One or more job IDs are not accessible by this user"}, status=403)

    # If no job_ids are provided, default to all jobs owned by the user
    if not job_ids:
        job_ids = all_jobs
        # print(job_ids)


    query = Q()
    if not all_jobs: # if there are no jobs yet created by user
        query &= Q(job_id__in=[])  # Ensures no candidates match
    else:
        if job_ids:
            query &= Q(job_id__in=job_ids) # job_id__in=[1,2,3] means:"Find candidates whose job_id (linked job) is in [1,2,3]."


    # Separate sync function for fetching candidates
    def get_candidates():
        return list(
            Candidates.objects.filter(query)
            .select_related("job")
            .order_by('-updated_at')
            .values("id", "name", "phase", "job__title", "job__is_active", "updated_at", "bold_value", "score_details", "general_details")
        )

    candidates = await sync_to_async(get_candidates)()

    #new code
    # Fetch job phases and compute common ones
    def get_jobs_with_phases(user, job_ids):
        return list(JobOpening.objects.filter(user=user, id__in=job_ids).values("id", "phase"))

    jobs_with_phases = await sync_to_async(get_jobs_with_phases)(request.user, job_ids)

    common_phases = None
    for job in jobs_with_phases:
        job_phases = job["phase"]
        
        if isinstance(job_phases, list):
            job_phases = set(flatten_phases(job_phases))
        else:
            job_phases = set()

        if common_phases is None:
            common_phases = job_phases
        else:
            common_phases &= job_phases
    #till here

    # logic for sorting: when only one job is there based on : sort_key
    if is_single_job and sort_key!="-updated_at":
        # print("Sort_key:", sort_key)
        candidates.sort(
            key = lambda x: x["score_details"].get(sort_key, float('-inf')), # float('-inf') --> gives default value as -infinity(negative infinity) if sort_key is not found in score_details
            reverse=True #sorting in decreasing order
        )

    # Rename keys before returning JSON
    formatted_candidates = [
        {  
            "id": c["id"],
            "name": c["name"],
            "phase": c["phase"], # phase 
            "job_title": c["job__title"],  # job_title
            "job_status": c["job__is_active"],  #job_status
            "updated_at": localtime(c["updated_at"]).strftime("%d %b %Y, %I:%M %p"), 
            "bold_value": c["bold_value"],
            "highest_degree": c["general_details"]["education"][0]["degree"],
            # "overall_score": c["score_details"]["o_score"],
            "overall_score": c["score_details"].get(score_key, "N/A"),

        }
        for c in candidates
    ]
    

    # return JsonResponse({"candidates": formatted_candidates})
    return JsonResponse({
        "candidates": formatted_candidates,
        "phases": sorted(common_phases) if common_phases else []
    })




#helper function
# def flatten_phases(phase_list):
#     flattened = []
#     for phase in phase_list:
#         if isinstance(phase, list) and phase[0] == "Interview":
#             # Handle nested interview rounds
#             flattened.extend([f"{phase[0]} {round}" for round in phase[1:]])
#         else:
#             flattened.append(phase)
#     return flattened


@api_view(['GET'])
@permission_classes([IsAuthenticated])
# @jwt_required
def job_data(request):
    """Returns all jobs created by the logged-in user."""
    # print("Authorization header:", request.headers.get('Authorization'))
    user = request.user  # Synchronous access is safe here.
    # print(user.username)
    if not user.is_authenticated:
        return JsonResponse({"error": "User is not authenticated"}, status=401)
    

    jobs = list(
        JobOpening.objects.filter(user=user, pointer__gte=1)
        .values("id", "title", "is_active", "domain", "phase", "pointer")
    )


    # all_phases = set()
    common_phases = None
    formatted_jobs = []

    for job in jobs:
        job_phases = job["phase"]
        
        if isinstance(job_phases, list):  # Ensure it's a list before processing
            job_phases = set(flatten_phases(job_phases))

        else:
            job_phases = set() 

        formatted_jobs.append({
            "job_id": job["id"],
            "job_title": job["title"],
            "job_status": job["is_active"],
            "job_domain": job["domain"]
        })
        
        # all_phases.update(job_phases)

        # Update common_phases with intersection
        if common_phases is None:
            common_phases = job_phases  # First job, initialize with its phases
        else:
            common_phases &= job_phases  # Intersection with next job's phases


    # return JsonResponse({"jobs": formatted_jobs, "phases": sorted(all_phases)})
    return JsonResponse({"jobs": formatted_jobs, "phases": sorted(common_phases) if common_phases else []})




# work in progress

@require_http_methods(["POST"])
@jwt_required
async def edit_candidate(request, candidate_id):
    """
    Allows only authenticated users from the same organization to edit.
    """
    candidate = await sync_to_async(get_candidate_with_job_and_user)(candidate_id)
    # job_owner = await sync_to_async(lambda: candidate.job.user)()

    job_owner = await sync_to_async(get_candidate_user)(candidate)

    if job_owner != request.user:
        return JsonResponse({"error": "You do not have permission to modify this candidate."}, status=403)
    # Parse JSON request
    data = json.loads(request.body)
    candidate.general_details = data.get("general_details", candidate.general_details)
    
    # Save changes
    await sync_to_async(candidate.save)()

    return JsonResponse({"message": "Candidate details updated successfully."})



@require_http_methods(["POST"])
@jwt_required
async def change_phase(request):
    candidate_ids = request.GET.get("candidate_ids")
    if not candidate_ids:
        return JsonResponse({"message": "No candidate IDs provided"}, status=400)

    # Convert candidate IDs to a list of integers
    try:
        candidate_ids = candidate_ids.split(",") # Convert "1,2,3" to a list of strings
        # candidate_ids = [int(cid) for cid in candidate_ids if cid.isdigit()] # convert to integers
        candidate_ids = [uuid.UUID(cid) for cid in candidate_ids]
    except ValueError:
        return JsonResponse({"error": "Invalid candidate IDs"}, status=400)


    # Get final phase from request body
    try:
        body = json.loads(request.body)
        final_phase = body.get("final_phase")
        if not final_phase:
            return JsonResponse({"message": "Final phase not provided"}, status=400)
    except json.JSONDecodeError:
        return JsonResponse({"message": "Invalid JSON payload"}, status=400)

    # Fetch candiadets form the database asynchronously
    candidates = await sync_to_async(list)(Candidates.objects.select_related("job__user").filter(id__in=candidate_ids))

    if not candidates:
        return JsonResponse({"message": "No candidates found with the given IDs"}, status=404)

    def get_job_owners(candidates):
        return {candidate.job.user for candidate in candidates} # using a set to track unique owners

    job_owners = await sync_to_async(get_job_owners)(candidates)

    # if there are multiple job owners corresponding to the ids given , deny access
    if len(job_owners)>1:
        return JsonResponse({"error": "You do not have access to change these candidates"}, status=403)
    
    # Get the single job wner from the set
    job_owner = job_owners.pop() if job_owners else None

    # print("job_owner : ",job_owner)
    # print("User changing phase : ", request.user)

    # Verify if the job owner is the same as the request user
    if job_owner != request.user:
        return JsonResponse({"error": "You do not have permission to modify this candidate."}, status=403)

    # Ensure all candidates are in the same phase
    initial_phase = candidates[0].phase

    # if you want to give a check for same initial phases then uncomment the below two lines
    # if any(c.phase != initial_phase for c in candidates):
    #     return JsonResponse({"message": "Select candidates in the same phase"}, status=400)

    if initial_phase == final_phase:
        return JsonResponse({"message": f"The selected candidates are already in {initial_phase} phase"}, status=400)
    
    for c in candidates:   
        c.phase = final_phase
        c.updated_at = timezone.now()  # Update the timestamp
        c.bold_value = True

    # Bulk update both 'phase' and 'updated_at' fields in the database
    # await sync_to_async(Candidates.objects.bulk_update)(candidates,['phase', 'updated_at', 'bold_value'])
    def update_candidates():
        return Candidates.objects.bulk_update(candidates, ['phase', 'updated_at', 'bold_value'])
    await sync_to_async(update_candidates)()
    
    # print("Phase,updated_at and bold_value updated successfully")
    return JsonResponse({"message": "Phase updated successfully"}, status=200)




@require_http_methods(["POST"])
@jwt_required
async def add_comments(request, candidate_id):
    
    try:
        data  = json.loads(request.body)
        comments = data.get("comments")
        subjects = data.get("subjects")
        candidate = await sync_to_async(get_candidate_with_job_and_user)(candidate_id)
        # job_owner = await sync_to_async(lambda: candidate.job.user)()
        job_owner = await sync_to_async(get_candidate_user)(candidate)

        if job_owner != request.user:
            return JsonResponse({"error": "You do not have permission to modify this candidate."}, status=403)

        if comments is None or comments == "":
            return JsonResponse({"error": "Nothing written in comments"}, status = 400)
        c_comments = candidate.comments
        # print(c_comments["subjects"])
        # print(c_comments["comments"])



        # val = len(c_comments["subjects"])
        # print(val)
        # length = len(subjects)
        # for i in range(val+1, val+length+1):
        #     c_comments["subjects"][val+1] = subjects
        #     c_comments["comments"][val+1] = comments
        val = candidate.value
        # print(val)
        for i in range(len(subjects)):
            c_comments["subjects"][val+1]= subjects[str(i)]
            c_comments["comments"][val+1] = comments[str(i)]
            val = val+1
        candidate.value = val
        # candidate.comments = {"subjects": subjects, "comments": comments}
        await sync_to_async(candidate.save)()

        return JsonResponse({"message":"Comments added successfully"}, status = 200)
    except json.JSONDecodeError:
        return JsonResponse({"error": "Invalid JSON"}, status = 400)
    except Exception as e:
        return JsonResponse({"error": str(e)}, status = 500)
    
@require_http_methods(['POST']) 
@jwt_required
async def delete_comments(request, candidate_id):
    try:
        data = json.loads(request.body)
        indices = data.get("indices")

        if not isinstance(indices, list) or not indices:
            return JsonResponse({"error": "A non-empty list of indices is required."}, status=400)

        # Convert all indices to strings since dictionary keys are strings
        indices = list(map(str, indices))

        candidate = await sync_to_async(get_candidate_with_job_and_user)(candidate_id)
        job_owner = await sync_to_async(get_candidate_user)(candidate)

        if job_owner != request.user:
            return JsonResponse({"error": "You do not have permission to modify this candidate."}, status=403)

        comments_data = candidate.comments  # {'subjects': {...}, 'comments': {...}}

        if "subjects" not in comments_data or "comments" not in comments_data:
            return JsonResponse({"error": "Invalid comment structure."}, status=400)

        # Validate all indices exist in both subjects and comments
        invalid_indices = [
            idx for idx in indices
            if idx not in comments_data["subjects"] or idx not in comments_data["comments"]
        ]
        if invalid_indices:
            return JsonResponse({"error": f"Invalid indices: {invalid_indices}"}, status=400)

        # Delete valid indices
        for index in indices:
            del comments_data["subjects"][index]
            del comments_data["comments"][index]

        candidate.comments = comments_data
        await candidate.asave()

        return JsonResponse({"message": f"Comments at indices {indices} deleted successfully."})

    except Exception as e:
        return JsonResponse({"error": str(e)}, status=500)

@require_http_methods(["POST"])
@jwt_required
async def delete_candidates(request):
    c_ids = request.GET.get("candidate_ids")
    c_ids = set(map(uuid.UUID, c_ids.split(","))) if c_ids else set()
    # print(c_ids)

    if not c_ids:
        return JsonResponse({"error": "No candidates selected"}, status=403)
    
    def get_user_jobs(user):
        return list(JobOpening.objects.filter(user=user).values_list("id", flat=True))
    all_jobs = await sync_to_async(get_user_jobs)(request.user)
    # print(all_jobs)


    def get_user_candidates(all_jobs):
        return list(Candidates.objects.filter(job__in = all_jobs).values_list("id", flat = True))
    all_candidates = await sync_to_async(get_user_candidates)(all_jobs)

    if not c_ids.issubset(all_candidates):
        return JsonResponse({"error": "One or more candidate IDs are not accessible by this user"}, status=403)

    try:
        def delete_c():
            Candidates.objects.filter(id__in = c_ids).delete()   
    
        await sync_to_async(delete_c)()

        return JsonResponse({"message": "Deleted candidates succesfully"}, status=200)
    except Exception as e:
        return JsonResponse({"error": f"Request failed: {str(e)}"}, status=500)    

    

@jwt_required_sync
def get_job_phase(request, job_id):
    user = request.user
    exists =  job_exists(user, job_id)

    if not exists:
        return JsonResponse({"error": "this job does not belong to you"},status = 403)

    job = JobOpening.objects.get(id = job_id)
    job_phases = job.phase
    job_phases = flatten_phases(job_phases)

    # print(job.title,"phase :",job_phases)
    job_title = job.title
    job_unique_id = job.job_unique_id


    return JsonResponse({"phases": job_phases, "job_unique_id": job_unique_id, "job_title": job_title}, status = 200)


def cp_google_access(request):
    if request.method == "POST":
        try:
            body = json.loads(request.body)
            token = body.get('token')
            candidate_id = body.get('candidate_id')
        except json.JSONDecodeError:
            # print("error 1 , Invalid JSON")
            return JsonResponse({'error': 'Invalid JSON'}, status=400)

        if not token:
            # print("error 3 , Token required")
            return JsonResponse({'error': 'Token required'}, status=400)
        
        if not candidate_id:
            # print("error 3 , candidate_id is required")
            return JsonResponse({'error': 'candidate_id is required'}, status=400)
        
        try:
            uuid_obj = uuid.UUID(candidate_id)
        except (ValueError, TypeError):
            # print("error : Invalid UUID format")
            return JsonResponse({'message': 'False'}, status=403)

        email, username = verify_google_token(token)

        # print("user requesting access:", email, username, "for Candidate_id:", candidate_id)

        if not email:
            # print("error 4 , Invalid token, email not found")
            return JsonResponse({'message': 'Invalid token'}, status=403)
        
        try:
            candidate_access_object = CandidateAccess.objects.get(candidate__id=candidate_id)
        except CandidateAccess.DoesNotExist:
            # print("error 5 , CandidateAcess object not found")
            return JsonResponse({'message': 'False'}, status=403)

        shared_with_email_list = candidate_access_object.shared_with or []
        # print("List of emails which has access:",shared_with_email_list)

        if email in shared_with_email_list:
            # print("Has access : True")
            index= shared_with_email_list.index(email)
            # print("Index of email in email_list",index)
            access_level_email_list = candidate_access_object.access_level
            # print(access_level_email_list)
            access_level = access_level_email_list[index]
            # print("Access level for the corresponding user: ",access_level)
            # print("End #############################################")
            return JsonResponse({"message": "True", "access_level": access_level }, status = 200)
        # print("Access denied : False")
        # print("End #############################################")
        return JsonResponse({"message": "False"}, status=403)
    
    
@require_http_methods(["GET"])
def get_shared_candidate_profile(request, candidate_id):
    
    # Fetch the candidate asynchronously
    candidate = get_object_or_404(Candidates.objects.select_related('job'), id=candidate_id)
    # print("Inside get_shared_candidate_profile for Candidate_id:", candidate_id)
    # Prepare candidate data
    candidate_data = {
        "id": candidate.id,
        # job details form here
        "job_id": candidate.job.id,
        "job_unique_id": candidate.job.job_unique_id,
        "job_title": candidate.job.title,
        "job_role_type": candidate.job.role_type,
        "job_domain": candidate.job.domain,
        "job_level_of_position": candidate.job.level_of_position,
        "job_department": candidate.job.department,
        "job_job_summary": candidate.job.job_summary,
        "job_key_responsibilities": candidate.job.key_responsibilities,
        "job_candidate_requirements": candidate.job.candidate_requirements,
        "job_evaluation_metrics": candidate.job.evaluation_metrics,
        "job_additional_inputs": candidate.job.additional_inputs,
        "job_location": candidate.job.location,
        "job_onsite": candidate.job.onsite,
        "job_salary": candidate.job.salary,
        "job_created_at": candidate.job.created_at,
        "job_is_active": candidate.job.is_active,
        # till here
        "name": candidate.name,
        "resume": candidate.resume.url if candidate.resume else None,  # Return file URL
        "general_details": candidate.general_details,  # JSONField
        "score_details": candidate.score_details,  # JSONField
        "feedback_details": candidate.feedback_details,  # JSONField
        "comments": candidate.comments, # JSONField
        "updated_at": localtime(candidate.updated_at).strftime("%d %b %Y, %I:%M %p"), 
        "phase": candidate.phase
    }

    return JsonResponse(candidate_data)



"""
creating function for editing the candidate prifile via shared_user
this function will be called as a POST request
and in the body it should contain:
1) candidate_id
2) Google_token: i will use this token to again check the autherisation for editing
3) updated_general_details

"""
@require_http_methods(["POST"])
def edit_shared_candidate_profile(request):
    data = json.loads(request.body)
    google_token = data.get("token")
    c_id = data.get("candidate_id")
    updated_general_details = data.get("updated_general_details")

    email, username = verify_google_token(google_token)

    shared_object = CandidateAccess.objects.get(candidate_id = c_id)

    shared_email_list = shared_object.shared_with

    if email not in shared_email_list:
        return JsonResponse({"error": "Access denied"}, status = 403)
    
    candidate = Candidates.objects.get(id = c_id)

    candidate.general_details = updated_general_details

    candidate.save()

    # print("Done with editing of general details via shared user - ", "email:", email, "username:", username)

@jwt_required
@require_http_methods(["GET"])
async def get_all_groups(request, job_id):
    try:
        user = request.user
        exists = await sync_to_async(job_exists)(user, job_id)

        if not exists:
            return JsonResponse({"error": "this job does not belong to you"}, status = 403)
        
        group_aspects_name_list = await sync_to_async(group_aspects_name_list_field)(job_id)
        return JsonResponse({"group_aspects_name_list":group_aspects_name_list}, status=200)
    except Exception as e:
        return JsonResponse({"error" : str(e)}, status =400)


def get_resume_url(request, candidate_id):
    try:
        candidate = Candidates.objects.get(id=candidate_id)
        saved_path = candidate.resume
        url = generate_presigned_url(saved_path)
        return JsonResponse({"resume_url: ": url}, status = 200)
    except Exception as e:
        return JsonResponse({"error" : str(e)}, status =400)
