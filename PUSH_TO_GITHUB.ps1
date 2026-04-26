# ===============================================================
# LG ScreenBoard -- Push to GitHub
# ===============================================================
# Run this script from PowerShell in the project folder to push
# all files to: github.com/jaimalleshk/LG-TV-Screensaver-Time-Weather-Dashboard
#
# How to run:
#   1. Open PowerShell
#   2. cd "D:\OneDrive\OneDrive-Projects\LG TV Screen Saver App"
#   3. .\PUSH_TO_GITHUB.ps1
#
# Requires: Git installed (https://git-scm.com)
# ===============================================================

$ErrorActionPreference = "Stop"
$REPO_URL = "https://github.com/jaimalleshk/LG-TV-Screensaver-Time-Weather-Dashboard.git"
$BRANCH   = "main"

Write-Host ""
Write-Host "====================================================" -ForegroundColor Cyan
Write-Host "   LG ScreenBoard -- GitHub Push Script" -ForegroundColor Cyan
Write-Host "====================================================" -ForegroundColor Cyan
Write-Host ""

# -- 1. Check git is installed --
if (-not (Get-Command git -ErrorAction SilentlyContinue)) {
    Write-Host "ERROR: Git is not installed. Download it from https://git-scm.com" -ForegroundColor Red
    exit 1
}

# -- 2. Move to script directory --
$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location $scriptDir
Write-Host "Working directory: $scriptDir" -ForegroundColor Gray

# -- 3. Remove any broken .git from sandbox attempts --
if (Test-Path ".git") {
    Write-Host "Removing existing .git directory..." -ForegroundColor Yellow
    Remove-Item -Recurse -Force ".git"
}

# -- 4. Initialize fresh repo --
Write-Host ""
Write-Host "Initializing git repository..." -ForegroundColor Cyan
git init
git branch -M $BRANCH

# -- 5. Configure identity --
git config user.email "jaimalleshk@gmail.com"
git config user.name  "jaimalleshk"

# -- 6. Create .gitignore --
$gitignoreContent = "# OS files`n.DS_Store`nThumbs.db`ndesktop.ini`n`n# Editor`n.vscode/`n*.swp`n`n# webOS packaging output`n*.ipk`n"
$gitignoreContent | Out-File -Encoding UTF8 ".gitignore"
Write-Host "Created .gitignore" -ForegroundColor Gray

# -- 7. Stage all files --
Write-Host ""
Write-Host "Staging files..." -ForegroundColor Cyan
git add .
git status --short

# -- 8. Commit --
Write-Host ""
Write-Host "Creating commit..." -ForegroundColor Cyan
$commitMsg = "feat: LG ScreenBoard v1.1.0 - Table layout (no overlaps), Tomball TX default, location picker, visible burn-in animations (particles + scan sweep + section fades)"
git commit -m $commitMsg

# -- 9. Add remote --
Write-Host ""
Write-Host "Setting remote origin..." -ForegroundColor Cyan
git remote add origin $REPO_URL

# -- 10. Push --
Write-Host ""
Write-Host "Pushing to GitHub..." -ForegroundColor Cyan
Write-Host "(You may be prompted for your GitHub username and password/token)" -ForegroundColor Yellow
Write-Host ""
Write-Host "TIP: Use a Personal Access Token, not your account password." -ForegroundColor Yellow
Write-Host "     Create one at: https://github.com/settings/tokens" -ForegroundColor Yellow
Write-Host "     Required scope: repo" -ForegroundColor Yellow
Write-Host ""

git push -u origin $BRANCH

Write-Host ""
Write-Host "====================================================" -ForegroundColor Green
Write-Host "   SUCCESS: Pushed to GitHub!" -ForegroundColor Green
Write-Host "====================================================" -ForegroundColor Green
Write-Host ""
Write-Host "View your repo at:" -ForegroundColor White
Write-Host "https://github.com/jaimalleshk/LG-TV-Screensaver-Time-Weather-Dashboard" -ForegroundColor Cyan
Write-Host ""
