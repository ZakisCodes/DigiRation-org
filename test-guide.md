# DigiRation PWA - Complete Testing Guide

## 🚀 Quick Start

### 1. Install Dependencies
```bash
# Install frontend dependencies
npm install

# Install backend dependencies
cd backend && npm install && cd ..
```

### 2. Start the Application
```bash
# Option 1: Start both servers manually
npm run dev &
npm run dev:backend

# Option 2: Use Docker (if you have Docker installed)
npm run docker:dev
```

### 3. Access the Application
- **Frontend:** http://localhost:3000
- **Backend API:** http://localhost:3001
- **Health Check:** http://localhost:3001/health

## 🔐 Test Credentials

### Authentication Flow
1. **Ration Card ID:** `RC001234567890`
2. **Phone Number:** `+919876543210` or `9876543210`
3. **OTP:** `123456` (always works in development)
4. **Family Members:** Choose from Sharma family (Rajesh, Priya, Arjun)
5. **Aadhaar:** Any 12-digit number (e.g., `123456789012`)

### Additional Test Families
- **Kumar Family:** `RC001234567891` / `+919876543211`
- **Raman Family:** `RC001234567892` / `+919876543212`

## 📱 Complete Testing Scenarios

### Scenario 1: First-Time User Journey
1. **Landing Page**
   - Visit http://localhost:3000
   - Should auto-redirect to login

2. **Authentication Flow**
   - Enter ration card ID: `RC001234567890`
   - Enter phone: `9876543210`
   - Click "Send OTP"
   - Enter OTP: `123456`
   - Select family member: "Rajesh Sharma"
   - Enter Aadhaar: `123456789012`
   - Should redirect to dashboard

3. **Dashboard Exploration**
   - View personalized profile card
   - Check quota overview with progress bars
   - Try quick actions (Items, History, Scan, etc.)

### Scenario 2: QR Code Transaction
1. **Navigate to Scanner**
   - Click "Scan QR" from dashboard or bottom nav
   - Allow camera permissions when prompted

2. **QR Scanning**
   - Click "Start Scanning"
   - Point camera at any QR code (or use manual input)
   - Confirm transaction details
   - Proceed to payment

3. **Payment Flow**
   - Select payment method (UPI, QR, Card, or Cash)
   - Complete payment simulation
   - View success page with receipt

### Scenario 3: Items and Quota Management
1. **Browse Items**
   - Navigate to "Items" tab
   - Search for items (e.g., "rice")
   - Filter by category
   - View quota status for each item

2. **Quota Tracking**
   - Check remaining quota amounts
   - View usage percentages
   - See color-coded status indicators

### Scenario 4: Profile Management
1. **Profile Settings**
   - Navigate to "Profile" tab
   - View current member details
   - Switch between family members

2. **Family Member Switching**
   - Click "Family Members" in profile
   - Select different member
   - Notice dashboard updates with new member context

## 🔧 Mobile Testing

### Chrome DevTools Mobile Simulation
1. Open Chrome DevTools (F12)
2. Click device toolbar icon (Ctrl+Shift+M)
3. Select mobile device (iPhone 12, Pixel 5, etc.)
4. Test touch interactions and responsive design

### PWA Testing
1. **Installation Prompt**
   - Look for "Install App" prompt in browser
   - Test home screen installation

2. **Offline Functionality**
   - Disconnect internet
   - Navigate through cached pages
   - Test offline indicators

## 🎯 Feature Testing Checklist

### ✅ Authentication
- [ ] Login with ration card ID and phone
- [ ] OTP verification (use 123456)
- [ ] Family member selection
- [ ] Aadhaar verification (bypassed)
- [ ] Session persistence across page refreshes

### ✅ Dashboard
- [ ] Personalized profile card
- [ ] Quota overview with progress bars
- [ ] Quick actions navigation
- [ ] Recent activity display

### ✅ QR Scanner
- [ ] Camera access and permissions
- [ ] QR code scanning (any QR code works)
- [ ] Manual input fallback
- [ ] Transaction confirmation modal

### ✅ Payment System
- [ ] Payment method selection
- [ ] UPI payment simulation
- [ ] QR code payment interface
- [ ] Card payment form
- [ ] Cash payment confirmation
- [ ] Success page with receipt

### ✅ Items Management
- [ ] Item listing with images
- [ ] Search functionality
- [ ] Category filtering
- [ ] Quota integration and status

### ✅ Profile & Settings
- [ ] Profile information display
- [ ] Family member switching
- [ ] Language preferences
- [ ] Logout functionality

### ✅ Mobile Features
- [ ] Touch-friendly interactions (44px minimum)
- [ ] Responsive design on different screen sizes
- [ ] Bottom navigation
- [ ] Safe area handling (notched devices)

## 🐛 Common Issues & Solutions

### Backend Not Starting
```bash
# Check if port 3001 is available
netstat -an | grep 3001

# Kill process if needed
kill -9 $(lsof -t -i:3001)

# Restart backend
cd backend && npm run dev
```

### Frontend Build Issues
```bash
# Clear Next.js cache
rm -rf .next

# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install

# Restart frontend
npm run dev
```

### Camera Not Working
- Ensure you're using HTTPS or localhost
- Allow camera permissions in browser
- Try different browsers (Chrome recommended)
- Use manual input as fallback

### Database Issues
```bash
# Reset database
rm -rf backend/data/
# Restart backend to recreate with seed data
cd backend && npm run dev
```

## 📊 API Testing

### Health Check
```bash
curl http://localhost:3001/health
```

### Authentication Test
```bash
# Initiate login
curl -X POST http://localhost:3001/api/auth/initiate \
  -H "Content-Type: application/json" \
  -d '{"rationCardId":"RC001234567890","phoneNumber":"+919876543210"}'
```

### Get Items
```bash
curl http://localhost:3001/api/rations/items
```

## 🎨 UI/UX Testing Points

### Mobile-First Design
- [ ] All buttons are at least 44px touch targets
- [ ] Text is readable without zooming
- [ ] Navigation is thumb-friendly
- [ ] Forms work well on mobile keyboards

### Accessibility
- [ ] Screen reader compatibility
- [ ] Keyboard navigation
- [ ] High contrast text
- [ ] Proper ARIA labels

### Performance
- [ ] Fast loading times
- [ ] Smooth animations
- [ ] Responsive interactions
- [ ] Efficient API calls

## 🚀 Advanced Testing

### Multi-Language Support
1. Change language in header
2. Verify UI updates to Hindi/Tamil
3. Test item names in different languages

### Offline Mode
1. Disconnect internet
2. Navigate through app
3. Try to make transactions (should queue)
4. Reconnect and verify sync

### PWA Features
1. Install app to home screen
2. Test standalone mode
3. Verify offline pages
4. Test push notifications (simulated)

## 📝 Test Results Template

```
## Test Session: [Date]

### Environment
- Browser: 
- Device: 
- Screen Size: 

### Authentication ✅/❌
- Login: 
- OTP: 
- Member Selection: 
- Aadhaar: 

### Core Features ✅/❌
- Dashboard: 
- QR Scanner: 
- Payment: 
- Items: 
- Profile: 

### Mobile Experience ✅/❌
- Touch Interactions: 
- Responsive Design: 
- Performance: 

### Issues Found
1. 
2. 
3. 

### Overall Rating: /10
```

## 🎯 Success Criteria

The app is working correctly if:
1. ✅ Authentication flow completes successfully
2. ✅ Dashboard shows personalized data
3. ✅ QR scanner accesses camera and processes codes
4. ✅ Payment flow completes with success page
5. ✅ All navigation works smoothly
6. ✅ Mobile interactions feel natural
7. ✅ No console errors in browser
8. ✅ API responses are fast and reliable

Happy Testing! 🎉