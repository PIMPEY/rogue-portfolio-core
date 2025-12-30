@echo off
REM Change to the directory where this batch file is located
cd /d "%~dp0"

echo ========================================
echo Starting Standalone Simple MVP
echo ========================================
echo.
echo Current directory: %CD%
echo.
echo This opens the standalone HTML file that works without any servers.
echo No backend or frontend required!
echo.

if exist "simple-mvp-standalone.html" (
    echo Opening Simple MVP in browser...
    start simple-mvp-standalone.html
    echo.
    echo Done! The Simple MVP should now be open in your browser.
) else (
    echo ERROR: simple-mvp-standalone.html not found!
    echo Please make sure you're in the correct directory.
    echo Current directory: %CD%
)

echo.
pause
