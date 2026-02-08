from django.contrib import admin
from django import forms
from django.core.exceptions import ValidationError
from django.contrib.contenttypes.admin import GenericTabularInline
from .models import Person, Organization, Artwork, ArtworkGroup, Source, ProvenanceEvent, ArtworkRelationship, Image, Medium, Auction, Exhibition

class ImageInline(GenericTabularInline):
    model = Image
    extra = 1

class ProvenanceEventInline(admin.TabularInline):
    model = ProvenanceEvent
    extra = 1
    # To improve UX, we could use a third-party package like django-gfklookup-widget later.

class ProvenanceEventForm(forms.ModelForm):
    agent_person = forms.ModelChoiceField(queryset=Person.objects.all(), required=False, label="Person")
    agent_organization = forms.ModelChoiceField(queryset=Organization.objects.all(), required=False, label="Organization")

    class Meta:
        model = ProvenanceEvent
        fields = '__all__'

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        if self.instance.pk and self.instance.actor:
            if isinstance(self.instance.actor, Person):
                self.fields['agent_person'].initial = self.instance.actor
            elif isinstance(self.instance.actor, Organization):
                self.fields['agent_organization'].initial = self.instance.actor

    def clean(self):
        cleaned_data = super().clean()
        person = cleaned_data.get('agent_person')
        organization = cleaned_data.get('agent_organization')
        
        if person and organization:
            raise forms.ValidationError("Please select either a Person OR an Organization, not both.")
        return cleaned_data

    def save(self, commit=True):
        instance = super().save(commit=False)
        person = self.cleaned_data.get('agent_person')
        organization = self.cleaned_data.get('agent_organization')

        if person:
            instance.actor = person
        elif organization:
            instance.actor = organization
        else:
            # Both are empty, so clear the actor
            instance.actor = None
        
        if commit:
            instance.save()
        return instance

class ProvenanceEventInline(admin.TabularInline):
    model = ProvenanceEvent
    form = ProvenanceEventForm
    extra = 1
    fields = ('sequence_number', 'event_type', 'date_start', 'display_date', 'agent_person', 'agent_organization', 'auction', 'exhibition', 'certainty', 'source')

class ArtworkRelationshipInline(admin.TabularInline):
    model = ArtworkRelationship
    fk_name = 'source_artwork'
    extra = 1

@admin.register(Person)
class PersonAdmin(admin.ModelAdmin):
    list_display = ('name', 'birth_date', 'death_date', 'nationality')
    search_fields = ('name',)
    inlines = [ImageInline]

@admin.register(Organization)
class OrganizationAdmin(admin.ModelAdmin):
    list_display = ('name', 'type', 'location')
    list_filter = ('type',)
    search_fields = ('name',)

@admin.register(Artwork)
class ArtworkAdmin(admin.ModelAdmin):
    list_display = ('title', 'creation_date_text', 'medium')
    search_fields = ('title',)
    filter_horizontal = ('groups',)
    inlines = [ProvenanceEventInline, ArtworkRelationshipInline, ImageInline]

    class Media:
        js = ('provenance/js/admin_resizer.js',)


@admin.register(Source)
class SourceAdmin(admin.ModelAdmin):
    list_display = ('citation',)
    search_fields = ('citation',)
    inlines = [ImageInline]

@admin.register(ProvenanceEvent)
class ProvenanceEventAdmin(admin.ModelAdmin):
    list_display = ('artwork', 'sequence_number', 'event_type', 'display_date', 'actor')
    list_filter = ('event_type', 'certainty')
    search_fields = ('artwork__title',)

@admin.register(ArtworkGroup)
class ArtworkGroupAdmin(admin.ModelAdmin):
    pass

@admin.register(Auction)
class AuctionAdmin(admin.ModelAdmin):
    list_display = ('name', 'auction_house', 'date')
    list_filter = ('auction_house',)
    search_fields = ('name',)

@admin.register(Exhibition)
class ExhibitionAdmin(admin.ModelAdmin):
    list_display = ('title', 'location', 'date_start', 'date_end')
    list_filter = ('location',)
    search_fields = ('title',)

@admin.register(ArtworkRelationship)
class ArtworkRelationshipAdmin(admin.ModelAdmin):
    list_display = ('source_artwork', 'type', 'target_artwork', 'certainty')
from django.contrib import admin; from .models import Medium; admin.site.register(Medium)
