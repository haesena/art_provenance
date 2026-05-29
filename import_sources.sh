#!/bin/bash

# Bash script to import sources from a text file.
# Usage: ./import_sources.sh

# Prompt for file location
read -p "Enter path to sources file: " inputPath

if [ -z "$inputPath" ]; then
    echo "No file specified. Exiting."
    exit 1
fi

# Get absolute path
absPath=$(realpath "$inputPath")

if [ ! -f "$absPath" ]; then
    echo "Error: File not found: $absPath"
    exit 1
fi

pythonCode=$(cat <<EOF
import sys
import os
import django

# Setup Django environment
sys.path.append(os.getcwd())
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

file_path = r'$absPath'

try:
    from provenance.models import Source

    created_count = 0
    skipped_count = 0
    error_count = 0

    with open(file_path, encoding='utf-8') as f:
        lines = f.readlines()

    for line in lines:
        # Strip whitespace and tabs (tab-delimited single column)
        value = line.strip().strip('\t')

        if not value:
            continue  # skip empty lines

        # Skip if a source with the exact same name already exists
        if Source.objects.filter(source=value).exists():
            print(f"  SKIP (already exists): {value}")
            skipped_count += 1
            continue

        try:
            Source.objects.create(source=value)
            print(f"  CREATED: {value}")
            created_count += 1
        except Exception as e:
            print(f"  ERROR creating '{value}': {e}")
            error_count += 1

    print()
    print(f"Done. Created: {created_count}, Skipped: {skipped_count}, Errors: {error_count}")

except FileNotFoundError:
    print(f"Error: File not found: {file_path}")
    sys.exit(1)
except Exception as e:
    print(f"Unexpected error: {e}")
    sys.exit(1)
EOF
)

# Write the Python code to a temp file
tempFile=$(mktemp --suffix=.py)
echo "$pythonCode" > "$tempFile"

# Run the python file directly
# Using venv/bin/python as the Linux equivalent of venv\Scripts\python.exe
if [ -f "venv/bin/python" ]; then
    ./venv/bin/python "$tempFile"
else
    python3 "$tempFile"
fi

rm "$tempFile"
