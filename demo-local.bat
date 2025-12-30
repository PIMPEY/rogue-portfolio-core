@echo off
cd /d "%~dp0"

echo ========================================
echo Project Rogue - Local Demo
echo ========================================
echo.
echo Starting local servers...
echo.

call start-all.bat

echo.
echo Waiting 15 seconds for servers to start...
timeout /t 15 /nobreak >nul

echo.
echo Opening demo page...
start demo-railway.html

echo.
echo Demo should open in your browser.
echo This will load data from local servers (http://localhost:3001)
echo.
pause
