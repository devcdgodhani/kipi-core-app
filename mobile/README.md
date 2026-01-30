# Kipi Mobile App

Modern React Native mobile application for the Kipi e-commerce platform.

## 🚀 Quick Start

### Prerequisites

- Node.js >= 20
- npm or yarn
- Android Studio (for Android development)
- Xcode (for iOS development, macOS only)

### Installation

```bash
cd /home/aurum/dev-chetan/kipi-core-app/mobile
npm install
```

### Running the App

#### Start Metro Bundler
```bash
npm start
```

#### Run on Android
```bash
npm run android
```

#### Run on iOS (macOS only)
```bash
npm run ios
```

## 📁 Project Structure

```
src/
├── screens/          # All screen components
├── components/       # Reusable UI components
├── navigation/       # Navigation configuration
├── services/         # API services
├── context/          # Context providers
├── store/            # Redux store
├── types/            # TypeScript types
├── theme/            # Theme configuration
└── assets/           # Images, fonts
```

## 🎨 Features

- ✅ Authentication (Login, Register)
- ✅ Bottom Tab Navigation
- ✅ Theme System
- ✅ API Integration with AsyncStorage
- 🔄 Home Screen (In Progress)
- 🔄 Product Listing & Details (In Progress)
- 🔄 Shopping Cart (In Progress)
- 🔄 Checkout Flow (In Progress)
- 🔄 User Profile (In Progress)

## 🛠️ Tech Stack

- **Framework**: React Native 0.83.1
- **Language**: TypeScript
- **Navigation**: React Navigation
- **State Management**: Redux Toolkit + Context API
- **API Client**: Axios
- **Storage**: AsyncStorage
- **UI**: Custom components with theme system

## 📱 Screens

### Implemented
- Login Screen
- Register Screen
- Home Screen (placeholder)
- Product List Screen (placeholder)
- Product Detail Screen (placeholder)
- Cart Screen (placeholder)
- Profile Screen (placeholder)

### To Be Implemented
- OTP Verification
- Forgot/Reset Password
- Checkout
- Orders
- Wallet
- Wishlist
- Notifications
- Address Management

## 🔧 Configuration

### Backend URL

Update the API base URL in `src/services/http.ts`:

```typescript
baseURL: 'http://YOUR_IP_ADDRESS:3000/api/v1/customer'
```

For local development, replace `localhost` with your machine's IP address to test on physical devices.

## 📝 Development Notes

- All TypeScript types are reused from the web application
- API services are adapted for React Native (AsyncStorage instead of localStorage)
- Theme configuration provides consistent styling across the app
- Navigation uses stack and tab navigators for optimal UX

## 🧪 Testing

```bash
npm test
```

## 📦 Building

### Android
```bash
cd android
./gradlew assembleRelease
```

### iOS
```bash
cd ios
pod install
cd ..
npx react-native run-ios --configuration Release
```

## 📄 License

Private - Kipi Core App

## 👥 Team

Developed by the Kipi development team.
