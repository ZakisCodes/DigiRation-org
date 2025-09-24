@echo off
echo 🔧 Final Fix for DigiRation PWA
echo ===============================

echo 🧹 Cleaning backend...
cd backend
if exist "node_modules" rmdir /s /q node_modules
if exist "package-lock.json" del package-lock.json

echo 📦 Installing backend dependencies (simplified)...
npm install --legacy-peer-deps

echo 📁 Creating data directory...
if not exist "data" mkdir data

cd ..

echo ✅ All fixes applied!
echo.
echo 🚀 Starting the application...
echo Frontend: http://localhost:3000
echo Backend:  http://localhost:3001
echo.
echo Test with:
echo - Ration Card: RC001234567890
echo - Phone: 9876543210
echo - OTP: 123456
echo.

REM Start both servers
start "DigiRation Frontend" cmd /k "npm run dev"
timeout /t 3 /nobreak > nul
start "DigiRation Backend" cmd /k "cd backend && npm run dev"

echo Both servers are starting...
echo Check the separate windows for any errors.
pause