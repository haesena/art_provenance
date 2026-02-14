"""
URL configuration for config project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/6.0/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.contrib import admin
from django.urls import path
from django.conf import settings
from django.conf.urls.static import static

from provenance import api, auth_api

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/artworks/', api.artwork_list),
    path('api/artworks/<int:pk>/', api.artwork_detail),
    path('api/persons/', api.person_list),
    path('api/persons/<int:pk>/', api.person_detail, name='person-detail'),
    path('api/event-types/', api.event_type_list, name='event-type-list'),
    path('api/art-types/', api.art_type_list, name='art-type-list'),
    path('api/mediums/', api.medium_list, name='medium-list'),
    
    # Auth API
    path('api/auth/csrf/', auth_api.get_csrf_token),
    path('api/auth/login/', auth_api.api_login),
    path('api/auth/logout/', auth_api.api_logout),
    path('api/auth/me/', auth_api.api_me),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
