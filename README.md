# Art Provenance Research Application 🐘🎨

A specialized web application designed for PhD research to track, visualize, and analyze the provenance (ownership history) of artworks. This tool focuses on handling complex historical data, including uncertain dates and multi-actor relationships.

## Features
- **Sophisticated Provenance Tracking**: Handle ownership chains with explicit sequencing and certainty levels (Proven, Likely, Unproven).
- **Relational Data Model**: Track Persons, Organizations, Auctions, and Exhibitions in context.
- **Visual Collection Dashboard**: Browse and search artworks in your collection with high-resolution images.
- **Unified Management**: Seamless integration between the research frontend and the Django Admin data entry panel.

---

## Local Development (Quick Start)

The easiest way to run the project locally is using the provided automation script.

### Prerequisites
- **Python 3.12**
- **Node.js 20+**
- **Docker** (for the PostgreSQL database)

### Setup
1. **Clone the repository**:
   ```bash
   git clone git@github.com:haesena/art_provenance.git
   cd art_provenance
   ```

2. **Environment Variables**:
   Copy the example environment file and fill in your secrets (especially `SECRET_KEY` and `POSTGRES_PASSWORD`):
   ```bash
   cp .env.example .env
   ```

3. **Initialize the Virtual Environment**:
   Ensure you have a virtual environment at `./venv`:
   ```bash
   python3 -m venv venv
   source venv/bin/activate
   pip install -r requirements.txt
   ```

4. **Launch with dev.sh**:
   This script starts the Postgres database in Docker, runs migrations, and launches both the backend and frontend:
   ```bash
   ./dev.sh
   ```

- **Frontend**: [http://localhost:5173](http://localhost:5173)
- **Backend API/Admin**: [http://localhost:8000](http://localhost:8000)

---

## Production Deployment (Docker)

For production or a production-like environment, the entire stack (Nginx, React, Django, Postgres) is containerized via Docker Compose.

### Build and Run
1. **Configure your `.env`**:
   Ensure `DEBUG=0` and `ALLOWED_HOSTS` are set correctly for your server's domain/IP.

2. **Launch with Docker Compose**:
   ```bash
   docker compose up --build -d
   ```

### Deployment Architecture
- **Nginx**: Serves the React frontend as static files and proxies `/api` and `/admin` requests to the Django container.
- **Gunicorn**: Serves the Django application inside the backend container.
- **Volumes**: Persistent volumes are used for `postgres_data` and `media_data` (uploaded artwork images).

---

## Tech Stack
- **Backend**: Django (Python), Django REST Framework
- **Frontend**: React (TypeScript), Vite, Tailwind CSS, Lucide Icons
- **Database**: PostgreSQL
- **DevOps**: Docker, Nginx, WhiteNoise (for static assets)

---

## Documentation
Additional planning and design documents can be found in the `brain/` directory (if available in your checkout):
- [Schema Design](brain/schema_design.md)
- [Deployment Plan](brain/deployment_plan.md)
