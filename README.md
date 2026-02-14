# Art Provenance Research Application 🐘🎨

A specialized web application designed for PhD research to track, visualize, and analyze the provenance (ownership history) of artworks. This tool focuses on handling complex historical data, including uncertain dates and multi-actor relationships.

## Features
- **Sophisticated Provenance Tracking**: Handle ownership chains with explicit sequencing and certainty levels (Proven, Likely, Unproven).
- **Relational Data Model**: Track Persons, Organizations, Auctions, and Exhibitions in context.
- **Visual Collection Dashboard**: Browse and search artworks in your collection with high-resolution images.
- **Unified Management**: Seamless integration between the research frontend and the Django Admin data entry panel.

---

## 🚀 Getting Started (Local Setup)

There are two ways to run this project locally, depending on your comfort level with Python and Node.js.

### Path A: The Easy Way (Docker Only) 🐳
**Best for:** Someone who wants to run the app quickly without managing Python or Node.js versions.

1. **Install Docker**: Download and install [Docker Desktop](https://www.docker.com/products/docker-desktop/).
2. **Clone the repository**:
   ```bash
   git clone git@github.com:haesena/art_provenance.git
   cd art_provenance
   ```
3. **Set your Environment Variables**:
   ```bash
   cp .env.example .env
   # (Optional) Open .env and change the POSTGRES_PASSWORD
   ```
4. **Launch the entire stack**:
   ```bash
   docker compose up --build
   ```
5. **Access the App**:
   - **Frontend**: [http://localhost](http://localhost) (or port 80)
   - **Admin Panel**: [http://localhost/admin/](http://localhost/admin/)

---

### Path B: The Developer Way (Manual Setup) 🛠️
**Best for:** Active development where you want "Hot Reloading" for your code changes.

#### Prerequisites
- **Python 3.12**
- **Node.js 20+ (with npm)**
- **Docker** (Still needed just for the database)

#### Setup Steps
1. **Initialize Python**:
   - **Linux/macOS**:
     ```bash
     python3 -m venv venv
     source venv/bin/activate
     pip install -r requirements.txt
     ```
   - **Windows (PowerShell)**:
     ```powershell
     python -m venv venv
     .\venv\Scripts\Activate.ps1
     pip install -r requirements.txt
     ```
2. **Configure Environment**:
   ```bash
   cp .env.example .env
   ```
3. **Launch with Automation**:
   Use our custom script to start the DB, run migrations, and launch both Backend and Frontend:
   ```bash
   ./dev.sh
   ```
   On Windows (PowerShell):
   ```powershell
   Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
   ./dev.ps1
   ```
   *Alternatively, run once without changing policy:*
   ```powershell
   PowerShell -ExecutionPolicy Bypass -File .\dev.ps1
   ```

- **Frontend (Hot Reload)**: [http://localhost:5173](http://localhost:5173)
- **Backend API/Admin**: [http://localhost:8000](http://localhost:8000)

#### Creating an Admin Account
To access the Django Admin panel, you need to create a superuser:
```powershell
.\venv\Scripts\Activate.ps1
python manage.py createsuperuser
```
Follow the prompts to set your username, email, and password.

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

## 📚 Documentation for Developers

For detailed information on how to extend and maintain the application, see:

- [Backend Documentation (Data Models & API)](file:///home/haesen/.gemini/antigravity/scratch/art_provenance/provenance/README.md)
- [Frontend Documentation (Pages & UI Components)](file:///home/haesen/.gemini/antigravity/scratch/art_provenance/frontend/README.md)
- [Portainer Deployment Guide](file:///home/haesen/.gemini/antigravity/brain/6a7a9712-5a9a-4b59-8c71-f5307c23f2d6/portainer_guide.md)

---

## Documentation
Additional planning and design documents can be found in the `brain/` directory (if available in your checkout):
- [Schema Design](brain/schema_design.md)
- [Deployment Plan](brain/deployment_plan.md)
