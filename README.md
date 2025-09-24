# DigiRation PWA

A mobile-first Progressive Web App for ration customers in India, built with Next.js and Express.js.

## Features

- 📱 Mobile-first responsive design
- 🔐 Multi-step authentication (Ration ID → OTP → Family Selection → Aadhaar)
- 👥 Family member management with personalized dashboards
- 📦 Ration item tracking with quota management
- 📱 QR code scanning for transactions
- 💳 Simulated cashless payment flows
- 📝 Complaint and feedback system
- 🌐 Multi-language support (English, Hindi, Tamil)
- 📴 Offline-first functionality with sync
- 🚀 PWA features (installable, push notifications)
- 🤖 AI-powered demand forecasting (government dashboard)

## Tech Stack

### Frontend

- **Next.js 14** with App Router
- **React 18** with TypeScript
- **Tailwind CSS** for mobile-first styling
- **React Query** for state management
- **Zustand** for client-side state
- **next-pwa** for PWA functionality

### Backend

- **Express.js** with TypeScript
- **SQLite** with better-sqlite3
- **JWT** for authentication
- **Zod** for validation
- **Winston** for logging

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn
- Docker (optional)

### 🚀 Quick Development Start

**Windows:**

```bash
# Double-click or run:
start-dev.bat
```

**Mac/Linux:**

```bash
# Make executable and run:
chmod +x start-dev.sh
./start-dev.sh
```

**Manual Setup:**

```bash
# Install dependencies
npm install
cd backend && npm install && cd ..

# Start both servers
npm run dev & npm run dev:backend
```

**Access the application:**

- Frontend: http://localhost:3000
- Backend API: http://localhost:3001
- **Test Credentials:** Ration Card `RC001234567890`, Phone `9876543210`, OTP `123456`

### 🌐 Production Deployment

**Vercel (Recommended):**

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel --prod
```

**Netlify:**

```bash
# Install Netlify CLI
npm i -g netlify-cli

# Deploy
netlify deploy --prod
```

**Docker:**

```bash
docker-compose up --build
```

📖 **Detailed Guides:**

- [Development Setup](./DEVELOPMENT.md)
- [Production Deployment](./DEPLOYMENT.md)
- [Quick Deploy Guide](./QUICK-DEPLOY.md)

## Project Structure

```
digiration-pwa/
├── src/                    # Frontend source
│   ├── app/               # Next.js App Router
│   ├── components/        # React components
│   ├── lib/              # Utilities and configs
│   ├── types/            # TypeScript types
│   ├── hooks/            # Custom React hooks
│   └── store/            # State management
├── backend/              # Backend source
│   ├── src/
│   │   ├── routes/       # API routes
│   │   ├── models/       # Data models
│   │   ├── middleware/   # Express middleware
│   │   └── utils/        # Utilities
│   └── data/            # SQLite database
├── public/              # Static assets
└── docs/               # Documentation
```

## API Endpoints

### Authentication

- `POST /api/auth/initiate` - Start login with Ration ID + Phone
- `POST /api/auth/verify-otp` - Verify OTP
- `GET /api/auth/family-members` - Get family members
- `POST /api/auth/select-member` - Select family member
- `POST /api/auth/verify-aadhaar` - Aadhaar verification (bypassed)

### User Management

- `GET /api/user/profile` - Get user profile
- `PUT /api/user/profile` - Update profile

### Rations

- `GET /api/rations/items` - Get ration items
- `GET /api/rations/quota/:memberId` - Get member quota
- `GET /api/rations/stock/:shopId` - Get shop stock

### Transactions

- `GET /api/transactions/history` - Transaction history
- `POST /api/transactions/create` - Create transaction
- `POST /api/transactions/qr-verify` - QR verification

## Mobile Optimization

- **Touch Targets:** Minimum 44px for all interactive elements
- **Responsive Design:** Mobile-first with progressive enhancement
- **Performance:** Code splitting, lazy loading, optimized images
- **Accessibility:** WCAG 2.1 AA compliance
- **PWA:** Service worker, offline support, installable

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make changes with tests
4. Submit a pull request

## License

MIT License - see LICENSE file for details.
