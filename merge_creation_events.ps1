# PowerShell script to merge EventType 5 into EventType 1
$pythonCode = @"
from provenance.models import ProvenanceEvent, EventType
import sys

# 1. Verify existence of both types
try:
    target_type = EventType.objects.get(id=1)
    source_type = EventType.objects.get(id=5)
    print(f"Merging '{source_type.name}' (ID: 5) into '{target_type.name}' (ID: 1)...")
except EventType.DoesNotExist as e:
    print(f"Error: One of the EventTypes does not exist. {e}")
    sys.exit(1)

# 2. Update all ProvenanceEvents
events_to_update = ProvenanceEvent.objects.filter(event_type=source_type)
count = events_to_update.count()
events_to_update.update(event_type=target_type)
print(f"Updated {count} ProvenanceEvents.")

# 3. Delete the old EventType
source_type.delete()
print(f"Successfully deleted EventType '{source_type.name}' (ID: 5).")
"@

# Execute via Django shell
.\venv\Scripts\python.exe manage.py shell -c $pythonCode
