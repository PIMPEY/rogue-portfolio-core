@echo off
echo ========================================
echo Restarting All Servers
echo ========================================
echo.

echo Stopping all servers...
call stop-all.bat

echo.
echo Waiting 3 seconds before restarting...
timeout /t 3 /nobreak >nul

echo.
echo Starting all servers...
call start-all.bat
