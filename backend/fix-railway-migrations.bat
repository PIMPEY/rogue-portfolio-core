@echo off
REM Railway Migration Fix Script for Windows
REM This script helps resolve ghost migrations on Railway

echo =========================================
echo Railway Migration Fix Script
echo =========================================
echo.

REM Check if DATABASE_URL is set
if "%DATABASE_URL%"=="" (
    echo ❌ ERROR: DATABASE_URL is not set
    echo.
    echo Please set it first:
    echo set DATABASE_URL=postgresql://user:pass@host:port/database
    echo.
    echo You can find your Railway DATABASE_URL in:
    echo Railway Dashboard -^> PostgreSQL Service -^> Variables
    pause
    exit /b 1
)

echo ✅ DATABASE_URL is set
echo.

REM Check Prisma CLI is available
where npx >nul 2>nul
if %errorlevel% neq 0 (
    echo ❌ ERROR: npx is not available
    echo Please install Node.js and npm
    pause
    exit /b 1
)

echo ✅ Prisma CLI is available
echo.

REM Show current migration status
echo =========================================
echo Current Migration Status
echo =========================================
npx prisma migrate status
echo.

REM Ask user what to do
echo =========================================
echo Available Actions
echo =========================================
echo 1) Resolve ghost migration as rolled back
echo 2) Deploy migrations
echo 3) Reset database (WARNING: deletes all data)
echo 4) Exit
echo.
set /p choice="Choose an option (1-4): "

if "%choice%"=="1" goto resolve
if "%choice%"=="2" goto deploy
if "%choice%"=="3" goto reset
if "%choice%"=="4" goto exit
echo ❌ ERROR: Invalid option
pause
exit /b 1

:resolve
echo.
echo Resolving ghost migration...
set /p migration_name="Enter migration name to resolve (e.g., 20251229155517_phase1_investment_setup): "

if "%migration_name%"=="" (
    echo ❌ ERROR: Migration name is required
    pause
    exit /b 1
)

echo.
echo Running: npx prisma migrate resolve --rolled-back %migration_name%
npx prisma migrate resolve --rolled-back %migration_name%

if %errorlevel% neq 0 (
    echo.
    echo ❌ ERROR: Failed to resolve migration
    pause
    exit /b 1
)

echo.
echo ✅ Migration resolved successfully
echo.
echo Now running migrate deploy...
npx prisma migrate deploy
goto done

:deploy
echo.
echo Running migrate deploy...
npx prisma migrate deploy
goto done

:reset
echo.
echo ⚠️  WARNING: This will delete all data in the database!
set /p confirm="Are you sure? (type 'yes' to confirm): "

if not "%confirm%"=="yes" (
    echo Cancelled
    pause
    exit /b 0
)

echo.
echo Resetting database...
npx prisma migrate reset --force
goto done

:exit
echo Exiting...
exit /b 0

:done
echo.
echo =========================================
echo Final Migration Status
echo =========================================
npx prisma migrate status
echo.

echo ✅ Done!
pause
