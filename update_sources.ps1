# PowerShell script to update sources in provenance events from a tab-delimited file.
# Input file format: 3 tab-delimited columns: old source, new source, notes
# Usage: .\update_sources.ps1

# Prompt for file location
$inputPath = Read-Host "Enter path to update file (tab-delimited: old source, new source, notes)"
if ([string]::IsNullOrWhiteSpace($inputPath)) {
    Write-Host "No file specified. Exiting."
    exit 1
}
$absPath = [System.IO.Path]::GetFullPath($inputPath)

$pythonCode = @"
import sys
import os
import django

# Setup Django environment
sys.path.append(os.getcwd())
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

file_path = r'$absPath'

try:
    from provenance.models import Source, ProvenanceEventSource

    updated_count = 0
    skipped_count = 0
    error_count = 0
    created_sources = 0
    skip_messages = []
    error_messages = []

    with open(file_path, encoding='utf-8') as f:
        lines = f.readlines()

    for line_num, line in enumerate(lines, start=1):
        line = line.strip()
        if not line:
            continue  # skip empty lines

        parts = line.split('\t')
        if len(parts) < 2:
            skip_messages.append(f"  SKIP line {line_num}: not enough columns (need at least old source and new source)")
            skipped_count += 1
            continue

        old_source_name = parts[0].strip()
        new_source_name = parts[1].strip()
        new_notes = parts[2].strip() if len(parts) >= 3 else ''

        if not old_source_name or not new_source_name:
            skip_messages.append(f"  SKIP line {line_num}: empty old or new source name")
            skipped_count += 1
            continue

        # Find the old source
        try:
            old_source = Source.objects.get(source=old_source_name)
        except Source.DoesNotExist:
            skip_messages.append(f"  SKIP line {line_num}: old source not found: '{old_source_name}'")
            skipped_count += 1
            continue
        except Source.MultipleObjectsReturned:
            error_messages.append(f"  ERROR line {line_num}: multiple sources found for '{old_source_name}', skipping")
            error_count += 1
            continue

        # Find or create the new source
        new_source, was_created = Source.objects.get_or_create(source=new_source_name)
        if was_created:
            print(f"  CREATED new source: '{new_source_name}'")
            created_sources += 1

        # Find all ProvenanceEventSource records linking to the old source
        event_sources = ProvenanceEventSource.objects.filter(source=old_source)
        count = event_sources.count()

        if count == 0:
            skip_messages.append(f"  SKIP line {line_num}: no provenance events use source '{old_source_name}'")
            skipped_count += 1
            continue

        for pes in event_sources:
            try:
                # Update source reference
                pes.source = new_source

                # Update notes: input file notes first, then existing notes
                if new_notes:
                    if pes.notes:
                        pes.notes = f"{new_notes}; {pes.notes}"
                    else:
                        pes.notes = new_notes

                pes.save()
                updated_count += 1
                print(f"  UPDATED event {pes.event_id}: '{old_source_name}' -> '{new_source_name}'" + (f" (notes: {pes.notes})" if pes.notes else ""))
            except Exception as e:
                error_messages.append(f"  ERROR updating event {pes.event_id}: {e}")
                error_count += 1

    if skip_messages:
        print()
        for msg in skip_messages:
            print(msg)
    if error_messages:
        print()
        for msg in error_messages:
            print(msg)
    print()
    print(f"Done. Updated: {updated_count}, Skipped: {skipped_count}, Errors: {error_count}, New sources created: {created_sources}")

except FileNotFoundError:
    print(f"Error: File not found: {file_path}")
    sys.exit(1)
except Exception as e:
    print(f"Unexpected error: {e}")
    import traceback
    traceback.print_exc()
    sys.exit(1)
"@

# Write the Python code to a temp file using .NET to prevent the UTF-8 BOM issue in PowerShell 5
$tempFile = [System.IO.Path]::GetTempFileName() + ".py"
[System.IO.File]::WriteAllText($tempFile, $pythonCode)

# Run the python file directly
.\venv\Scripts\python.exe $tempFile

Remove-Item $tempFile -ErrorAction SilentlyContinue
