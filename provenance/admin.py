from django.contrib import admin
from django.db import models
from django.forms import Textarea
from django.contrib.contenttypes.admin import GenericTabularInline
from .models import (
    Person, Institution, InstitutionType, ArtType, Artwork,
    ArtworkGroup, Source, ProvenanceEvent, ArtworkRelationship,
    Image, Medium, Auction, AuctionPerson, Exhibition, EventType
)

class ImageInline(GenericTabularInline):
    model = Image
    extra = 1

class ProvenanceEventInline(admin.TabularInline):
    model = ProvenanceEvent
    extra = 1

@admin.register(Person)
class PersonAdmin(admin.ModelAdmin):
    list_display = ('family_name', 'first_name', 'birth_date', 'death_date')
    search_fields = ('family_name', 'first_name')
    inlines = [ImageInline]

@admin.register(InstitutionType)
class InstitutionTypeAdmin(admin.ModelAdmin):
    pass

@admin.register(EventType)
class EventTypeAdmin(admin.ModelAdmin):
    pass

@admin.register(Institution)
class InstitutionAdmin(admin.ModelAdmin):
    list_display = ('name', 'type', 'place')
    list_filter = ('type',)
    search_fields = ('name',)
    inlines = [ImageInline]
    fields = ('name', 'type', 'place', 'start_date', 'end_date', 'notes')

class AuctionPersonInline(admin.TabularInline):
    model = AuctionPerson
    extra = 1

@admin.register(Auction)
class AuctionAdmin(admin.ModelAdmin):
    list_display = ('name', 'date', 'institution')
    search_fields = ('name', 'notes')
    inlines = [AuctionPersonInline, ImageInline]
    filter_horizontal = ('sources',)

@admin.register(Exhibition)
class ExhibitionAdmin(admin.ModelAdmin):
    list_display = ('name', 'date_start', 'date_end', 'institution')
    search_fields = ('name', 'notes')
    inlines = [ImageInline]
    filter_horizontal = ('sources',)

@admin.register(ArtType)
class ArtTypeAdmin(admin.ModelAdmin):
    pass

@admin.register(Medium)
class MediumAdmin(admin.ModelAdmin):
    list_display = ('name', 'type')
    list_filter = ('type',)

@admin.register(Artwork)
class ArtworkAdmin(admin.ModelAdmin):
    list_display = ('name', 'dimension', 'medium')
    search_fields = ('name',)
    filter_horizontal = ('groups',)
    inlines = [ProvenanceEventInline, ImageInline]

@admin.register(Source)
class SourceAdmin(admin.ModelAdmin):
    list_display = ('source', 'type')
    search_fields = ('source',)
    inlines = [ImageInline]
    formfield_overrides = {
        models.CharField: {'widget': Textarea(attrs={'rows': 4, 'cols': 80})},
    }

@admin.register(ProvenanceEvent)
class ProvenanceEventAdmin(admin.ModelAdmin):
    list_display = ('artwork', 'sequence_number', 'event_type', 'date', 'person', 'institution')
    list_filter = ('event_type', 'certainty')
    ordering = ('artwork', 'sequence_number')
    search_fields = ('artwork__name', 'person__family_name', 'person__first_name', 'institution__name', 'notes')
    filter_horizontal = ('sources',)

@admin.register(ArtworkGroup)
class ArtworkGroupAdmin(admin.ModelAdmin):
    pass

@admin.register(ArtworkRelationship)
class ArtworkRelationshipAdmin(admin.ModelAdmin):
    list_display = ('source_artwork', 'type', 'target_artwork')

@admin.register(Image)
class ImageAdmin(admin.ModelAdmin):
    pass
