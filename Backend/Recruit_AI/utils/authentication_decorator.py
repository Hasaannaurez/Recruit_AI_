import jwt
from functools import wraps
from django.http import JsonResponse, HttpRequest
from django.conf import settings
from asgiref.sync import sync_to_async
from django.contrib.auth.models import User


def jwt_required(func):
    @wraps(func)
    async def wrapped_view(request, *args, **kwargs):
        # auth_header = request.headers.get("Authorization")
        auth_header = getattr(request, 'headers', None)
        if auth_header is None:
            auth_header = request.META

        auth_header  = auth_header.get("Authorization")


        if not auth_header or not auth_header.startswith("Bearer "):
            return JsonResponse({"error": "Authorization header missing or invalid"}, status=401)
        
        token = auth_header.split(" ")[1]
        try:
            payload = jwt.decode(token, settings.SECRET_KEY, algorithms=["HS256"])
            # Wrap the synchronous call:
            user = await sync_to_async(User.objects.get)(id=payload.get("user_id"))
            request.user = user
        except jwt.ExpiredSignatureError:
            return JsonResponse({"error": "Token has expired"}, status=401)
        except jwt.InvalidTokenError:
            return JsonResponse({"error": "Invalid token"}, status=401)
        except User.DoesNotExist:
            return JsonResponse({"error": "User not found"}, status=401)
        
        return await func(request, *args, **kwargs)
    return wrapped_view



# sync funtion for returning user is from token
def jwt_required_sync(func):
    @wraps(func)
    def wrapped_view(request, *args, **kwargs):
        auth_header = request.headers.get("Authorization")
        if not auth_header or not auth_header.startswith("Bearer "):
            return JsonResponse({"error": "Authorization header missing or invalid"}, status=401)
        
        token = auth_header.split(" ")[1]
        try:
            payload = jwt.decode(token, settings.SECRET_KEY, algorithms=["HS256"])
            # Fetch the actual user from the database:
            user = User.objects.get(id=payload.get("user_id"))
            request.user = user
        except jwt.ExpiredSignatureError:
            return JsonResponse({"error": "Token has expired"}, status=401)
        except jwt.InvalidTokenError:
            return JsonResponse({"error": "Invalid token"}, status=401)
        except User.DoesNotExist:
            return JsonResponse({"error": "User not found"}, status=401)
        
        return func(request, *args, **kwargs)
    return wrapped_view