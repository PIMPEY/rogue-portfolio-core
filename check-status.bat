@echo off
setlocal enabledelayedexpansion

cd /d "%~dp0"

echo ========================================
echo Project Rogue - Status Check
echo ========================================
echo.
echo Current directory: %CD%
echo.

REM Check Node.js
echo [Node.js]
where node >nul 2>nul
if %errorlevel% equ 0 (
    for /f "tokens=*" %%i in ('node --version') do set NODE_VERSION=%%i
    echo Status: Installed
    echo Version: !NODE_VERSION!
) else (
    echo Status: NOT INSTALLED
    echo Action: Install from https://nodejs.org/
)
echo.

REM Check npm
echo [npm]
where npm >nul 2>nul
if %errorlevel% equ 0 (
    for /f "tokens=*" %%i in ('npm --version') do set NPM_VERSION=%%i
    echo Status: Installed
    echo Version: !NPM_VERSION!
) else (
    echo Status: NOT INSTALLED
)
echo.

REM Check backend
echo [Backend]
if exist "backend\package.json" (
    echo Status: Package file exists
    if exist "backend\node_modules" (
        echo Dependencies: Installed
        for /f "tokens=*" %%i in ('dir /s /b backend\node_modules 2^>nul ^| find /c /v ""') do set COUNT=%%i
        echo Modules: !COUNT! files
    ) else (
        echo Dependencies: NOT INSTALLED
        echo Action: Run npm install in backend directory
    )
) else (
    echo Status: NOT FOUND
)
echo.

REM Check frontend
echo [Frontend]
if exist "app-web\package.json" (
    echo Status: Package file exists
    if exist "app-web\node_modules" (
        echo Dependencies: Installed
        for /f "tokens=*" %%i in ('dir /s /b app-web\node_modules 2^>nul ^| find /c /v ""') do set COUNT=%%i
        echo Modules: !COUNT! files
    ) else (
        echo Dependencies: NOT INSTALLED
        echo Action: Run npm install in app-web directory
    )
) else (
    echo Status: NOT FOUND
)
echo.

REM Check ports
echo [Port Status]
netstat -ano | findstr :3001 >nul 2>nul
if %errorlevel% equ 0 (
    echo Port 3001 (Backend): IN USE
    for /f "tokens=5" %%a in ('netstat -ano ^| findstr :3001') do (
        echo   Process ID: %%a
    )
) else (
    echo Port 3001 (Backend): AVAILABLE
)

netstat -ano | findstr :3000 >nul 2>nul
if %errorlevel% equ 0 (
    echo Port 3000 (Frontend): IN USE
    for /f "tokens=5" %%a in ('netstat -ano ^| findstr :3000') do (
        echo   Process ID: %%a
    )
) else (
    echo Port 3000 (Frontend): AVAILABLE
)
echo.

REM Check standalone files
echo [Standalone HTML Files]
if exist "simple-mvp-standalone.html" (
    echo simple-mvp-standalone.html: EXISTS
) else (
    echo simple-mvp-standalone.html: NOT FOUND
)

if exist "portfolio-standalone.html" (
    echo portfolio-standalone.html: EXISTS
) else (
    echo portfolio-standalone.html: NOT FOUND
)

if exist "companies-standalone.html" (
    echo companies-standalone.html: EXISTS
) else (
    echo companies-standalone.html: NOT FOUND
)
echo.

REM Check environment files
echo [Environment Files]
if exist "backend\.env" (
    echo backend\.env: EXISTS
) else (
    echo backend\.env: NOT FOUND (optional for local dev)
)

if exist "app-web\.env.local" (
    echo app-web\.env.local: EXISTS
) else (
    echo app-web\.env.local: NOT FOUND (optional for local dev)
)
echo.

echo ========================================
echo Status Check Complete!
echo ========================================
echo.
echo Quick Actions:
echo   - Start all servers:    start-all.bat
echo   - Stop all servers:     stop-all.bat
echo   - Restart all servers:  restart-all.bat
echo   - Open standalone MVP:  start-standalone-mvp.bat
echo.
pause
