import json
from django.contrib.auth import authenticate, login, logout
from django.http import JsonResponse
from django.views.decorators.csrf import ensure_csrf_cookie
from django.views.decorators.http import require_http_methods
from django.contrib.auth.models import User

@ensure_csrf_cookie
@require_http_methods(["GET"])
def get_csrf_token(request):
    """
    Sets the CSRF cookie and returns a simple success message.
    """
    return JsonResponse({'detail': 'CSRF cookie set'})

@require_http_methods(["POST"])
def api_login(request):
    """
    Validates credentials and logs in the user.
    """
    try:
        data = json.loads(request.body)
        username = data.get('username')
        password = data.get('password')
    except json.JSONDecodeError:
        return JsonResponse({'error': 'Invalid JSON'}, status=400)

    user = authenticate(request, username=username, password=password)
    if user is not None:
        login(request, user)
        return JsonResponse({
            'username': user.username,
            'email': user.email,
            'is_authenticated': True,
            'is_staff': user.is_staff,
        })
    else:
        return JsonResponse({'error': 'Invalid credentials'}, status=401)

@require_http_methods(["POST"])
def api_logout(request):
    """
    Logs out the user.
    """
    logout(request)
    return JsonResponse({'detail': 'Logged out successfully'})

@require_http_methods(["GET"])
def api_me(request):
    """
    Returns the current logged-in user's information.
    """
    if request.user.is_authenticated:
        return JsonResponse({
            'username': request.user.username,
            'email': request.user.email,
            'is_authenticated': True,
            'is_staff': request.user.is_staff
        })
    return JsonResponse({'is_authenticated': False}, status=200)
