import pandas as pd
from django.core.management.base import BaseCommand
from provenance.models import Person, Artwork, Source, ProvenanceEvent, Medium

class Command(BaseCommand):
    help = 'Imports artwork data from Excel'

    def add_arguments(self, parser):
        parser.add_argument('file_path', type=str, help='Path to the Excel file')

    def handle(self, *args, **options):
        file_path = options['file_path']
        self.stdout.write(f"Reading file: {file_path}")
        
        try:
            df = pd.read_excel(file_path)
            df = df.where(pd.notnull(df), None) # Replace NaNs with None
        except Exception as e:
            self.stderr.write(self.style.ERROR(f"Error reading file: {e}"))
            return

        last_artwork = None
        
        for index, row in df.iterrows():
            # 1. Artist
            artist_name = row.get('Künstler')
            artist = None
            if artist_name:
                # Simple name parsing, maybe improve later
                artist, _ = Person.objects.get_or_create(name=artist_name.strip())

            # 2. Artwork (Handle "Same as above" logic)
            title = row.get('Titel')
            dimensions = row.get('Masse (cm)')
            
            artwork = None
            
            if title:
                # New Artwork Entry
                artwork, created = Artwork.objects.get_or_create(
                    title=title.strip(),
                    defaults={
                        'dimensions': dimensions if dimensions else '',
                        'notes': row.get('Bemerkung Inhalt') or ''
                    }
                )
                if created:
                    self.stdout.write(self.style.SUCCESS(f"Created Artwork: {artwork}"))
                else:
                    self.stdout.write(f"Found existing Artwork: {artwork}")
                
                last_artwork = artwork
            
            elif last_artwork:
                # No title, so it refers to the last artwork processed
                artwork = last_artwork
                self.stdout.write(f"  -> Linked to previous artwork: {artwork}")

            if not artwork:
                self.stderr.write(self.style.WARNING(f"Row {index}: Skipping, no title and no previous artwork."))
                continue

            # 3. Source & Event
            citation = row.get('Archivalie')
            if citation:
                source, created = Source.objects.get_or_create(
                    citation=citation.strip(),
                    defaults={
                        'type': 'archive',
                        'details': row.get('Seite Digitalisat') or '',
                        'notes': row.get('Bemerkung Archivalie') or ''
                    }
                )
                
                # Create a generic "Mention" event linked to this source
                # We don't have a date or actor in a clean format yet, so we dump context into notes
                context = row.get('Kontext') or ''
                prov_notes = row.get('Angaben zur Provenienz') or ''
                full_notes = f"Context: {context}\nProvenance Hint: {prov_notes}".strip()
                
                # Check if this event already exists to avoid duplicates on re-run
                # Simple check: same artwork + same source
                if not ProvenanceEvent.objects.filter(artwork=artwork, source=source).exists():
                    ProvenanceEvent.objects.create(
                        artwork=artwork,
                        event_type='mentioned', # 'Mentioned' in archive
                        source=source,
                        notes=full_notes,
                        sequence_number=999 # Place at end, needs manual ordering
                    )
                    self.stdout.write(self.style.SUCCESS(f"    Added Event/Source for {artwork}"))
