@echo off
setlocal enabledelayedexpansion

REM Change to the directory where this batch file is located
cd /d "%~dp0"

echo ========================================
echo Project Rogue - Local Deployment
echo ========================================
echo.
echo Current directory: %CD%
echo.

REM Check if Node.js is installed
where node >nul 2>nul
if %errorlevel% neq 0 (
    echo ERROR: Node.js is not installed!
    echo Please install Node.js from https://nodejs.org/
    pause
    exit /b 1
)

echo [1/6] Checking Node.js version...
for /f "tokens=*" %%i in ('node --version') do set NODE_VERSION=%%i
echo Node.js version: !NODE_VERSION!
echo.

REM Check if npm is installed
where npm >nul 2>nul
if %errorlevel% neq 0 (
    echo ERROR: npm is not installed!
    pause
    exit /b 1
)

echo [2/6] Checking npm version...
for /f "tokens=*" %%i in ('npm --version') do set NPM_VERSION=%%i
echo npm version: !NPM_VERSION!
echo.

REM Check backend dependencies
echo [3/6] Checking backend dependencies...
if not exist "backend\node_modules" (
    echo Installing backend dependencies...
    cd backend
    call npm install --silent
    if %errorlevel% neq 0 (
        echo ERROR: Failed to install backend dependencies
        cd ..
        pause
        exit /b 1
    )
    cd ..
    echo Backend dependencies installed.
) else (
    echo Backend dependencies already installed.
)
echo.

REM Check frontend dependencies
echo [4/6] Checking frontend dependencies...
if not exist "app-web\node_modules" (
    echo Installing frontend dependencies...
    cd app-web
    call npm install --silent
    if %errorlevel% neq 0 (
        echo ERROR: Failed to install frontend dependencies
        cd ..
        pause
        exit /b 1
    )
    cd ..
    echo Frontend dependencies installed.
) else (
    echo Frontend dependencies already installed.
)
echo.

REM Check if ports are available
echo [5/6] Checking port availability...
netstat -ano | findstr :3001 >nul 2>nul
if %errorlevel% equ 0 (
    echo WARNING: Port 3001 is already in use!
    echo Attempting to free port 3001...
    for /f "tokens=5" %%a in ('netstat -ano ^| findstr :3001') do (
        taskkill /PID %%a /F >nul 2>nul
    )
    timeout /t 2 /nobreak >nul
)

netstat -ano | findstr :3000 >nul 2>nul
if %errorlevel% equ 0 (
    echo WARNING: Port 3000 is already in use!
    echo Attempting to free port 3000...
    for /f "tokens=5" %%a in ('netstat -ano ^| findstr :3000') do (
        taskkill /PID %%a /F >nul 2>nul
    )
    timeout /t 2 /nobreak >nul
)
echo Ports are available.
echo.

REM Start servers
echo [6/6] Starting servers...
echo.

echo Starting Backend Server (port 3001)...
cd backend
start "Backend Server" cmd /k "npm run dev"
cd ..
echo Backend server starting...
echo.

echo Starting Frontend Server (port 3000)...
cd app-web
start "Frontend Server" cmd /k "npm run dev"
cd ..
echo Frontend server starting...
echo.

echo ========================================
echo Deployment Complete!
echo ========================================
echo.
echo Servers are starting...
echo Please wait 10-15 seconds for both servers to fully start.
echo.
echo Available URLs:
echo   - Simple MVP:     http://localhost:3000/simple-mvp
echo   - Portfolio:      http://localhost:3000
echo   - Backend API:    http://localhost:3001
echo   - Standalone MVP: simple-mvp-standalone.html
echo   - Standalone Portfolio: portfolio-standalone.html
echo.
echo Press any key to open the Portfolio Dashboard in your browser...
pause >nul

start http://localhost:3000

echo.
echo ========================================
echo Development Environment Ready!
echo ========================================
echo.
echo Keep both terminal windows open!
echo.
echo To stop all servers, run: stop-all.bat
echo To restart servers, run: restart-all.bat
echo.
pause
