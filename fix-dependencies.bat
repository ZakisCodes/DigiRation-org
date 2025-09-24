@echo off
echo 🔧 Fixing DigiRation PWA Dependencies
echo =====================================

echo 🧹 Cleaning up existing dependencies...

REM Clean frontend dependencies
if exist "node_modules" (
    echo Removing frontend node_modules...
    rmdir /s /q node_modules
)
if exist "package-lock.json" (
    echo Removing frontend package-lock.json...
    del package-lock.json
)

REM Clean backend dependencies
if exist "backend\node_modules" (
    echo Removing backend node_modules...
    rmdir /s /q backend\node_modules
)
if exist "backend\package-lock.json" (
    echo Removing backend package-lock.json...
    del backend\package-lock.json
)

echo.
echo 📦 Installing frontend dependencies...
npm install

echo.
echo 📦 Installing backend dependencies...
cd backend
npm install --legacy-peer-deps
cd ..

echo.
echo ✅ Dependencies fixed successfully!
echo.
echo 🚀 You can now run:
echo   start-dev.bat
echo.
pause