@echo off
echo ========================================
echo Starting Standalone Simple MVP
echo ========================================
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
)

echo.
pause
