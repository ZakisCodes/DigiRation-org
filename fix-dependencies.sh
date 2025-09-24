#!/bin/bash

echo "🔧 Fixing DigiRation PWA Dependencies"
echo "====================================="

echo "🧹 Cleaning up existing dependencies..."

# Clean frontend dependencies
if [ -d "node_modules" ]; then
    echo "Removing frontend node_modules..."
    rm -rf node_modules
fi
if [ -f "package-lock.json" ]; then
    echo "Removing frontend package-lock.json..."
    rm package-lock.json
fi

# Clean backend dependencies
if [ -d "backend/node_modules" ]; then
    echo "Removing backend node_modules..."
    rm -rf backend/node_modules
fi
if [ -f "backend/package-lock.json" ]; then
    echo "Removing backend package-lock.json..."
    rm backend/package-lock.json
fi

echo ""
echo "📦 Installing frontend dependencies..."
npm install

echo ""
echo "📦 Installing backend dependencies..."
cd backend
npm install --legacy-peer-deps
cd ..

echo ""
echo "✅ Dependencies fixed successfully!"
echo ""
echo "🚀 You can now run:"
echo "  ./start-dev.sh"
echo ""