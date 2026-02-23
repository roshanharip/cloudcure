#Requires -Version 5.1
<#
.SYNOPSIS
    CloudCure startup script - works on Windows, Linux, and macOS.
.DESCRIPTION
    Checks Node.js and pnpm availability, installs pnpm if missing,
    installs dependencies, and launches backend + frontend concurrently.
#>

Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

$ROOT = $PSScriptRoot

function Write-Header {
    param([string]$Text)
    Write-Host ""
    Write-Host "============================================" -ForegroundColor Cyan
    Write-Host "  $Text" -ForegroundColor Cyan
    Write-Host "============================================" -ForegroundColor Cyan
    Write-Host ""
}

function Write-Step {
    param([string]$Tag, [string]$Msg, [string]$Color = "White")
    Write-Host "[$Tag] $Msg" -ForegroundColor $Color
}

# ============================================================
# 1. Check Node.js
# ============================================================
Write-Header "CloudCure - Start Script"

$nodeCmd = Get-Command "node" -ErrorAction SilentlyContinue
if (-not $nodeCmd) {
    Write-Step "ERROR" "Node.js is not installed or not in PATH." "Red"
    Write-Step "INFO"  "Download it from: https://nodejs.org" "Yellow"
    exit 1
}
$nodeVersion = & node --version
Write-Step "OK" "Node.js found: $nodeVersion" "Green"

# ============================================================
# 2. Check / Install pnpm
# ============================================================
$pnpmCmd = Get-Command "pnpm" -ErrorAction SilentlyContinue
if (-not $pnpmCmd) {
    Write-Step "INFO" "pnpm not found. Installing via npm..." "Yellow"
    & npm install -g pnpm
    if ($LASTEXITCODE -ne 0) {
        Write-Step "ERROR" "Failed to install pnpm." "Red"
        exit 1
    }
    Write-Step "OK" "pnpm installed successfully." "Green"
} else {
    $pnpmVersion = & pnpm --version
    Write-Step "OK" "pnpm found: v$pnpmVersion" "Green"
}

# ============================================================
# 3. Install dependencies
# ============================================================
Write-Header "Installing Dependencies"

Write-Step "BACKEND" "Running pnpm install..." "Cyan"
Push-Location (Join-Path $ROOT "cloudcure-backend")
& pnpm install
if ($LASTEXITCODE -ne 0) {
    Write-Step "ERROR" "Backend pnpm install failed." "Red"
    Pop-Location; exit 1
}
Pop-Location
Write-Step "BACKEND" "Dependencies installed." "Green"

Write-Step "FRONTEND" "Running pnpm install..." "Cyan"
Push-Location (Join-Path $ROOT "cloudcure-frontend")
& pnpm install
if ($LASTEXITCODE -ne 0) {
    Write-Step "ERROR" "Frontend pnpm install failed." "Red"
    Pop-Location; exit 1
}
Pop-Location
Write-Step "FRONTEND" "Dependencies installed." "Green"

# ============================================================
# 4. Start services
# ============================================================
Write-Header "Starting Services"

$isWindows = $PSVersionTable.PSVersion -and ($IsWindows -eq $true -or $env:OS -eq "Windows_NT")

if ($isWindows) {
    # Windows: open separate terminal windows
    Write-Step "BACKEND" "Launching NestJS dev server in new window..." "Cyan"
    Start-Process "cmd.exe" -ArgumentList "/k cd /d `"$ROOT\cloudcure-backend`" && pnpm start:dev" -WindowStyle Normal

    Write-Step "FRONTEND" "Launching Vite dev server in new window..." "Cyan"
    Start-Process "cmd.exe" -ArgumentList "/k cd /d `"$ROOT\cloudcure-frontend`" && pnpm dev" -WindowStyle Normal

    Write-Host ""
    Write-Host "[OK] Both services launched in separate windows." -ForegroundColor Green
    Write-Host "     Backend  : http://localhost:3000" -ForegroundColor White
    Write-Host "     Frontend : http://localhost:5173" -ForegroundColor White
    Write-Host ""
    Write-Host "Close the opened terminal windows to stop the services." -ForegroundColor Yellow
} else {
    # Linux / macOS: run as background jobs, stream output inline
    Write-Step "BACKEND"  "Starting NestJS dev server..." "Cyan"
    $backendJob = Start-Job -ScriptBlock {
        param($dir)
        Set-Location $dir
        & pnpm start:dev 2>&1
    } -ArgumentList (Join-Path $ROOT "cloudcure-backend")

    Write-Step "FRONTEND" "Starting Vite dev server..." "Cyan"
    $frontendJob = Start-Job -ScriptBlock {
        param($dir)
        Set-Location $dir
        & pnpm dev 2>&1
    } -ArgumentList (Join-Path $ROOT "cloudcure-frontend")

    Write-Host ""
    Write-Host "[OK] Both services are running. Press Ctrl+C to stop." -ForegroundColor Green
    Write-Host "     Backend  : http://localhost:3000" -ForegroundColor White
    Write-Host "     Frontend : http://localhost:5173" -ForegroundColor White
    Write-Host ""

    try {
        while ($true) {
            $backendJob  | Receive-Job | ForEach-Object { Write-Host "[BACKEND]  $_"  -ForegroundColor DarkCyan }
            $frontendJob | Receive-Job | ForEach-Object { Write-Host "[FRONTEND] $_" -ForegroundColor DarkMagenta }
            Start-Sleep -Milliseconds 500
        }
    } finally {
        Write-Host ""
        Write-Step "INFO" "Stopping services..." "Yellow"
        Stop-Job  $backendJob, $frontendJob
        Remove-Job $backendJob, $frontendJob
        Write-Step "OK" "Services stopped." "Green"
    }
}
