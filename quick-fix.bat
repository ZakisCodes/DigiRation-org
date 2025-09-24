@echo off
echo 🔧 Quick Fix for DigiRation PWA
echo ===============================

echo 🧹 Cleaning backend dependencies...
if exist "backend\node_modules" (
    rmdir /s /q backend\node_modules
)
if exist "backend\package-lock.json" (
    del backend\package-lock.json
)

echo 📦 Installing backend dependencies (without native compilation)...
cd backend
npm install --legacy-peer-deps
cd ..

echo ✅ Quick fix complete!
echo.
echo 🚀 Now you can run:
echo   start-dev.bat
echo.
pause