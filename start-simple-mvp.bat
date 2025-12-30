@echo off
echo ========================================
echo Starting Simple MVP
echo ========================================
echo.

echo [1/2] Starting Backend Server...
cd backend
start "Backend Server" cmd /k "npm run dev"
echo Backend server starting on http://localhost:3001
echo.

echo [2/2] Starting Frontend Server...
cd ..\app-web
start "Frontend Server" cmd /k "npm run dev"
echo Frontend server starting on http://localhost:3000
echo.

echo ========================================
echo Servers are starting...
echo.
echo Please wait 10-15 seconds for both servers to fully start.
echo.
echo Then open your browser and go to:
echo http://localhost:3000/simple-mvp
echo.
echo Keep both terminal windows open!
echo ========================================
echo.

timeout /t 15 /nobreak >nul

echo.
echo Opening browser...
start http://localhost:3000/simple-mvp

echo.
echo Done! The landing page should now be open in your browser.
echo.
pause
