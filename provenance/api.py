from django.http import JsonResponse
from django.shortcuts import get_object_or_404
from .models import Artwork, ProvenanceEvent, Person, ArtType, Medium

from django.db.models import Count

def artwork_list(request):
    artworks = Artwork.objects.all().select_related('medium', 'medium__type')
    
    medium_id = request.GET.get('medium')
    art_type_id = request.GET.get('art_type')
    
    if medium_id:
        artworks = artworks.filter(medium_id=medium_id)
    if art_type_id:
        artworks = artworks.filter(medium__type_id=art_type_id)

    artworks = artworks.annotate(
        event_count=Count('provenance_events', distinct=True)
    )

    data = []
    for art in artworks:
        data.append({
            'id': art.id,
            'name': art.name,
            'medium': art.medium.name if art.medium else '',
            'medium_id': art.medium.id if art.medium else None,
            'art_type': art.medium.type.name if art.medium and art.medium.type else '',
            'art_type_id': art.medium.type.id if art.medium and art.medium.type else None,
            'dimension': art.dimension,
            'image': art.images.first().image.url if art.images.exists() else None,
            'event_count': art.event_count,
            'creation_date': '', 
        })
    return JsonResponse({'results': data})

def art_type_list(request):
    types = ArtType.objects.all().order_by('name')
    data = [{'id': t.id, 'name': t.name} for t in types]
    return JsonResponse({'results': data})

def medium_list(request):
    mediums = Medium.objects.all().select_related('type').order_by('name')
    data = []
    for m in mediums:
        data.append({
            'id': m.id,
            'name': m.name,
            'art_type_id': m.type.id if m.type else None,
            'art_type_name': m.type.name if m.type else ''
        })
    return JsonResponse({'results': data})

def artwork_detail(request, pk):
    art = get_object_or_404(Artwork, pk=pk)
    
def format_provenance_event(event):
    person_name = str(event.person) if event.person else ""
    institution_name = str(event.institution) if event.institution else ""

    actor_name = ""
    if person_name:
        if institution_name:
            actor_name = f"{person_name} ({institution_name})"
        else:
            actor_name = person_name
    elif institution_name:
        actor_name = institution_name
    elif event.auction:
        actor_name = str(event.auction)
    elif event.exhibition:
        actor_name = str(event.exhibition)
    else:
        actor_name = "Unknown"

    return {
        'id': event.id,
        'artwork_id': event.artwork.id,
        'artwork_name': event.artwork.name,
        'sequence': event.sequence_number,
        'type': event.event_type.name if event.event_type else '',
        'date': event.date,
        'person': person_name,
        'institution': institution_name,
        'actor': actor_name,
        'auction': str(event.auction) if event.auction else '',
        'auction_id': event.auction.id if event.auction else None,
        'auction_institution': str(event.auction.institution) if event.auction and event.auction.institution else '',
        'exhibition': str(event.exhibition) if event.exhibition else '',
        'exhibition_id': event.exhibition.id if event.exhibition else None,
        'exhibition_institution': str(event.exhibition.institution) if event.exhibition and event.exhibition.institution else '',
        'certainty': event.get_certainty_display() if event.certainty else '',
        'sources': [str(s) for s in event.sources.all()],
        'notes': event.notes,
    }

def artwork_detail(request, pk):
    art = get_object_or_404(Artwork, pk=pk)

    # Provenance
    events = [format_provenance_event(e) for e in art.provenance_events.all().order_by('sequence_number')]

    data = {
        'id': art.id,
        'name': art.name,
        'medium': art.medium.name if art.medium else '',
        'dimension': art.dimension,
        'creation_date': '', 
        'notes': art.notes,
        'image': art.images.first().image.url if art.images.exists() else None,
        'provenance': events
    }
    return JsonResponse(data)

def person_list(request):
    from django.db.models import Count
    persons = Person.objects.prefetch_related('images').annotate(
        event_count=Count('provenance_events'),
        artwork_count=Count('provenance_events__artwork', distinct=True)
    ).order_by('family_name', 'first_name')
    
    event_type = request.GET.get('event_type')
    if event_type:
        persons = persons.filter(provenance_events__event_type_id=event_type).distinct()

    data = []
    for person in persons:
        data.append({
            'id': person.id,
            'family_name': person.family_name,
            'first_name': person.first_name,
            'birth_date': person.birth_date,
            'death_date': person.death_date,
            'event_count': person.event_count,
            'artwork_count': person.artwork_count,
            'image': person.images.first().image.url if person.images.exists() else None,
        })
    return JsonResponse({'results': data})

def event_type_list(request):
    # Get unique event types from EventType model
    from .models import EventType
    types = EventType.objects.all().order_by('name')
    data = [{'id': t.id, 'name': t.name} for t in types]
    return JsonResponse({'results': data})

def person_detail(request, pk):
    person = get_object_or_404(Person.objects.prefetch_related('images'), pk=pk)
    
    events = []
    for event in person.provenance_events.all().select_related('artwork'):
        events.append(format_provenance_event(event))
        
    data = {
        'id': person.id,
        'family_name': person.family_name,
        'first_name': person.first_name,
        'birth_date': person.birth_date,
        'death_date': person.death_date,
        'biography': person.biography,
        'image': person.images.first().image.url if person.images.exists() else None,
        'events': events,
    }
    return JsonResponse(data)
