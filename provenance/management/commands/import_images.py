import os
import openpyxl
from django.core.management.base import BaseCommand
from django.core.files import File
from django.contrib.contenttypes.models import ContentType
from provenance.models import Artwork, Image

class Command(BaseCommand):
    help = 'Import artwork images from temp_images directory based on artwork_image_mapping.xlsx'

    def handle(self, *args, **options):
        mapping_file = 'temp_images/artwork_image_mapping.xlsx'
        images_dir = 'temp_images'
        
        if not os.path.exists(mapping_file):
            self.stderr.write(self.style.ERROR(f'Mapping file {mapping_file} not found'))
            return

        wb = openpyxl.load_workbook(mapping_file)
        ws = wb.active
        
        # Skip header
        rows = list(ws.iter_rows(values_only=True))[1:]
        
        artwork_ct = ContentType.objects.get_for_model(Artwork)
        
        for row in rows:
            artwork_name, image_filename = row
            if not artwork_name or not image_filename:
                continue
            
            try:
                artwork = Artwork.objects.get(name=artwork_name)
                image_path = os.path.join(images_dir, image_filename)
                
                if not os.path.exists(image_path):
                    self.stderr.write(self.style.WARNING(f'Image file {image_path} not found for {artwork_name}'))
                    continue
                
                # Create Image object
                with open(image_path, 'rb') as f:
                    img_obj = Image(
                        content_type=artwork_ct,
                        object_id=artwork.id,
                        caption=artwork_name
                    )
                    img_obj.image.save(image_filename, File(f), save=True)
                    self.stdout.write(self.style.SUCCESS(f'Successfully imported image for {artwork_name}'))
                    
            except Artwork.DoesNotExist:
                self.stderr.write(self.style.ERROR(f'Artwork "{artwork_name}" not found in database'))
            except Exception as e:
                self.stderr.write(self.style.ERROR(f'Error importing image for {artwork_name}: {str(e)}'))
