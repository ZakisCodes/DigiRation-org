# 🚀 Quick Deployment Guide

## 🏃‍♂️ Development (Local)

### 1. Quick Start
```bash
# Clone and setup
git clone <your-repo>
cd digiration-pwa

# Install dependencies
npm install
cd backend && npm install && cd ..

# Start development (Windows)
start-dev.bat

# Start development (Mac/Linux)
./start-dev.sh
```

### 2. Access Application
- **Frontend:** http://localhost:3000
- **Backend:** http://localhost:3001
- **Test with:** Ration Card `RC001234567890`, Phone `9876543210`, OTP `123456`

## 🌐 Production Deployment

### Option 1: Vercel (Recommended - Easiest)

#### Step 1: Prepare Repository
```bash
# Make sure your code is in GitHub
git add .
git commit -m "Ready for deployment"
git push origin main
```

#### Step 2: Deploy to Vercel
1. Go to [vercel.com](https://vercel.com)
2. Sign up with GitHub
3. Click "New Project"
4. Import your repository
5. Configure:
   - **Framework Preset:** Next.js
   - **Root Directory:** `./`
   - **Build Command:** `npm run build`
   - **Output Directory:** `.next`

#### Step 3: Environment Variables
In Vercel dashboard, add these environment variables:
```
NODE_ENV=production
JWT_SECRET=your-super-secure-jwt-secret-here
NEXT_PUBLIC_API_URL=https://your-app.vercel.app
```

#### Step 4: Deploy
- Click "Deploy"
- Wait for build to complete
- Your app will be live at `https://your-app.vercel.app`

### Option 2: Netlify (Frontend Only)

#### Step 1: Build for Static Export
```bash
# Add to next.config.js
const nextConfig = {
  output: 'export',
  trailingSlash: true,
  images: {
    unoptimized: true
  }
}
```

#### Step 2: Deploy to Netlify
1. Go to [netlify.com](https://netlify.com)
2. Sign up with GitHub
3. Click "New site from Git"
4. Choose your repository
5. Configure:
   - **Build command:** `npm run build && npm run export`
   - **Publish directory:** `out`

#### Step 3: Environment Variables
```
NEXT_PUBLIC_API_URL=https://your-backend-url.com
NODE_ENV=production
```

### Option 3: Railway (Full Stack)

#### Step 1: Backend to Railway
1. Go to [railway.app](https://railway.app)
2. Sign up with GitHub
3. Click "New Project"
4. Select "Deploy from GitHub repo"
5. Choose your repository
6. Set root directory to `backend`
7. Add environment variables:
   ```
   NODE_ENV=production
   JWT_SECRET=your-jwt-secret
   PORT=3001
   ```

#### Step 2: Frontend to Vercel/Netlify
- Follow Vercel or Netlify steps above
- Set `NEXT_PUBLIC_API_URL` to your Railway backend URL

## 🔧 Configuration Files

### For Vercel (Already Created)
- `vercel.json` ✅
- Environment variables in dashboard

### For Netlify (Already Created)
- `netlify.toml` ✅
- Environment variables in dashboard

### For Docker
```bash
# Build and run
docker-compose up --build
```

## 🎯 Quick Deploy Commands

### Vercel CLI
```bash
# Install Vercel CLI
npm i -g vercel

# Login and deploy
vercel login
vercel --prod
```

### Netlify CLI
```bash
# Install Netlify CLI
npm i -g netlify-cli

# Login and deploy
netlify login
netlify deploy --prod
```

## 📱 Post-Deployment Checklist

### Test Your Deployed App
1. ✅ Visit your production URL
2. ✅ Test authentication flow
3. ✅ Test QR scanner (camera permissions)
4. ✅ Test payment simulation
5. ✅ Test mobile responsiveness
6. ✅ Test PWA installation
7. ✅ Check console for errors

### Performance Check
1. ✅ Run Lighthouse audit
2. ✅ Test loading speed
3. ✅ Verify PWA score
4. ✅ Check mobile usability

## 🐛 Common Deployment Issues

### Build Failures
```bash
# Clear cache and rebuild
rm -rf .next node_modules
npm install
npm run build
```

### Environment Variables
- Make sure all required env vars are set
- Check spelling and case sensitivity
- Restart deployment after changes

### API Issues
- Verify backend is deployed and accessible
- Check CORS settings
- Verify API endpoints are working

### PWA Issues
- Ensure manifest.json is accessible
- Check service worker registration
- Verify HTTPS is enabled

## 🎉 Success Indicators

Your deployment is successful if:
1. ✅ App loads without errors
2. ✅ Authentication flow works
3. ✅ All pages are accessible
4. ✅ Mobile design is responsive
5. ✅ PWA features work
6. ✅ No console errors

## 🔗 Useful Links

- **Vercel Docs:** https://vercel.com/docs
- **Netlify Docs:** https://docs.netlify.com
- **Railway Docs:** https://docs.railway.app
- **Next.js Deployment:** https://nextjs.org/docs/deployment

## 📞 Need Help?

If you encounter issues:
1. Check the browser console for errors
2. Verify all environment variables
3. Test the build locally first
4. Check deployment logs in your platform dashboard

Your DigiRation PWA is ready for the world! 🌍