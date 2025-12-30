@echo off
setlocal enabledelayedexpansion

echo ========================================
echo Stopping All Servers
echo ========================================
echo.

echo Stopping Backend Server (port 3001)...
for /f "tokens=5" %%a in ('netstat -ano ^| findstr :3001') do (
    echo Killing process %%a...
    taskkill /PID %%a /F >nul 2>nul
)
echo Backend server stopped.
echo.

echo Stopping Frontend Server (port 3000)...
for /f "tokens=5" %%a in ('netstat -ano ^| findstr :3000') do (
    echo Killing process %%a...
    taskkill /PID %%a /F >nul 2>nul
)
echo Frontend server stopped.
echo.

echo ========================================
echo All Servers Stopped!
echo ========================================
echo.
echo To start servers again, run: start-all.bat
echo.
pause
