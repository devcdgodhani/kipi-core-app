# Mobile App - Quick Start Guide

## ✅ Fixed Issues

**AppNavigator.tsx and TypeScript Errors - RESOLVED**

All TypeScript compilation errors have been fixed:
- Removed web-specific context providers (will implement mobile versions as needed)
- Created minimal Redux store
- All imports now work correctly
- TypeScript compilation passes ✅

## 🚀 Running the App

### 1. Start Metro Bundler
```bash
cd /home/aurum/dev-chetan/kipi-core-app/mobile
npm start
```

### 2. Run on Android
In a new terminal:
```bash
cd /home/aurum/dev-chetan/kipi-core-app/mobile
npm run android
```

### 3. Update Backend URL (Important!)

For testing on a physical device or emulator, update the API URL in:
`src/services/http.ts`

Change from:
```typescript
baseURL: 'http://localhost:3000/api/v1/customer'
```

To (use your machine's IP):
```typescript
baseURL: 'http://192.168.x.x:3000/api/v1/customer'
```

## 📱 Current Features

- ✅ Login Screen (functional with API)
- ✅ Register Screen (functional with API)
- ✅ Bottom Tab Navigation
- ✅ Placeholder screens (Home, Products, Cart, Profile)
- ✅ Theme system
- ✅ TypeScript support

## 🔧 Architecture

The app uses a **progressive implementation** approach:
- Core navigation and auth are complete
- Features will be added screen by screen
- Context providers and state management added as needed
- This keeps the codebase clean and maintainable

## 📝 Next Steps

1. Test the login/register flow
2. Implement Home screen with product sections
3. Add Product listing and details
4. Implement Cart functionality
5. Build Checkout flow

## 🐛 Troubleshooting

**Metro bundler issues?**
```bash
npm start -- --reset-cache
```

**Build errors?**
```bash
cd android && ./gradlew clean && cd ..
npm run android
```

**Can't connect to backend?**
- Make sure backend is running on port 3000
- Update the IP address in `src/services/http.ts`
- Check firewall settings
