from rest_framework import viewsets, permissions, status
from rest_framework.response import Response
from rest_framework.decorators import action
from rest_framework.parsers import MultiPartParser, FormParser
from rest_framework_simplejwt.views import TokenObtainPairView
from django.contrib.auth import login
from .serializers import JobOpeningSerializer, UserRegistrationSerializer
from .models import JobOpening
from candidates.models import Candidates
from rest_framework.permissions import AllowAny
from django.views.decorators.http import require_http_methods

from django.shortcuts import get_object_or_404
import json
from utils.authentication_decorator import jwt_required_sync
from django.http import JsonResponse
from django.db.models import Count


class JobOpeningViewSet(viewsets.ModelViewSet):
    serializer_class = JobOpeningSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return JobOpening.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

    @action(detail=True, methods=['PATCH', 'GET'], url_path='toggle-status')
    def toggle_status(self, request, pk=None):
        """
        Toggle the active status of a job.
        """
        try:
            job = JobOpening.objects.get(pk=pk, user=request.user)
            job.is_active = "inactive" if job.is_active == "active" else "active"
            job.save()
            return Response({'status': 'success', 'is_active': job.is_active}, status=status.HTTP_200_OK)
        except JobOpening.DoesNotExist:
            return Response({'error': 'Job not found'}, status=status.HTTP_404_NOT_FOUND)

class RegistrationView(viewsets.GenericViewSet):
    serializer_class = UserRegistrationSerializer
    permission_classes = [AllowAny]
    
    def create(self, request):
        """
        Register a new user.
        """
        serializer = self.get_serializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save()
            # login(request, user)
            return Response({
                'user': UserRegistrationSerializer(user).data,
                'message': 'User created successfully'
            }, status=status.HTTP_201_CREATED)
        # return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        # Customizing error response
        error_message = next(iter(serializer.errors.values()))[0]  # Extract first error message
        return Response({"error": error_message}, status=status.HTTP_400_BAD_REQUEST)



#helper function
def job_exists(user, job_id):
    return JobOpening.objects.filter(id = job_id, user = user).exists()


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


@jwt_required_sync
def save_1st_form(request):
    data = json.loads(request.body)
    role_definition = data.get('role_definition')

    job = JobOpening(
    user = request.user,
    job_unique_id = data.get('job_unique_id'),
    title = data.get('title'),
    role_type = data.get('role_type'),
    domain = data.get('domain'),
    level_of_position = data.get('level_of_position'),
    department = data.get('department'),
    candidate_requirements = data.get('candidate_requirements'),
    job_summary = role_definition.get('job_summary'),
    key_responsibilities = role_definition.get('key_responsibilities'),
    evaluation_metrics = data.get('evaluation_metrics'),
    additional_inputs = data.get('additional_inputs'),
    )
    
    job.save()

    return JsonResponse({'message': 'Job Created', 'job_id': job.id}, status=200)


@jwt_required_sync
def save_2nd_form(request):
    data = json.loads(request.body)
    job_id = data.get('job_id')

    user = request.user
    exists = job_exists(user, job_id)

    if not exists:
        return JsonResponse({"error": "this Job does not belong to you"}, status = 400)
    
    job = get_object_or_404(JobOpening, id = job_id)

    job.candidates_required = data.get('candidates_required')
    job.location = data.get('location')
    job.onsite = data.get('Onsite')
    phases = flatten_phases(data.get('phase'))
    job.phase = phases
    # print("Phases entered are :", data.get('phase'))
    # print("Saving phases as: ", phases)
    job.salary = data.get('Salary')
    job.pointer = 1

    job.save()

    return JsonResponse({'message': 'Job updated successfully'}, status=200)



@jwt_required_sync
def job_candidate_count(request, job_id):
    if request.method == "GET":
        user = request.user
        exists = job_exists(user, job_id)
        if not exists:
            return JsonResponse({"error": "Not allowed"}, status = 400)
        
        job = get_object_or_404(JobOpening, id = job_id)

        candidates_count = job.candidates.count()
        # print(candidates_count)

        phase_counts = job.candidates.values('phase').annotate(count= Count('id'))

        phase_counts_dict = {entry['phase']: entry['count'] for entry in phase_counts}
        # print(phase_counts_dict)    

        return JsonResponse({
            "total_candidates": candidates_count,
            "phase_counts": phase_counts_dict
        })    

@jwt_required_sync
def home_all_job_details(request):
    if request.method == "GET":
        jobs = JobOpening.objects.filter(user = request.user).order_by('-created_at')

        all_jobs_list = []

        for job in jobs:
            all_phases = flatten_phases(job.phase) if job.phase else []

            candidate_phase_counts = {
                entry['phase']: entry['count']
                for entry in job.candidates.values('phase').annotate(count=Count('id'))
            }

            phase_counts = {phase: candidate_phase_counts.get(phase, 0) for phase in all_phases}

            # Calculate total interview candidates
            interview_total = sum(count for phase, count in phase_counts.items() if phase.startswith("Interview")) if phase_counts else 0
            phase_counts["Interview"] = interview_total

            all_jobs_list.append(
                {
                    "id": job.id,
                    "title": job.title,
                    "job_unique_id": job.job_unique_id,
                    "role_type": job.role_type,
                    "domain": job.domain,
                    "level_of_position": job.level_of_position,
                    "candidates_required": job.candidates_required, 
                    "is_active": job.is_active,
                    "location": job.location,
                    "onsite": job.onsite,
                    "salary": job.salary,
                    "total_candidates": job.candidates.count(),
                    "phase_counts" : phase_counts,
                    "created_at": job.created_at.strftime('%d-%m-%Y %H:%M:%S'),
                    "pointer": job.pointer,

                }
            )
        return JsonResponse(all_jobs_list, safe = False)
    
    else:
        return JsonResponse({"error": "Method not allowed"},status = 400)
    

@jwt_required_sync
def get_phase(request, job_id):
    exists = job_exists(request.user, job_id)
    if not exists:
        return JsonResponse({"error" : "Not Allowed"}, status = 400)
    
    job = JobOpening.objects.get(id= job_id)
    phase = job.phase
    return JsonResponse({"phase": phase}, status =200)



@jwt_required_sync
def get_job_pointer(request, job_id):
    exists = job_exists(request.user, job_id)

    if not exists:
        return JsonResponse({"error": "Not Allowed"}, status = 400)
    
    job = JobOpening.objects.get(id = job_id)
    pointer = job.pointer
    # print("job_pointer: ", pointer)
    return JsonResponse({"Pointer": pointer}, status = 200)


@jwt_required_sync
@require_http_methods(["GET"])
def home_other_details(request):
    try: 
        user = request.user
        jobs = JobOpening.objects.filter(user = request.user)

        total_no_of_jobs = jobs.count()
        total_no_of_candidates =jobs.aggregate(Count('candidates'))

        return JsonResponse({"total_no_of_jobs": total_no_of_jobs, "total_no_of_candidates" : total_no_of_candidates['candidates__count'] }, status = 200)
    except Exception as e:
        print("error : ", e)
        return JsonResponse({"Error": str(e)}, status = 400)