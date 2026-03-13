from django.contrib import admin
from django.db import models
from django.forms import Textarea, TextInput
from django import forms
from django.contrib.contenttypes.admin import GenericTabularInline
from .models import (
    Person, Institution, InstitutionType, ArtType, Artwork,
    ArtworkGroup, Source, ProvenanceEvent, ArtworkRelationship,
    Image, Medium, Auction, AuctionPerson, Exhibition, EventType,
    ProvenanceEventSource
)

class ImageInline(GenericTabularInline):
    model = Image
    extra = 1

class ProvenanceEventInlineForm(forms.ModelForm):
    source = forms.ModelChoiceField(
        queryset=Source.objects.all(),
        required=False,
        label="Source (Primary)"
    )
    source_notes = forms.CharField(
        max_length=100,
        required=False,
        label="Source Notes",
        widget=forms.TextInput(attrs={'size': '100'})
    )

    class Meta:
        model = ProvenanceEvent
        fields = '__all__'

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        if self.instance and self.instance.pk:
            first_source = self.instance.provenanceeventsource_set.first()
            if first_source:
                self.initial['source'] = first_source.source_id
                self.initial['source_notes'] = first_source.notes

    def save(self, commit=True):
        instance = super().save(commit=commit)
        
        source = self.cleaned_data.get('source')
        source_notes = self.cleaned_data.get('source_notes')
        
        def save_source_data():
            existing_sources = list(instance.provenanceeventsource_set.all())
            if source:
                if existing_sources:
                    first = existing_sources[0]
                    first.source = source
                    first.notes = source_notes or ''
                    first.save()
                else:
                    ProvenanceEventSource.objects.create(
                        event=instance,
                        source=source,
                        notes=source_notes or ''
                    )
            else:
                if existing_sources and ('source' in self.changed_data):
                    existing_sources[0].delete()
                    
        if commit:
            save_source_data()
        else:
            old_save_m2m = getattr(self, 'save_m2m', None)
            def save_m2m():
                if old_save_m2m:
                    old_save_m2m()
                save_source_data()
            self.save_m2m = save_m2m

        return instance

class ProvenanceEventInline(admin.StackedInline):
    model = ProvenanceEvent
    extra = 0
    form = ProvenanceEventInlineForm
    fieldsets = (
        (None, {
            'fields': (
                ('sequence_number', 'event_type', 'date'),
                ('person', 'institution'),
                ('auction', 'exhibition'),
                ('certainty', 'notes'),
                'source',
                'source_notes',
            )
        }),
    )
    formfield_overrides = {
        models.CharField: {'widget': TextInput(attrs={'size': '40'})},
    }
    def get_queryset(self, request):
        return super().get_queryset(request).select_related('event_type', 'person', 'institution', 'auction', 'exhibition')

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

class ProvenanceEventSourceInline(admin.StackedInline):
    model = ProvenanceEventSource
    extra = 1
    formfield_overrides = {
        models.CharField: {'widget': TextInput(attrs={'size': '100'})},
    }

@admin.register(ProvenanceEvent)
class ProvenanceEventAdmin(admin.ModelAdmin):
    list_display = ('artwork', 'sequence_number', 'event_type', 'date', 'person', 'institution', 'auction', 'exhibition')
    list_filter = ('event_type', 'certainty', 'auction', 'exhibition', 'sources')
    ordering = ('artwork', 'sequence_number')
    search_fields = ('artwork__name', 'person__family_name', 'person__first_name', 'institution__name', 'notes')
    inlines = [ProvenanceEventSourceInline]

@admin.register(ArtworkGroup)
class ArtworkGroupAdmin(admin.ModelAdmin):
    pass

@admin.register(ArtworkRelationship)
class ArtworkRelationshipAdmin(admin.ModelAdmin):
    list_display = ('source_artwork', 'type', 'target_artwork')

@admin.register(Image)
class ImageAdmin(admin.ModelAdmin):
    pass
