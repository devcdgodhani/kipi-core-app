# Flutter App - Quick Reference Guide

## 🚀 Common Commands

### Setup & Build
```bash
# Navigate to project
cd /home/aurum/dev-chetan/kipi-core-app/mobile_app

# Add Flutter to PATH (add to ~/.bashrc for permanent)
export PATH="$PATH:/home/aurum/dev-chetan/kipi-core-app/flutter_sdk/flutter/bin"

# Install dependencies
flutter pub get

# Generate code (REQUIRED after model changes)
./generate.sh
# OR
flutter pub run build_runner build --delete-conflicting-outputs

# Run app
flutter run

# Build APK
flutter build apk --release

# Clean build
flutter clean && flutter pub get
```

---

## 📝 Code Generation

**When to run:**
- After creating/modifying Freezed models (`@freezed`)
- After creating/modifying Riverpod providers (`@riverpod`)
- After creating/modifying Retrofit services (`@RestApi`)

**What it generates:**
- `*.freezed.dart` - Freezed model code
- `*.g.dart` - JSON serialization + Riverpod providers
- `*_api_service.g.dart` - Retrofit implementation

---

## 🔧 Adding a New Feature

### 1. Create Models
```dart
// lib/features/my_feature/domain/my_models.dart
import 'package:freezed_annotation/freezed_annotation.dart';

part 'my_models.freezed.dart';
part 'my_models.g.dart';

@freezed
class MyModel with _$MyModel {
  const factory MyModel({
    @JsonKey(name: '_id') required String id,
    required String name,
  }) = _MyModel;

  factory MyModel.fromJson(Map<String, dynamic> json) => 
      _$MyModelFromJson(json);
}
```

### 2. Create API Service
```dart
// lib/features/my_feature/data/my_api_service.dart
import 'package:dio/dio.dart';
import 'package:retrofit/retrofit.dart';
import '../domain/my_models.dart';

part 'my_api_service.g.dart';

@RestApi()
abstract class MyApiService {
  factory MyApiService(Dio dio) = _MyApiService;

  @POST('/my-endpoint/getAll')
  Future<List<MyModel>> getAll(@Body() Map<String, dynamic> filters);
}
```

### 3. Create Repository
```dart
// lib/features/my_feature/data/my_repository.dart
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../core/network/dio_client.dart';
import '../domain/my_models.dart';
import 'my_api_service.dart';

final myRepositoryProvider = Provider<MyRepository>((ref) {
  final dio = ref.read(dioProvider);
  return MyRepository(dio);
});

class MyRepository {
  final MyApiService _apiService;

  MyRepository(dio) : _apiService = MyApiService(dio);

  Future<List<MyModel>> getAll() async {
    return await _apiService.getAll({'status': 'ACTIVE'});
  }
}
```

### 4. Create Provider
```dart
// lib/features/my_feature/providers/my_provider.dart
import 'package:riverpod_annotation/riverpod_annotation.dart';
import '../data/my_repository.dart';
import '../domain/my_models.dart';

part 'my_provider.g.dart';

@riverpod
Future<List<MyModel>> myData(MyDataRef ref) async {
  final repository = ref.read(myRepositoryProvider);
  return await repository.getAll();
}
```

### 5. Create Screen
```dart
// lib/features/my_feature/presentation/my_screen.dart
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../providers/my_provider.dart';

class MyScreen extends ConsumerWidget {
  const MyScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final dataAsync = ref.watch(myDataProvider);

    return Scaffold(
      appBar: AppBar(title: const Text('My Feature')),
      body: dataAsync.when(
        data: (items) => ListView.builder(
          itemCount: items.length,
          itemBuilder: (context, index) {
            final item = items[index];
            return ListTile(title: Text(item.name));
          },
        ),
        loading: () => const Center(child: CircularProgressIndicator()),
        error: (error, _) => Center(child: Text('Error: $error')),
      ),
    );
  }
}
```

### 6. Add Route
```dart
// lib/routes/app_router.dart
GoRoute(
  path: '/my-feature',
  builder: (context, state) => const MyScreen(),
),
```

### 7. Generate Code
```bash
./generate.sh
```

---

## 🎨 Using Reusable Components

### KipiButton
```dart
import '../../core/widgets/kipi_button.dart';

// Primary button
KipiButton(
  text: 'Submit',
  onPressed: () {},
  isLoading: false,
)

// Outline button
KipiButton(
  text: 'Cancel',
  type: ButtonType.outline,
  onPressed: () {},
)

// With icon
KipiButton(
  text: 'Add to Cart',
  icon: Icons.shopping_cart,
  onPressed: () {},
)
```

### ProductCard
```dart
import '../../core/widgets/product_card.dart';

ProductCard(
  product: myProduct,
  onTap: () {
    context.push('/product/${myProduct.id}');
  },
  onFavorite: () {
    // Add to wishlist
  },
  isFavorite: false,
)
```

### ShimmerLoader
```dart
import '../../core/widgets/shimmer_loader.dart';

// Custom shimmer
ShimmerLoader(
  width: 200,
  height: 100,
  borderRadius: BorderRadius.circular(12),
)

// Pre-built shimmers
ProductCardShimmer()
BannerShimmer()
CategoryChipShimmer()
```

---

## 🔄 State Management Patterns

### Simple Data Fetching
```dart
@riverpod
Future<MyData> myData(MyDataRef ref) async {
  final repository = ref.read(myRepositoryProvider);
  return await repository.getData();
}

// In UI:
final dataAsync = ref.watch(myDataProvider);
```

### Complex State (with mutations)
```dart
@riverpod
class MyNotifier extends _$MyNotifier {
  @override
  Future<MyState> build() async {
    return MyState(items: []);
  }

  Future<void> addItem(Item item) async {
    state = AsyncValue.data(
      state.value!.copyWith(
        items: [...state.value!.items, item],
      ),
    );
  }
}

// In UI:
final notifier = ref.read(myNotifierProvider.notifier);
notifier.addItem(newItem);
```

### Refresh Data
```dart
// Invalidate provider to refetch
ref.invalidate(myDataProvider);

// Or use RefreshIndicator
RefreshIndicator(
  onRefresh: () async {
    ref.invalidate(myDataProvider);
  },
  child: /* your list */,
)
```

---

## 🌐 Navigation

### Basic Navigation
```dart
import 'package:go_router/go_router.dart';

// Push
context.push('/product/123');

// Go (replace)
context.go('/home');

// Pop
context.pop();

// With query params
context.push('/search?q=shirt');

// Access params
final id = state.pathParameters['id'];
final query = state.uri.queryParameters['q'];
```

### Bottom Navigation
Already implemented in `app_router.dart` with `MainScaffold`.

---

## 🎯 Common Patterns

### Loading States
```dart
dataAsync.when(
  data: (data) => /* Success UI */,
  loading: () => /* Shimmer or CircularProgressIndicator */,
  error: (error, _) => /* Error UI */,
)
```

### Error Handling
```dart
try {
  await repository.doSomething();
} catch (e) {
  if (mounted) {
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(content: Text(e.toString())),
    );
  }
}
```

### Form Validation
```dart
final _formKey = GlobalKey<FormState>();

Form(
  key: _formKey,
  child: TextFormField(
    validator: (value) {
      if (value == null || value.isEmpty) {
        return 'Required';
      }
      return null;
    },
  ),
)

// Validate
if (_formKey.currentState!.validate()) {
  // Submit
}
```

---

## 🐛 Debugging

### View Logs
```bash
flutter run
# Logs will appear in console
```

### Hot Reload
Press `r` in terminal while app is running

### Hot Restart
Press `R` in terminal

### Debug Network Calls
Check console for LoggingInterceptor output:
```
REQUEST[POST] => PATH: /auth/login
RESPONSE[200] => PATH: /auth/login
```

---

## 📦 Adding New Dependencies

1. Add to `pubspec.yaml`:
```yaml
dependencies:
  my_package: ^1.0.0
```

2. Install:
```bash
flutter pub get
```

3. Import in code:
```dart
import 'package:my_package/my_package.dart';
```

---

## 🔐 Environment Variables

Update in `lib/core/constants/api_constants.dart`:
```dart
static const String baseUrl = 'http://YOUR_IP:5000/api/v1';
```

For production, consider using:
- `flutter_dotenv` package
- Build flavors (dev, staging, prod)

---

## ✅ Pre-Deployment Checklist

- [ ] Run code generation
- [ ] Update API base URL
- [ ] Test all flows
- [ ] Check for console errors
- [ ] Test on real device
- [ ] Build release APK
- [ ] Test release build
- [ ] Update version in `pubspec.yaml`

---

## 🆘 Troubleshooting

### "Code generation failed"
```bash
flutter clean
flutter pub get
./generate.sh
```

### "Provider not found"
Make sure you ran code generation after creating `@riverpod` providers.

### "Network error"
- Check backend is running
- Verify API base URL
- Check device/emulator has internet
- Check CORS if using web

### "Token expired"
AuthInterceptor should handle this automatically. If not:
- Check refresh token is valid
- Verify `/auth/refreshTokens` endpoint works

---

**Keep this guide handy for quick reference!** 📚
