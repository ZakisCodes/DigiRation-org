#!/bin/bash

# DigiRation PWA Development Startup Script

echo "🚀 Starting DigiRation PWA Development Environment"
echo "=================================================="

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 18+ first."
    exit 1
fi

# Check Node.js version
NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    echo "❌ Node.js version 18+ is required. Current version: $(node -v)"
    exit 1
fi

echo "✅ Node.js version: $(node -v)"

# Install frontend dependencies if needed
if [ ! -d "node_modules" ]; then
    echo "📦 Installing frontend dependencies..."
    npm install
fi

# Install backend dependencies if needed
if [ ! -d "backend/node_modules" ]; then
    echo "📦 Installing backend dependencies..."
    cd backend && npm install --legacy-peer-deps && cd ..
fi

# Create backend data directory if it doesn't exist
mkdir -p backend/data

echo ""
echo "🎯 Starting Development Servers..."
echo "Frontend: http://localhost:3000"
echo "Backend:  http://localhost:3001"
echo "Health:   http://localhost:3001/health"
echo ""
echo "📱 Test Credentials:"
echo "Ration Card: RC001234567890"
echo "Phone:       9876543210"
echo "OTP:         123456"
echo "Aadhaar:     Any 12-digit number"
echo ""
echo "Press Ctrl+C to stop both servers"
echo "=================================================="

# Start both servers
npm run dev &
FRONTEND_PID=$!

cd backend && npm run dev &
BACKEND_PID=$!

# Wait for both processes
wait $FRONTEND_PID $BACKEND_PID