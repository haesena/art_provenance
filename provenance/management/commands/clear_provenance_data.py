from django.core.management.base import BaseCommand
from provenance.models import (
    ArtType, ArtworkGroup, Medium, Person, InstitutionType, 
    Institution, Artwork, Source, ProvenanceEvent, ArtworkRelationship,
    Image
)

class Command(BaseCommand):
    help = 'Clears all data from provenance tables'

    def handle(self, *args, **options):
        self.stdout.write('Clearing provenance data...')
        
        # Order matters for foreign keys
        ProvenanceEvent.objects.all().delete()
        ArtworkRelationship.objects.all().delete()
        Source.objects.all().delete()
        Artwork.objects.all().delete()
        Medium.objects.all().delete()
        Institution.objects.all().delete()
        Person.objects.all().delete()
        InstitutionType.objects.all().delete()
        ArtworkGroup.objects.all().delete()
        ArtType.objects.all().delete()
        
        # Clear images related to these models
        # (Optional: might want to be careful here if Image is used by other apps)
        # But in this project it seems centered on provenance.
        Image.objects.all().delete()

        self.stdout.write(self.style.SUCCESS('Successfully cleared provenance data.'))
