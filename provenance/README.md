# Art Provenance Backend

This is the Django-based backend for the Art Provenance research application. It handles the database, business logic, and provides a JSON API for the frontend.

## Tech Stack
- **Framework**: Django 6.0
- **Database**: PostgreSQL (Production) / SQLite (Local Dev fallback)
- **Server**: Gunicorn (Production) / manage.py (Local)
- **Containerization**: Docker

## Directory Structure
- `config/`: Project settings, URL routing, and WSGI configuration.
- `provenance/`: The main application logic.
    - `models.py`: Database schema definitions.
    - `api.py`: JSON-based    API endpoints.
    - `auth_api.py`: Authentication-specific endpoints (Login/Logout).
    - `admin.py`: Django Admin panel configuration.
- `media/`: User-uploaded files (images).
- `static/`: Collected static files for the admin panel.

## Extending the Data Model

To add a new entity (e.g., a "Restoration" tracking model):

1. **Define the Model**: Open `provenance/models.py` and create your class:
   ```python
   class Restoration(models.Model):
       artwork = models.ForeignKey(Artwork, on_delete=models.CASCADE, related_name='restorations')
       date = models.DateField()
       description = models.TextField()
   ```

2. **Generate Migrations**:
   Run locally or in the container:
   ```bash
   python manage.py makemigrations
   python manage.py migrate
   ```

3. **Register in Admin**: Update `provenance/admin.py` to make it editable:
   ```python
   @admin.register(Restoration)
   class RestorationAdmin(admin.ModelAdmin):
       list_display = ('artwork', 'date')
   ```

4. **Update the API**: If you want the frontend to see this data, update the serializers in `provenance/api.py`.

## Adding a New API Endpoint

1. Create a function in `provenance/api.py`:
   ```python
   def my_new_endpoint(request):
       return JsonResponse({'message': 'Hello World'})
   ```

2. Route it in `config/urls.py`:
   ```python
   path('api/my-endpoint/', api.my_new_endpoint),
   ```
