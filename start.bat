@echo off
setlocal enabledelayedexpansion

echo ============================================
echo         CloudCure - Start Script
echo ============================================
echo.

:: ---- Check Node.js ----
where node >nul 2>&1
if %ERRORLEVEL% neq 0 (
    echo [ERROR] Node.js is not installed or not in PATH.
    echo         Download it from: https://nodejs.org
    pause
    exit /b 1
)
for /f "tokens=*" %%v in ('node --version') do set NODE_VER=%%v
echo [OK] Node.js found: %NODE_VER%

:: ---- Check / Install pnpm ----
where pnpm >nul 2>&1
if %ERRORLEVEL% neq 0 (
    echo [INFO] pnpm not found. Installing via npm...
    npm install -g pnpm
    if %ERRORLEVEL% neq 0 (
        echo [ERROR] Failed to install pnpm. Check your npm setup.
        pause
        exit /b 1
    )
    echo [OK] pnpm installed successfully.
) else (
    for /f "tokens=*" %%v in ('pnpm --version') do set PNPM_VER=%%v
    echo [OK] pnpm found: v%PNPM_VER%
)

echo.
echo ============================================
echo  Installing dependencies...
echo ============================================
echo.

:: ---- Backend: pnpm install ----
echo [BACKEND] Running pnpm install...
pushd "%~dp0cloudcure-backend"
call pnpm install
if %ERRORLEVEL% neq 0 (
    echo [ERROR] Backend pnpm install failed.
    popd
    pause
    exit /b 1
)
popd
echo [BACKEND] Dependencies installed.

:: ---- Frontend: pnpm install ----
echo [FRONTEND] Running pnpm install...
pushd "%~dp0cloudcure-frontend"
call pnpm install
if %ERRORLEVEL% neq 0 (
    echo [ERROR] Frontend pnpm install failed.
    popd
    pause
    exit /b 1
)
popd
echo [FRONTEND] Dependencies installed.

echo.
echo ============================================
echo  Starting services...
echo ============================================
echo.

:: ---- Start Backend in a new window ----
echo [BACKEND] Starting NestJS dev server...
start "CloudCure - Backend" cmd /k "cd /d "%~dp0cloudcure-backend" && pnpm start:dev"

:: ---- Start Frontend in a new window ----
echo [FRONTEND] Starting Vite dev server...
start "CloudCure - Frontend" cmd /k "cd /d "%~dp0cloudcure-frontend" && pnpm dev"

echo.
echo [OK] Both services launched in separate windows.
echo      Backend  : http://localhost:3000
echo      Frontend : http://localhost:5173
echo.
echo Close the opened terminal windows to stop the services.
pause
endlocal
