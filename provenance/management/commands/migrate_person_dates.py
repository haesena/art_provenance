from django.core.management.base import BaseCommand
from provenance.models import Person
from datetime import datetime
import re

class Command(BaseCommand):
    help = 'Migrate Person dates to DD.MM.YYYY format'

    def handle(self, *args, **options):
        persons = Person.objects.all()
        count = 0
        
        for person in persons:
            updated = False
            if person.birth_date:
                new_date = self.format_date(person.birth_date)
                if new_date != person.birth_date:
                    person.birth_date = new_date
                    updated = True
            
            if person.death_date:
                new_date = self.format_date(person.death_date)
                if new_date != person.death_date:
                    person.death_date = new_date
                    updated = True
            
            if updated:
                person.save()
                count += 1
        
        self.stdout.write(self.style.SUCCESS(f'Successfully updated {count} persons.'))

    def format_date(self, date_str):
        if not date_str:
            return date_str
        
        # Try YYYY-MM-DD HH:MM:SS
        try:
            dt = datetime.strptime(date_str, '%Y-%m-%d %H:%M:%S')
            return dt.strftime('%d.%m.%Y')
        except ValueError:
            pass
            
        # Try YYYY-MM-DD
        try:
            dt = datetime.strptime(date_str, '%Y-%m-%d')
            return dt.strftime('%d.%m.%Y')
        except ValueError:
            pass
            
        return date_str
