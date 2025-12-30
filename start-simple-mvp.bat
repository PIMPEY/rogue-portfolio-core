@echo off
echo ========================================
echo Starting Simple MVP
echo ========================================
echo.

REM Check if node_modules exist
if not exist "backend\node_modules" (
    echo ERROR: backend node_modules not found!
    echo Please run: cd backend && npm install
    pause
    exit /b 1
)

if not exist "app-web\node_modules" (
    echo ERROR: app-web node_modules not found!
    echo Please run: cd app-web && npm install
    pause
    exit /b 1
)

echo [1/2] Starting Backend Server...
cd backend
start "Backend Server" cmd /k "npm run dev"
cd ..
echo Backend server starting on http://localhost:3001
echo.

echo [2/2] Starting Frontend Server...
cd app-web
start "Frontend Server" cmd /k "npm run dev"
cd ..
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
echo Done! The Simple MVP page should now be open in your browser.
echo.
pause
