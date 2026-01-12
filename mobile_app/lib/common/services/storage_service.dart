import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import '../../core/constants/app_constants.dart';

final storageServiceProvider = Provider<StorageService>((ref) {
  return StorageService();
});

class StorageService {
  final FlutterSecureStorage _secureStorage = const FlutterSecureStorage();
  SharedPreferences? _prefs;

  Future<void> init() async {
    _prefs = await SharedPreferences.getInstance();
  }

  // Secure Token Storage
  Future<void> saveAccessToken(String token) async {
    await _secureStorage.write(key: AppConstants.accessTokenKey, value: token);
  }

  Future<String?> getAccessToken() async {
    return await _secureStorage.read(key: AppConstants.accessTokenKey);
  }

  Future<void> saveRefreshToken(String token) async {
    await _secureStorage.write(key: AppConstants.refreshTokenKey, value: token);
  }

  Future<String?> getRefreshToken() async {
    return await _secureStorage.read(key: AppConstants.refreshTokenKey);
  }

  Future<void> saveOtpToken(String token) async {
    await _secureStorage.write(key: AppConstants.otpTokenKey, value: token);
  }

  Future<String?> getOtpToken() async {
    return await _secureStorage.read(key: AppConstants.otpTokenKey);
  }

  // User Data
  Future<void> saveUserData(String userData) async {
    await _prefs?.setString(AppConstants.userDataKey, userData);
  }

  Future<String?> getUserData() async {
    return _prefs?.getString(AppConstants.userDataKey);
  }

  // Cart Data (for guest users)
  Future<void> saveCartData(String cartData) async {
    await _prefs?.setString(AppConstants.cartKey, cartData);
  }

  Future<String?> getCartData() async {
    return _prefs?.getString(AppConstants.cartKey);
  }

  // Theme
  Future<void> saveThemeMode(String mode) async {
    await _prefs?.setString(AppConstants.themeKey, mode);
  }

  Future<String?> getThemeMode() async {
    return _prefs?.getString(AppConstants.themeKey);
  }

  // Clear Auth Data
  Future<void> clearAuth() async {
    await _secureStorage.delete(key: AppConstants.accessTokenKey);
    await _secureStorage.delete(key: AppConstants.refreshTokenKey);
    await _secureStorage.delete(key: AppConstants.otpTokenKey);
    await _prefs?.remove(AppConstants.userDataKey);
  }

  // Clear All Data
  Future<void> clearAll() async {
    await _secureStorage.deleteAll();
    await _prefs?.clear();
  }
}
