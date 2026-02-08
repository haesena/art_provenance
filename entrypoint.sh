#!/bin/sh

# Wait for database to be ready
if [ "$DATABASE_URL" != "" ]; then
    # Extract host and port from DATABASE_URL
    # postgres://user:pass@host:port/dbname
    DB_HOST=$(echo $DATABASE_URL | sed -e 's|.*@||' -e 's|:.*||' -e 's|/.*||')
    DB_PORT=$(echo $DATABASE_URL | sed -e 's|.*:||' -e 's|/.*||')
    
    echo "Waiting for postgres at $DB_HOST:$DB_PORT..."

    while ! nc -z $DB_HOST $DB_PORT; do
      sleep 0.1
    done

    echo "PostgreSQL started"
fi

# Run migrations
python manage.py migrate --noinput

# Execute the CMD passed to docker run
exec "$@"
