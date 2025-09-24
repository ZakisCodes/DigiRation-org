@echo off
echo 📊 DigiRation PWA Status Check
echo ==============================

echo.
echo 📦 Frontend Dependencies:
if exist "node_modules" (
    echo ✅ Frontend node_modules exists
) else (
    echo ❌ Frontend node_modules missing
)

echo.
echo 📦 Backend Dependencies:
if exist "backend\node_modules" (
    echo ✅ Backend node_modules exists
) else (
    echo ❌ Backend node_modules missing
)

echo.
echo 🗄️ Database Directory:
if exist "backend\data" (
    echo ✅ Backend data directory exists
) else (
    echo ❌ Backend data directory missing
    mkdir backend\data
    echo ✅ Created backend data directory
)

echo.
echo 🔧 Configuration Files:
if exist "backend\.env" (
    echo ✅ Backend .env file exists
) else (
    echo ❌ Backend .env file missing
)

echo.
echo 🚀 Ready to Start?
if exist "node_modules" if exist "backend\node_modules" (
    echo ✅ All dependencies installed - Ready to start!
    echo.
    echo Run: start-dev.bat
) else (
    echo ❌ Dependencies still installing or missing
    echo.
    echo Wait for installation to complete, then run: start-dev.bat
)

echo.
pause