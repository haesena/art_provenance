from django.http import JsonResponse
from django.shortcuts import get_object_or_404
from .models import Artwork, ProvenanceEvent, Person, ArtType, Medium, Institution, Interaction, InteractionSource, Source

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
        'sources': [
            {'source': str(ps.source), 'notes': ps.notes}
            for ps in event.provenanceeventsource_set.all().select_related('source')
        ],
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
        event_count=Count('provenance_events', distinct=True),
        artwork_count=Count('provenance_events__artwork', distinct=True),
        interaction_count=Count('interactions_as_entity1', distinct=True) + Count('interactions_as_entity2', distinct=True)
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
            'interaction_count': person.interaction_count,
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
    events.sort(key=lambda e: (e['artwork_name'].lower(), e['sequence']))

    from django.db.models import Q
    from .models import Interaction
    person_interactions = Interaction.objects.filter(
        Q(entity1_person=person) | Q(entity2_person=person)
    ).select_related(
        'entity1_person', 'entity1_institution',
        'entity2_person', 'entity2_institution'
    ).prefetch_related('interactionsource_set__source')
    
    interactions = [format_interaction(i) for i in person_interactions]
        
    data = {
        'id': person.id,
        'family_name': person.family_name,
        'first_name': person.first_name,
        'birth_date': person.birth_date,
        'death_date': person.death_date,
        'biography': person.biography,
        'image': person.images.first().image.url if person.images.exists() else None,
        'events': events,
        'interactions': interactions,
    }
    return JsonResponse(data)

def institution_list(request):
    from .models import Institution, ProvenanceEvent
    from django.db.models import Prefetch

    institutions = Institution.objects.all().order_by('name')
    
    data = []
    for inst in institutions:
        # Artworks directly linked to provenance events with this institution
        direct_events = ProvenanceEvent.objects.filter(institution=inst).select_related('artwork', 'event_type')
        
        # Artworks linked via auctions held at this institution
        auction_events = ProvenanceEvent.objects.filter(auction__institution=inst).select_related('artwork', 'event_type')
        
        # Artworks linked via exhibitions held at this institution
        exhibition_events = ProvenanceEvent.objects.filter(exhibition__institution=inst).select_related('artwork', 'event_type')
        
        # Map artwork_id to {artwork_info, event_types_set}
        artwork_map = {}
        
        all_events = list(direct_events) + list(auction_events) + list(exhibition_events)
        
        for event in all_events:
            art = event.artwork
            if art.id not in artwork_map:
                artwork_map[art.id] = {
                    'id': art.id,
                    'name': art.name,
                    'image': art.images.first().image.url if art.images.exists() else None,
                    'event_types': set()
                }
            if event.event_type:
                artwork_map[art.id]['event_types'].add(event.event_type.name)
        
        artworks_data = []
        for art_id, art_info in artwork_map.items():
            art_info['event_types'] = sorted(list(art_info['event_types']))
            artworks_data.append(art_info)

        from django.db.models import Q
        from .models import Interaction
        interactions_qs = Interaction.objects.filter(
            Q(entity1_institution=inst) | Q(entity2_institution=inst)
        ).select_related(
            'entity1_person', 'entity1_institution',
            'entity2_person', 'entity2_institution'
        ).prefetch_related('interactionsource_set__source')
        
        interactions_data = [format_interaction(i) for i in interactions_qs]
        
        if artworks_data or interactions_data:
            data.append({
                'id': inst.id,
                'name': inst.name,
                'place': inst.place,
                'artworks': artworks_data,
                'artwork_count': len(artworks_data),
                'interactions': interactions_data,
                'interaction_count': len(interactions_data)
            })
            
    return JsonResponse({'results': data})

def auction_list(request):
    from .models import Auction, ProvenanceEvent
    
    auctions = Auction.objects.all().order_by('name')
    
    data = []
    for auction in auctions:
        events = ProvenanceEvent.objects.filter(auction=auction).select_related('artwork', 'event_type')
        
        artwork_map = {}
        for event in events:
            art = event.artwork
            if art.id not in artwork_map:
                artwork_map[art.id] = {
                    'id': art.id,
                    'name': art.name,
                    'image': art.images.first().image.url if art.images.exists() else None,
                    'event_types': set()
                }
            if event.event_type:
                artwork_map[art.id]['event_types'].add(event.event_type.name)
        
        artworks_data = []
        for art_id, art_info in artwork_map.items():
            art_info['event_types'] = sorted(list(art_info['event_types']))
            artworks_data.append(art_info)
            
        if artworks_data:
            data.append({
                'id': auction.id,
                'name': auction.name,
                'date': auction.date,
                'institution': str(auction.institution) if auction.institution else '',
                'artworks': artworks_data,
                'artwork_count': len(artworks_data)
            })
            
    return JsonResponse({'results': data})

def exhibition_list(request):
    from .models import Exhibition, ProvenanceEvent
    
    exhibitions = Exhibition.objects.all().order_by('name')
    
    data = []
    for exhibition in exhibitions:
        events = ProvenanceEvent.objects.filter(exhibition=exhibition).select_related('artwork', 'event_type')
        
        artwork_map = {}
        for event in events:
            art = event.artwork
            if art.id not in artwork_map:
                artwork_map[art.id] = {
                    'id': art.id,
                    'name': art.name,
                    'image': art.images.first().image.url if art.images.exists() else None,
                    'event_types': set()
                }
            if event.event_type:
                artwork_map[art.id]['event_types'].add(event.event_type.name)
        
        artworks_data = []
        for art_id, art_info in artwork_map.items():
            art_info['event_types'] = sorted(list(art_info['event_types']))
            artworks_data.append(art_info)
            
        if artworks_data:
            data.append({
                'id': exhibition.id,
                'name': exhibition.name,
                'date_start': exhibition.date_start,
                'date_end': exhibition.date_end,
                'institution': str(exhibition.institution) if exhibition.institution else '',
                'artworks': artworks_data,
                'artwork_count': len(artworks_data)
            })
            
    return JsonResponse({'results': data})

def event_report(request):
    from .models import ProvenanceEvent
    
    events = ProvenanceEvent.objects.select_related(
        'artwork', 
        'event_type', 
        'person', 
        'institution', 
        'auction', 
    ).prefetch_related(
        'provenanceeventsource_set__source'
    ).order_by('artwork__name', 'sequence_number')
    
    data = []
    for event in events:
        sources = list(event.provenanceeventsource_set.all())
        base_event_data = {
            'event_id': event.id,
            'artwork_id': event.artwork.id,
            'artwork_name': event.artwork.name,
            'sequence_number': event.sequence_number,
            'event_type_id': event.event_type.id if event.event_type else None,
            'event_type_name': event.event_type.name if event.event_type else '',
            'date': event.date,
            'person': str(event.person) if event.person else '',
            'institution': str(event.institution) if event.institution else '',
            'auction': str(event.auction) if event.auction else '',
            'exhibition': str(event.exhibition) if event.exhibition else '',
            'certainty': event.get_certainty_display() if event.certainty else '',
            'notes': event.notes or '',
        }
        
        if not sources:
            base_event_data['id'] = f"{event.id}_0"
            base_event_data['sources'] = ''
            base_event_data['source_notes'] = ''
            data.append(base_event_data)
        else:
            for s in sources:
                event_copy = base_event_data.copy()
                event_copy['id'] = f"{event.id}_{s.id}"
                event_copy['sources'] = str(s.source)
                event_copy['source_notes'] = s.notes or ''
                data.append(event_copy)
        
    return JsonResponse({'results': data})

def export_event_report_excel(request):
    import openpyxl
    from django.http import HttpResponse
    from .models import ProvenanceEvent

    events = ProvenanceEvent.objects.select_related(
        'artwork', 'event_type', 'person', 'institution', 'auction', 'exhibition'
    ).prefetch_related(
        'provenanceeventsource_set__source'
    ).order_by('artwork__name', 'sequence_number')

    wb = openpyxl.Workbook()
    ws = wb.active
    ws.title = "Event Report"

    headers = [
        'Event ID', 'Art ID', 'Artwork Name', 'Sequence #', 'Type ID', 'Event Type',
        'Date', 'Person', 'Institution', 'Auction', 'Exhibition', 'Certainty', 'Notes', 'Sources', 'Source Notes'
    ]
    ws.append(headers)

    for event in events:
        sources = list(event.provenanceeventsource_set.all())
        base_row = [
            event.id,
            event.artwork.id,
            event.artwork.name,
            event.sequence_number,
            event.event_type.id if event.event_type else None,
            event.event_type.name if event.event_type else '',
            event.date,
            str(event.person) if event.person else '',
            str(event.institution) if event.institution else '',
            str(event.auction) if event.auction else '',
            str(event.exhibition) if event.exhibition else '',
            event.get_certainty_display() if event.certainty else '',
            event.notes or '',
        ]
        
        if not sources:
            ws.append(base_row + ['', ''])
        else:
            for s in sources:
                ws.append(base_row + [str(s.source), s.notes or ''])

    response = HttpResponse(content_type='application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')
    response['Content-Disposition'] = 'attachment; filename="event_report.xlsx"'
    wb.save(response)
    return response

def source_list(request):
    from .models import Source, ProvenanceEvent
    
    sources = Source.objects.all().order_by('source')
    
    data = []
    for src in sources:
        events = ProvenanceEvent.objects.filter(sources=src).select_related('artwork', 'event_type')
        
        artwork_map = {}
        for event in events:
            art = event.artwork
            if art.id not in artwork_map:
                artwork_map[art.id] = {
                    'id': art.id,
                    'name': art.name,
                    'image': art.images.first().image.url if art.images.exists() else None,
                    'event_types': set()
                }
            if event.event_type:
                artwork_map[art.id]['event_types'].add(event.event_type.name)
        
        artworks_data = []
        for art_id, art_info in artwork_map.items():
            art_info['event_types'] = sorted(list(art_info['event_types']))
            artworks_data.append(art_info)
            
        if artworks_data:
            data.append({
                'id': src.id,
                'name': src.source,
                'type': src.type,
                'link': src.link,
                'artworks': artworks_data,
                'artwork_count': len(artworks_data)
            })
            
    return JsonResponse({'results': data})

def unused_sources(request):
    from .models import Source, ProvenanceEventSource
    
    # Sources that have no ProvenanceEventSource links
    used_source_ids = ProvenanceEventSource.objects.values_list('source_id', flat=True).distinct()
    unused = Source.objects.exclude(id__in=used_source_ids).order_by('source')
    
    data = []
    for src in unused:
        data.append({
            'id': src.id,
            'name': src.source,
            'type': src.type,
            'link': src.link,
        })
    
    return JsonResponse({'results': data})


def person_lookup(request):
    from django.db.models.functions import Lower
    persons = Person.objects.all().order_by(Lower('family_name'), Lower('first_name'))
    data = []
    for p in persons:
        data.append({
            'id': p.id,
            'name': f"{p.family_name}, {p.first_name}".strip(", "),
        })
    return JsonResponse({'results': data})


def institution_lookup(request):
    from django.db.models.functions import Lower
    institutions = Institution.objects.all().order_by(Lower('name'))
    data = []
    for inst in institutions:
        data.append({
            'id': inst.id,
            'name': inst.name,
            'place': inst.place,
        })
    return JsonResponse({'results': data})


def source_lookup(request):
    from django.db.models.functions import Lower
    sources = Source.objects.all().order_by(Lower('source'))
    data = []
    for s in sources:
        data.append({
            'id': s.id,
            'name': s.source,
        })
    return JsonResponse({'results': data})


def format_interaction(interaction):
    if interaction.entity1_person:
        entity1 = {
            'type': 'person',
            'id': interaction.entity1_person.id,
            'name': str(interaction.entity1_person)
        }
    else:
        entity1 = {
            'type': 'institution',
            'id': interaction.entity1_institution.id,
            'name': str(interaction.entity1_institution)
        }

    if interaction.entity2_person:
        entity2 = {
            'type': 'person',
            'id': interaction.entity2_person.id,
            'name': str(interaction.entity2_person)
        }
    else:
        entity2 = {
            'type': 'institution',
            'id': interaction.entity2_institution.id,
            'name': str(interaction.entity2_institution)
        }

    return {
        'id': interaction.id,
        'entity1': entity1,
        'entity2': entity2,
        'interaction_type': interaction.interaction_type,
        'date': interaction.date,
        'place': interaction.place,
        'notes': interaction.notes,
        'sources': [
            {
                'source_id': its.source.id,
                'source_name': str(its.source),
                'notes': its.notes
            }
            for its in interaction.interactionsource_set.all().select_related('source')
        ]
    }


from django.views.decorators.http import require_http_methods
import json
from django.core.exceptions import ValidationError
from django.db import transaction


@require_http_methods(["GET", "POST"])
def interaction_list_create(request):
    if request.method == "GET":
        interactions = Interaction.objects.all().select_related(
            'entity1_person', 'entity1_institution', 
            'entity2_person', 'entity2_institution'
        ).prefetch_related(
            'interactionsource_set__source'
        ).order_by('-id')
        results = [format_interaction(i) for i in interactions]
        return JsonResponse({'results': results})
        
    elif request.method == "POST":
        if not request.user.is_authenticated:
            return JsonResponse({'error': 'Unauthorized'}, status=401)
        try:
            data = json.loads(request.body)
        except json.JSONDecodeError:
            return JsonResponse({'error': 'Invalid JSON'}, status=400)
            
        entity1_type = data.get('entity1_type')
        entity1_id = data.get('entity1_id')
        entity2_type = data.get('entity2_type')
        entity2_id = data.get('entity2_id')
        interaction_type = data.get('interaction_type')
        date = data.get('date', '')
        place = data.get('place', '')
        notes = data.get('notes', '')
        sources_list = data.get('sources', [])
        
        if not entity1_type or not entity1_id or not entity2_type or not entity2_id or not interaction_type:
            return JsonResponse({'error': 'Missing required fields'}, status=400)
            
        if interaction_type not in ['long term', 'singular']:
            return JsonResponse({'error': 'Invalid interaction type'}, status=400)
            
        try:
            with transaction.atomic():
                interaction = Interaction(
                    interaction_type=interaction_type,
                    date=date,
                    place=place,
                    notes=notes
                )
                
                if entity1_type == 'person':
                    interaction.entity1_person_id = entity1_id
                elif entity1_type == 'institution':
                    interaction.entity1_institution_id = entity1_id
                else:
                    raise ValidationError("Invalid entity1 type")
                    
                if entity2_type == 'person':
                    interaction.entity2_person_id = entity2_id
                elif entity2_type == 'institution':
                    interaction.entity2_institution_id = entity2_id
                else:
                    raise ValidationError("Invalid entity2 type")
                    
                interaction.full_clean()
                interaction.save()
                
                for src_data in sources_list:
                    source_id = src_data.get('source_id')
                    src_notes = src_data.get('notes', '')
                    if source_id:
                        InteractionSource.objects.create(
                            interaction=interaction,
                            source_id=source_id,
                            notes=src_notes
                        )
        except ValidationError as e:
            return JsonResponse({'error': e.message_dict if hasattr(e, 'message_dict') else str(e)}, status=400)
        except Exception as e:
            return JsonResponse({'error': str(e)}, status=400)
            
        return JsonResponse(format_interaction(interaction), status=201)


@require_http_methods(["PUT", "DELETE"])
def interaction_detail_update_delete(request, pk):
    if not request.user.is_authenticated:
        return JsonResponse({'error': 'Unauthorized'}, status=401)
        
    interaction = get_object_or_404(Interaction, pk=pk)
    
    if request.method == "DELETE":
        interaction.delete()
        return JsonResponse({'detail': 'Deleted successfully'}, status=200)
        
    elif request.method == "PUT":
        try:
            data = json.loads(request.body)
        except json.JSONDecodeError:
            return JsonResponse({'error': 'Invalid JSON'}, status=400)
            
        entity1_type = data.get('entity1_type')
        entity1_id = data.get('entity1_id')
        entity2_type = data.get('entity2_type')
        entity2_id = data.get('entity2_id')
        interaction_type = data.get('interaction_type')
        date = data.get('date', '')
        place = data.get('place', '')
        notes = data.get('notes', '')
        sources_list = data.get('sources', [])
        
        if not entity1_type or not entity1_id or not entity2_type or not entity2_id or not interaction_type:
            return JsonResponse({'error': 'Missing required fields'}, status=400)
            
        if interaction_type not in ['long term', 'singular']:
            return JsonResponse({'error': 'Invalid interaction type'}, status=400)
            
        try:
            with transaction.atomic():
                interaction.interaction_type = interaction_type
                interaction.date = date
                interaction.place = place
                interaction.notes = notes
                
                interaction.entity1_person = None
                interaction.entity1_institution = None
                if entity1_type == 'person':
                    interaction.entity1_person_id = entity1_id
                elif entity1_type == 'institution':
                    interaction.entity1_institution_id = entity1_id
                    
                interaction.entity2_person = None
                interaction.entity2_institution = None
                if entity2_type == 'person':
                    interaction.entity2_person_id = entity2_id
                elif entity2_type == 'institution':
                    interaction.entity2_institution_id = entity2_id
                    
                interaction.full_clean()
                interaction.save()
                
                interaction.interactionsource_set.all().delete()
                for src_data in sources_list:
                    source_id = src_data.get('source_id')
                    src_notes = src_data.get('notes', '')
                    if source_id:
                        InteractionSource.objects.create(
                            interaction=interaction,
                            source_id=source_id,
                            notes=src_notes
                        )
        except ValidationError as e:
            return JsonResponse({'error': e.message_dict if hasattr(e, 'message_dict') else str(e)}, status=400)
        except Exception as e:
            return JsonResponse({'error': str(e)}, status=400)
            
        return JsonResponse(format_interaction(interaction))

