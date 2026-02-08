#!/bin/bash

# Configuration
DB_SERVICE="db"
VENV_PYTHON="./venv/bin/python3"
FRONTEND_DIR="./frontend"

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}Starting Local Development Environment...${NC}"

# 1. Start Database
echo -e "${BLUE}Ensuring Database is running...${NC}"
docker compose up -d $DB_SERVICE

# 2. Wait for DB to be healthy
echo -e "${BLUE}Waiting for database health check...${NC}"
while [ "$(docker inspect -f '{{.State.Health.Status}}' art_provenance-db-1)" != "healthy" ]; do
    sleep 1
done
echo -e "${GREEN}Database is healthy!${NC}"

# 3. Run Migrations
echo -e "${BLUE}Running Database Migrations...${NC}"
$VENV_PYTHON manage.py migrate

# 4. Start Services
echo -e "${BLUE}Launching Backend and Frontend...${NC}"

# Function to handle cleanup on exit
cleanup() {
    echo -e "\n${BLUE}Shutting down services...${NC}"
    kill $BACKEND_PID
    kill $FRONTEND_PID
    # Optional: stop the db container too? 
    # docker compose stop $DB_SERVICE
    echo -e "${GREEN}Done!${NC}"
    exit
}

trap cleanup SIGINT SIGTERM

# Start Backend
echo -e "${GREEN}Backend starting at http://localhost:8000${NC}"
$VENV_PYTHON manage.py runserver &
BACKEND_PID=$!

# Start Frontend
echo -e "${GREEN}Frontend starting at http://localhost:5173${NC}"
cd $FRONTEND_DIR && npm run dev &
FRONTEND_PID=$!

# Wait for background processes
wait
