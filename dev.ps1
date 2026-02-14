# Configuration
$DB_SERVICE = "db"
$VENV_PYTHON = ".\venv\Scripts\python.exe"
$FRONTEND_DIR = ".\frontend"

# Check if venv exists, fallback to just python if not (or handle error)
if (-not (Test-Path $VENV_PYTHON)) {
    Write-Host "Warning: Virtual environment not found at $VENV_PYTHON. Using system python." -ForegroundColor Yellow
    $VENV_PYTHON = "python"
}

# Check if Django is installed
$checkDjango = & $VENV_PYTHON -c "import django" 2>$null
if ($LASTEXITCODE -ne 0) {
    Write-Host "Error: Django not found in $VENV_PYTHON." -ForegroundColor Red
    Write-Host "Please set up your environment first:" -ForegroundColor Cyan
    Write-Host "  python -m venv venv"
    Write-Host "  .\venv\Scripts\Activate.ps1"
    Write-Host "  pip install -r requirements.txt"
    exit 1
}

Write-Host "Starting Local Development Environment..." -ForegroundColor Blue

# 1. Start Database
Write-Host "Ensuring Database is running..." -ForegroundColor Blue
docker compose up -d $DB_SERVICE

# 2. Wait for DB to be healthy
Write-Host "Waiting for database health check..." -ForegroundColor Blue
while ($true) {
    try {
        $status = docker inspect -f '{{.State.Health.Status}}' art_provenance-db-1
        if ($status -eq "healthy") {
            break
        }
    } catch {
        # Catch errors if container is not yet available for inspect
    }
    Start-Sleep -Seconds 1
}
Write-Host "Database is healthy!" -ForegroundColor Green

# 3. Run Migrations
Write-Host "Running Database Migrations..." -ForegroundColor Blue
& $VENV_PYTHON manage.py migrate

# 4. Start Services
Write-Host "Launching Backend and Frontend..." -ForegroundColor Blue

# Start Backend in a new job or background process
Write-Host "Backend starting at http://localhost:8000" -ForegroundColor Green
$backendJob = Start-Job -ScriptBlock {
    param($python, $cwd)
    Set-Location $cwd
    & $python manage.py runserver
} -ArgumentList $VENV_PYTHON, $PSScriptRoot

# Start Frontend in a new job or background process
Write-Host "Frontend starting at http://localhost:5173" -ForegroundColor Green
$frontendJob = Start-Job -ScriptBlock {
    param($dir, $cwd)
    Set-Location $cwd
    Set-Location $dir
    npm run dev
} -ArgumentList $FRONTEND_DIR, $PSScriptRoot

Write-Host "Press Ctrl+C to stop all services..." -ForegroundColor Cyan

# Handle cleanup
try {
    # Wait for the jobs or until the user interrupts
    Wait-Job -Job $backendJob, $frontendJob
} catch {
    # Catch interrupt if Wait-Job is terminatable, or just handle in finally
} finally {
    Write-Host "`nShutting down services..." -ForegroundColor Blue
    Get-Job | Stop-Job
    Get-Job | Remove-Job
    Write-Host "Done!" -ForegroundColor Green
}
