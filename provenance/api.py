from django.http import JsonResponse
from django.shortcuts import get_object_or_404
from .models import Artwork, ProvenanceEvent

def artwork_list(request):
    artworks = Artwork.objects.all().select_related('medium')
    data = []
    for art in artworks:
        data.append({
            'id': art.id,
            'title': art.title,
            'medium': art.medium.name if art.medium else '',
            'dimensions': art.dimensions,
            'creation_date': art.creation_date_text,
            'image': art.images.first().image.url if art.images.exists() else None,
        })
    return JsonResponse({'results': data})

def artwork_detail(request, pk):
    art = get_object_or_404(Artwork, pk=pk)
    
    # Provenance
    events = []
    for event in art.provenance.all().order_by('sequence_number'):
        actor_name = str(event.actor) if event.actor else "Unknown"
        events.append({
            'id': event.id,
            'sequence': event.sequence_number,
            'type': event.get_event_type_display(),
            'date': event.display_date or event.date_start,
            'actor': actor_name,
            'role': event.role,
            'certainty': event.get_certainty_display(),
            'source': str(event.source) if event.source else None,
            'notes': event.notes,
        })

    data = {
        'id': art.id,
        'title': art.title,
        'medium': art.medium.name if art.medium else '',
        'dimensions': art.dimensions,
        'creation_date': art.creation_date_text,
        'notes': art.notes,
        'image': art.images.first().image.url if art.images.exists() else None,
        'provenance': events
    }
    return JsonResponse(data)
