@echo off
echo ===========================================
echo Setting up Skill Career Tracker...
echo ===========================================
echo.

echo 1. Installing Frontend Dependencies...
call npm install
if %errorlevel% neq 0 (
    echo Error installing frontend dependencies!
    pause
    exit /b
)

echo.
echo 2. Installing Backend Dependencies...
cd server
call npm install
if %errorlevel% neq 0 (
    echo Error installing backend dependencies!
    pause
    exit /b
)
cd ..

echo.
echo ===========================================
echo Starting Servers...
echo ===========================================

echo Starting Backend (Port 5000)...
start "Skill Tracker Backend" cmd /k "cd server && npm run dev"

echo Starting Frontend (Port 5173)...
start "Skill Tracker Frontend" cmd /k "npm run dev"

echo.
echo Servers are launching in new windows!
echo Please wait for them to be ready, then open:
echo http://localhost:5173
echo.
pause
