@echo off
cd /d "%~dp0"

echo ========================================
echo Project Rogue - Demo
echo ========================================
echo.
echo Opening Portfolio Dashboard...
echo This will load data from Railway backend.
echo.

start portfolio-standalone.html

echo.
echo Portfolio should open in your browser.
echo.
echo If data doesn't load, check browser console (F12) for errors.
echo.
pause
