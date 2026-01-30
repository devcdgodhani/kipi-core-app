# Metro Bundler Status

✅ **Metro bundler is already running!**

The message "A dev server is already running for this project on port 8081" means your Metro bundler started successfully and is ready.

## Next Steps

### Option 1: Run on Android (Recommended)

Open a **new terminal** and run:

```bash
cd /home/aurum/dev-chetan/kipi-core-app/mobile
npm run android
```

This will:
1. Build the Android app
2. Install it on your emulator/device
3. Connect to the Metro bundler on port 8081

### Option 2: Check Metro Bundler

The Metro bundler is running in your current terminal. You should see:
- "Welcome to Metro"
- "Dev server ready"
- Port 8081 listening

If you don't see output, that's normal - it's running in the background.

### Option 3: Restart Metro (if needed)

If you want to see the Metro output:

1. Stop the current process (Ctrl+C)
2. Clear cache and restart:
```bash
npm start -- --reset-cache
```

## Important: Update Backend URL

Before running the app, update the API URL in:
`src/services/http.ts`

Change:
```typescript
baseURL: 'http://localhost:3000/api/v1/customer'
```

To (use your machine's IP):
```typescript
baseURL: 'http://192.168.x.x:3000/api/v1/customer'
```

Find your IP with: `ip addr show` or `hostname -I`

## Troubleshooting

**Port 8081 already in use?**
```bash
npx react-native start --port 8082
```

**Metro not responding?**
```bash
npm start -- --reset-cache
```

**Build errors?**
```bash
cd android && ./gradlew clean && cd ..
npm run android
```
