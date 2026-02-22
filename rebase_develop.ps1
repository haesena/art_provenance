# rebase_develop.ps1
# This script rebases origin/main onto the current branch (develop-huub) and force pushes.

$TargetBranch = "develop-huub"
$UpstreamBranch = "origin/main"

Write-Host "--- Starting Rebase and Push Process ---" -ForegroundColor Cyan

# 1. Fetch latest changes
Write-Host "Fetching latest changes from origin..." -ForegroundColor Yellow
git fetch origin
if ($LASTEXITCODE -ne 0) {
    Write-Host "Error: git fetch failed." -ForegroundColor Red
    exit 1
}

# 2. Check if we are on the correct branch
$CurrentBranch = git rev-parse --abbrev-ref HEAD
if ($CurrentBranch -ne $TargetBranch) {
    Write-Host "Switching to branch $TargetBranch..." -ForegroundColor Yellow
    git checkout $TargetBranch
    if ($LASTEXITCODE -ne 0) {
        Write-Host "Error: Could not switch to $TargetBranch." -ForegroundColor Red
        exit 1
    }
}

# 3. Perform the rebase
Write-Host "Rebasing $UpstreamBranch onto $TargetBranch..." -ForegroundColor Yellow
git rebase $UpstreamBranch
if ($LASTEXITCODE -ne 0) {
    Write-Host "Error: Rebase failed. You might have merge conflicts." -ForegroundColor Red
    Write-Host "Please resolve conflicts manually, then run 'git rebase --continue' or 'git rebase --abort'." -ForegroundColor Yellow
    exit 1
}

# 4. Force push to develop-huub
Write-Host "Force pushing to origin/$TargetBranch..." -ForegroundColor Yellow
git push origin $TargetBranch -f
if ($LASTEXITCODE -ne 0) {
    Write-Host "Error: Force push failed." -ForegroundColor Red
    exit 1
}

Write-Host "--- Successfully rebased and pushed! ---" -ForegroundColor Green
