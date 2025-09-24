@echo off
echo 🚀 Starting DigiRation PWA Development Environment
echo ==================================================

REM Check if Node.js is installed
node --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Node.js is not installed. Please install Node.js 18+ first.
    pause
    exit /b 1
)

echo ✅ Node.js version: 
node --version

REM Install frontend dependencies if needed
if not exist "node_modules" (
    echo 📦 Installing frontend dependencies...
    npm install
)

REM Install backend dependencies if needed
if not exist "backend\node_modules" (
    echo 📦 Installing backend dependencies...
    cd backend
    npm install --legacy-peer-deps
    cd ..
)

REM Create backend data directory if it doesn't exist
if not exist "backend\data" mkdir backend\data

echo.
echo 🎯 Starting Development Servers...
echo Frontend: http://localhost:3000
echo Backend:  http://localhost:3001
echo Health:   http://localhost:3001/health
echo.
echo 📱 Test Credentials:
echo Ration Card: RC001234567890
echo Phone:       9876543210
echo OTP:         123456
echo Aadhaar:     Any 12-digit number
echo.
echo Press Ctrl+C to stop both servers
echo ==================================================

REM Start both servers
start "Frontend" cmd /k "npm run dev"
start "Backend" cmd /k "cd backend && npm run dev"

echo Both servers are starting in separate windows...
echo You can close this window now.
pause