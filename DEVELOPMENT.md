# DigiRation PWA - Development Setup Guide

## 🛠️ Prerequisites

- **Node.js 18+** (Download from [nodejs.org](https://nodejs.org/))
- **npm** or **yarn** (comes with Node.js)
- **Git** (for version control)
- **VS Code** (recommended editor)

## 🚀 Quick Development Start

### 1. Install Dependencies

```bash
# Install frontend dependencies
npm install

# Install backend dependencies
cd backend
npm install
cd ..
```

### 2. Environment Setup

The `.env` file is already created in the backend folder with development settings:

```bash
# backend/.env (already configured)
NODE_ENV=development
PORT=3001
DB_PATH=./data/digiration.db
JWT_SECRET=dev-secret-key-change-this-in-production
FRONTEND_URL=http://localhost:3000
```

### 3. Start Development Servers

**Option A: Use the batch file (Windows)**
```bash
# Double-click or run:
start-dev.bat
```

**Option B: Manual start (Cross-platform)**
```bash
# Terminal 1 - Frontend
npm run dev

# Terminal 2 - Backend
npm run dev:backend
```

**Option C: Single command (runs both)**
```bash
# This will start both servers
npm run dev & npm run dev:backend
```

### 4. Access the Application

- **Frontend:** http://localhost:3000
- **Backend API:** http://localhost:3001
- **API Health:** http://localhost:3001/health

## 🧪 Development Testing

### Test Credentials
- **Ration Card:** `RC001234567890`
- **Phone:** `9876543210`
- **OTP:** `123456`
- **Aadhaar:** Any 12-digit number

### Development Features
- ✅ Hot reload for frontend changes
- ✅ Auto-restart for backend changes
- ✅ SQLite database with seed data
- ✅ Mock OTP (always 123456)
- ✅ Simulated payment processing
- ✅ Console logging for debugging

## 🔧 Development Tools

### VS Code Extensions (Recommended)
```json
{
  "recommendations": [
    "bradlc.vscode-tailwindcss",
    "esbenp.prettier-vscode",
    "ms-vscode.vscode-typescript-next",
    "formulahendry.auto-rename-tag",
    "christian-kohler.path-intellisense"
  ]
}
```

### Package Scripts
```bash
# Frontend
npm run dev          # Start Next.js dev server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
npm run type-check   # TypeScript type checking

# Backend
npm run dev:backend  # Start Express dev server
npm run build:backend # Build backend
npm run start:backend # Start production backend

# Docker
npm run docker:dev   # Start with Docker Compose
npm run docker:build # Build Docker images
```

## 🐛 Troubleshooting Development Issues

### Port Already in Use
```bash
# Windows
netstat -ano | findstr :3000
netstat -ano | findstr :3001
taskkill /PID <PID> /F

# macOS/Linux
lsof -ti:3000 | xargs kill -9
lsof -ti:3001 | xargs kill -9
```

### Database Issues
```bash
# Reset database (will recreate with seed data)
rm -rf backend/data/
# Restart backend server
```

### Node Modules Issues
```bash
# Clean install
rm -rf node_modules package-lock.json
npm install

# Backend clean install
cd backend
rm -rf node_modules package-lock.json
npm install
cd ..
```

### TypeScript Errors
```bash
# Check types
npm run type-check

# Clear Next.js cache
rm -rf .next
npm run dev
```

## 📱 Mobile Development Testing

### Chrome DevTools
1. Open Chrome DevTools (F12)
2. Click device toolbar (Ctrl+Shift+M)
3. Select mobile device
4. Test responsive design

### Real Device Testing
```bash
# Find your IP address
# Windows
ipconfig

# macOS/Linux
ifconfig

# Access from mobile device
http://[YOUR_IP]:3000
```

### PWA Testing
1. Open in Chrome
2. Look for install prompt
3. Test offline functionality
4. Check service worker in DevTools

## 🔄 Development Workflow

### 1. Making Changes
- Frontend changes auto-reload
- Backend changes auto-restart
- Database changes require server restart

### 2. Adding New Features
1. Create feature branch
2. Update types in `src/types/`
3. Add API endpoints in `backend/src/routes/`
4. Create UI components in `src/components/`
5. Test thoroughly

### 3. Database Changes
1. Update schema in `backend/src/database/schema.sql`
2. Update models in `backend/src/models/`
3. Update seed data if needed
4. Restart backend server

## 📊 Development Monitoring

### API Testing
```bash
# Health check
curl http://localhost:3001/health

# Test authentication
curl -X POST http://localhost:3001/api/auth/initiate \
  -H "Content-Type: application/json" \
  -d '{"rationCardId":"RC001234567890","phoneNumber":"+919876543210"}'
```

### Logs
- Frontend logs: Browser console
- Backend logs: Terminal output
- Database: SQLite file in `backend/data/`

## 🎯 Development Best Practices

### Code Quality
- Use TypeScript for type safety
- Follow ESLint rules
- Use Prettier for formatting
- Write meaningful commit messages

### Performance
- Optimize images and assets
- Use React Query for API caching
- Implement proper loading states
- Test on slow networks

### Security
- Never commit sensitive data
- Use environment variables
- Validate all inputs
- Test authentication flows

## 🚀 Ready for Production?

Once development is complete:
1. ✅ All features working locally
2. ✅ No console errors
3. ✅ Mobile responsive
4. ✅ PWA features functional
5. ✅ API endpoints tested

Proceed to the Production Deployment Guide!