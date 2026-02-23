import io
import json
import tempfile
from django.http import HttpResponse, HttpResponseRedirect
from django.contrib.admin.views.decorators import staff_member_required
from django.core.management import call_command
from django.contrib import messages
from django.urls import reverse
from django.shortcuts import render
from .models import Artwork, Person, ProvenanceEvent, Institution, Auction, Exhibition, Source, ArtType, Medium, EventType, Image

@staff_member_required
def download_db_dump(request):
    """
    Streams a full JSON dump of the database.
    """
    output = io.StringIO()
    # We exclude some system-level models if necessary, but for a full backup we usually want everything.
    # Excluding sessions and content types to avoid noise/collisions on generic relations if possible.
    call_command('dumpdata', indent=2, stdout=output)
    
    response = HttpResponse(output.getvalue(), content_type='application/json')
    response['Content-Disposition'] = 'attachment; filename="database_dump.json"'
    return response

@staff_member_required
def db_sync_management(request):
    """
    Renders the dedicated synchronization tool page.
    """
    return render(request, 'admin/db_sync.html', {
        'title': 'Database Synchronization Tools',
    })

@staff_member_required
def upload_db_dump(request):
    """
    Handles uploading a JSON dump and synchronizing it with the production DB.
    """
    if request.method == 'POST':
        mode = request.POST.get('mode')  # 'merge' or 'overwrite'
        uploaded_file = request.FILES.get('db_file')
        
        if not uploaded_file:
            messages.error(request, "No file uploaded.")
            return HttpResponseRedirect(reverse('admin_sync_db'))

        try:
            # Save uploaded file to a temporary location
            with tempfile.NamedTemporaryFile(delete=False, suffix='.json', mode='wb') as temp_file:
                for chunk in uploaded_file.chunks():
                    temp_file.write(chunk)
                temp_file_path = temp_file.name

            if mode == 'overwrite':
                # destructive operation: clear core models first
                ProvenanceEvent.objects.all().delete()
                Artwork.objects.all().delete()
                Person.objects.all().delete()
                Institution.objects.all().delete()
                Auction.objects.all().delete()
                Exhibition.objects.all().delete()
                Source.objects.all().delete()

            # Load the data
            call_command('loaddata', temp_file_path)
            
            messages.success(request, f"Database synchronized successfully in {mode} mode.")
        except Exception as e:
            messages.error(request, f"Error synchronizing database: {str(e)}")
        
        return HttpResponseRedirect(reverse('admin_sync_db'))
    
    return HttpResponseRedirect(reverse('admin_sync_db'))
