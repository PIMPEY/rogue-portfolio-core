@echo off
echo Starting Project Rogue MVP...
echo.

cd /d "%~dp0"

echo Starting Next.js server...
start "Next.js Server" cmd /k "npm start"

echo.
echo Waiting for server to start...
timeout /t 5 /nobreak >nul

echo.
echo Opening browser...
start http://localhost:3000

echo.
echo MVP should be opening in your browser.
echo If it doesn't open, try: http://localhost:3000
echo.
echo Press any key to close this window...
pause >nul