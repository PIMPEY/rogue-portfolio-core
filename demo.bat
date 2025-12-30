@echo off
cd /d "%~dp0"

echo ========================================
echo Project Rogue - Demo
echo ========================================
echo.
echo Opening Local Demo...
echo This will load data from local backend.
echo.

start demo-local.html

echo.
echo Demo should open in your browser.
echo.
echo If data doesn't load, make sure local servers are running.
echo Run: start-all.bat
echo.
pause
