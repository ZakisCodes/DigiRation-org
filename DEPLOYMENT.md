# DigiRation PWA - Production Deployment Guide

## 🌐 Deployment Options

We'll cover deployment to:
1. **Vercel** (Recommended for Next.js + API)
2. **Netlify** (Frontend only, separate backend)
3. **Railway/Render** (Full-stack alternative)

## 🚀 Option 1: Vercel Deployment (Recommended)

Vercel is perfect for Next.js apps and can handle both frontend and API routes.

### Step 1: Prepare for Vercel

Create Vercel configuration:

```json
// vercel.json
{
  "version": 2,
  "builds": [
    {
      "src": "package.json",
      "use": "@vercel/next"
    },
    {
      "src": "backend/package.json",
      "use": "@vercel/node"
    }
  ],
  "routes": [
    {
      "src": "/api/(.*)",
      "dest": "/backend/src/server.js"
    },
    {
      "src": "/(.*)",
      "dest": "/$1"
    }
  ],
  "env": {
    "NODE_ENV": "production"
  }
}
```

### Step 2: Environment Variables

Set these in Vercel dashboard:

```bash
# Production Environment Variables
NODE_ENV=production
JWT_SECRET=your-super-secure-jwt-secret-here
FRONTEND_URL=https://your-app.vercel.app
DB_PATH=/tmp/digiration.db
LOG_LEVEL=info
```

### Step 3: Deploy to Vercel

**Method A: Vercel CLI**
```bash
# Install Vercel CLI
npm i -g vercel

# Login to Vercel
vercel login

# Deploy
vercel

# Follow prompts:
# - Link to existing project? No
# - Project name: digiration-pwa
# - Directory: ./
# - Override settings? No
```

**Method B: GitHub Integration**
1. Push code to GitHub
2. Go to [vercel.com](https://vercel.com)
3. Import GitHub repository
4. Configure environment variables
5. Deploy

### Step 4: Configure Domain (Optional)
1. Go to Vercel dashboard
2. Settings → Domains
3. Add custom domain
4. Update DNS records

## 🌐 Option 2: Netlify + Separate Backend

Deploy frontend to Netlify and backend to Railway/Render.

### Frontend to Netlify

#### Step 1: Prepare Frontend
```bash
# Build frontend
npm run build
npm run export  # If using static export
```

#### Step 2: Netlify Configuration
```toml
# netlify.toml
[build]
  command = "npm run build"
  publish = ".next"

[build.environment]
  NODE_VERSION = "18"
  NEXT_PUBLIC_API_URL = "https://your-backend.railway.app"

[[redirects]]
  from = "/api/*"
  to = "https://your-backend.railway.app/api/:splat"
  status = 200

[[headers]]
  for = "/*"
  [headers.values]
    X-Frame-Options = "DENY"
    X-XSS-Protection = "1; mode=block"
```

#### Step 3: Deploy to Netlify
```bash
# Install Netlify CLI
npm install -g netlify-cli

# Login
netlify login

# Deploy
netlify deploy

# Production deploy
netlify deploy --prod
```

### Backend to Railway

#### Step 1: Prepare Backend
```json
// backend/package.json - Add start script
{
  "scripts": {
    "start": "node dist/server.js",
    "build": "tsc",
    "dev": "tsx watch src/server.ts"
  }
}
```

#### Step 2: Railway Deployment
1. Go to [railway.app](https://railway.app)
2. Connect GitHub repository
3. Select backend folder
4. Set environment variables
5. Deploy

## 🐳 Option 3: Docker Deployment

For platforms like DigitalOcean, AWS, or Google Cloud.

### Step 1: Production Docker Files

```dockerfile
# Dockerfile.production
FROM node:18-alpine AS base

# Frontend build
FROM base AS frontend-builder
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build

# Backend build
FROM base AS backend-builder
WORKDIR /app
COPY backend/package*.json ./
RUN npm ci --only=production
COPY backend/ .
RUN npm run build

# Production image
FROM base AS production
WORKDIR /app

# Copy built frontend
COPY --from=frontend-builder /app/.next ./.next
COPY --from=frontend-builder /app/public ./public
COPY --from=frontend-builder /app/package*.json ./

# Copy built backend
COPY --from=backend-builder /app/dist ./backend/dist
COPY --from=backend-builder /app/package*.json ./backend/

# Install production dependencies
RUN npm ci --only=production
RUN cd backend && npm ci --only=production

EXPOSE 3000
CMD ["npm", "start"]
```

### Step 2: Production Docker Compose
```yaml
# docker-compose.prod.yml
version: '3.8'

services:
  app:
    build:
      context: .
      dockerfile: Dockerfile.production
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - JWT_SECRET=${JWT_SECRET}
      - DB_PATH=/app/data/digiration.db
    volumes:
      - app_data:/app/data
    restart: unless-stopped

volumes:
  app_data:
```

## 🔧 Production Configuration

### Environment Variables Setup

Create production environment files:

```bash
# .env.production (for frontend)
NEXT_PUBLIC_API_URL=https://your-api-domain.com
NEXT_PUBLIC_APP_ENV=production

# backend/.env.production (for backend)
NODE_ENV=production
PORT=3001
JWT_SECRET=your-super-secure-jwt-secret-change-this
DB_PATH=/app/data/digiration.db
FRONTEND_URL=https://your-frontend-domain.com
LOG_LEVEL=warn
```

### Database Configuration

For production, consider upgrading from SQLite:

```javascript
// backend/src/database/connection.ts - Production DB
const dbConfig = {
  development: {
    client: 'better-sqlite3',
    connection: { filename: './data/digiration.db' }
  },
  production: {
    client: 'postgresql', // or MySQL
    connection: {
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      ssl: { rejectUnauthorized: false }
    }
  }
};
```

## 📊 Production Monitoring

### Health Checks
```javascript
// Add to backend/src/server.ts
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    version: process.env.npm_package_version,
    environment: process.env.NODE_ENV
  });
});
```

### Error Tracking
```bash
# Add Sentry or similar
npm install @sentry/nextjs @sentry/node
```

### Performance Monitoring
```javascript
// Add to next.config.js
module.exports = {
  experimental: {
    instrumentationHook: true,
  },
  // Add analytics
  analytics: {
    id: process.env.ANALYTICS_ID,
  },
};
```

## 🔒 Production Security

### Security Headers
```javascript
// backend/src/server.ts
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true
  }
}));
```

### Rate Limiting
```javascript
// Add rate limiting
const rateLimit = require('express-rate-limit');

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});

app.use('/api/', limiter);
```

## 🚀 Deployment Checklist

### Pre-Deployment
- [ ] All environment variables configured
- [ ] Database migrations ready
- [ ] SSL certificates configured
- [ ] Domain DNS configured
- [ ] Error tracking setup
- [ ] Performance monitoring setup

### Post-Deployment
- [ ] Health check endpoint working
- [ ] All API endpoints responding
- [ ] Frontend loading correctly
- [ ] PWA features working
- [ ] Mobile responsiveness verified
- [ ] SSL certificate valid
- [ ] Performance metrics acceptable

## 🎯 Quick Deploy Commands

### Vercel
```bash
# One-time setup
npm i -g vercel
vercel login

# Deploy
vercel --prod
```

### Netlify
```bash
# One-time setup
npm i -g netlify-cli
netlify login

# Deploy
netlify deploy --prod --dir=.next
```

### Docker
```bash
# Build and deploy
docker build -f Dockerfile.production -t digiration-pwa .
docker run -p 3000:3000 digiration-pwa
```

## 🌐 Custom Domain Setup

### Vercel Custom Domain
1. Vercel Dashboard → Project → Settings → Domains
2. Add domain: `your-domain.com`
3. Configure DNS:
   ```
   Type: CNAME
   Name: @
   Value: cname.vercel-dns.com
   ```

### Netlify Custom Domain
1. Netlify Dashboard → Site → Domain Settings
2. Add custom domain
3. Configure DNS:
   ```
   Type: CNAME
   Name: www
   Value: your-site.netlify.app
   ```

## 📱 PWA Production Setup

### Service Worker
```javascript
// next.config.js
const withPWA = require('next-pwa')({
  dest: 'public',
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV === 'development'
});

module.exports = withPWA({
  // your next config
});
```

### App Manifest
```json
// public/manifest.json
{
  "name": "DigiRation - Digital Ration Management",
  "short_name": "DigiRation",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#ffffff",
  "theme_color": "#3b82f6",
  "icons": [
    {
      "src": "/icons/icon-192x192.png",
      "sizes": "192x192",
      "type": "image/png"
    }
  ]
}
```

## 🎉 Success!

Your DigiRation PWA is now deployed to production! 

**Next Steps:**
1. Test all functionality on production URL
2. Set up monitoring and alerts
3. Configure backup strategies
4. Plan for scaling and updates

**Production URLs:**
- **Vercel:** `https://your-app.vercel.app`
- **Netlify:** `https://your-app.netlify.app`
- **Custom Domain:** `https://your-domain.com`