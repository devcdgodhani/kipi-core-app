# Kipi Customer App - Flutter

A production-ready Flutter mobile application for Kipi Fashion e-commerce platform.

## 🚀 Quick Start

### Prerequisites
- Flutter SDK 3.27.1 or higher
- Dart 3.6.0 or higher
- Android Studio / Xcode (for mobile development)

### Installation

1. **Navigate to the project**
   ```bash
   cd /home/aurum/dev-chetan/kipi-core-app/mobile_app
   ```

2. **Add Flutter to PATH** (if not already in system PATH)
   ```bash
   export PATH="$PATH:/home/aurum/dev-chetan/kipi-core-app/flutter_sdk/flutter/bin"
   ```

3. **Install dependencies**
   ```bash
   flutter pub get
   ```

4. **Generate code** (for Freezed models and Riverpod providers)
   ```bash
   flutter pub run build_runner build --delete-conflicting-outputs
   ```

5. **Run the app**
   ```bash
   flutter run
   ```

## 📱 Build Commands

### Android APK
```bash
flutter build apk --release
```

### Android App Bundle (for Play Store)
```bash
flutter build appbundle --release
```

### iOS (requires macOS)
```bash
flutter build ios --release
```

## 🏗️ Architecture

This app follows **Clean Architecture** with a feature-first approach:

```
lib/
├── core/                  # Core utilities
│   ├── constants/         # API & App constants
│   ├── error/             # Exception handling
│   ├── network/           # Dio client & interceptors
│   └── widgets/           # Global widgets
├── theme/                 # Theme & styling
├── routes/                # GoRouter configuration
├── common/                # Shared models & services
│   ├── models/            # User, Product models
│   └── services/          # Storage service
└── features/              # Feature modules
    ├── auth/
    │   ├── data/          # API service & repository
    │   ├── domain/        # Models & entities
    │   ├── providers/     # Riverpod state
    │   └── presentation/  # UI screens
    ├── home/
    ├── product/
    ├── cart/
    ├── checkout/
    ├── orders/
    ├── wallet/
    └── profile/
```

## 🔧 Tech Stack

- **State Management**: Riverpod 2.x
- **Networking**: Dio + Retrofit
- **Routing**: GoRouter
- **Storage**: SharedPreferences + FlutterSecureStorage
- **Code Generation**: Freezed + build_runner
- **UI**: Material 3

## 🔐 Authentication Flow

1. User enters email/password
2. App calls `/auth/login` API
3. Backend returns tokens (ACCESS_TOKEN, REFRESH_TOKEN)
4. Tokens stored securely in FlutterSecureStorage
5. AuthInterceptor automatically adds token to all requests
6. On 401 error, AuthInterceptor refreshes token automatically

## 🌐 API Configuration

Update the base URL in `lib/core/constants/api_constants.dart`:

```dart
static const String baseUrl = 'http://your-backend-url/api/v1';
```

## 📦 Key Dependencies

| Package | Version | Purpose |
|---------|---------|---------|
| flutter_riverpod | ^2.5.1 | State management |
| dio | ^5.4.0 | HTTP client |
| go_router | ^13.0.0 | Navigation |
| freezed | ^2.4.6 | Immutable models |
| retrofit | ^4.0.3 | Type-safe API calls |
| flutter_secure_storage | ^9.0.0 | Secure token storage |
| cached_network_image | ^3.3.1 | Image caching |
| shimmer | ^3.0.0 | Loading skeletons |

## 🧪 Testing

```bash
# Run unit tests
flutter test

# Run with coverage
flutter test --coverage
```

## 📝 Code Generation

Whenever you modify Freezed models or Riverpod providers, run:

```bash
flutter pub run build_runner build --delete-conflicting-outputs
```

Or watch for changes:

```bash
flutter pub run build_runner watch --delete-conflicting-outputs
```

## 🎨 Theme

The app uses a premium fashion-focused theme with:
- Primary: Black (#1A1A1A)
- Accent: Gold (#D4AF37)
- Material 3 design system
- Light & Dark mode support

## 🚧 Current Status

### ✅ Completed
- Project setup & dependencies
- Core architecture (network, storage, error handling)
- Theme system
- Auth feature (models, API service, repository, state)
- Login screen
- Router with auth guards

### 🔄 In Progress
- Additional auth screens (Signup, OTP, Forgot Password)
- Home screen
- Product listing & details
- Cart & Wishlist
- Checkout flow
- Orders & Wallet
- Profile management

## 📄 License

Proprietary - Kipi Fashion

## 👥 Contributors

- Development Team

---

For questions or issues, contact the development team.
