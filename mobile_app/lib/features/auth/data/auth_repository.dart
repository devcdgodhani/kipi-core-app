import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../core/network/dio_client.dart';
import '../../../common/services/storage_service.dart';
import '../../../common/models/user_model.dart';
import '../domain/auth_models.dart';
import 'auth_api_service.dart';
import 'dart:convert';

final authRepositoryProvider = Provider<AuthRepository>((ref) {
  final dio = ref.read(dioProvider);
  final storage = ref.read(storageServiceProvider);
  return AuthRepository(dio, storage);
});

class AuthRepository {
  final AuthApiService _apiService;
  final StorageService _storage;

  AuthRepository(dio, this._storage) : _apiService = AuthApiService(dio);

  Future<User> login(String email, String password) async {
    final request = LoginRequest(email: email, password: password);
    final response = await _apiService.login(request);
    
    // Save tokens
    await _saveTokens(response.tokens);
    
    // Create and save user
    final user = User(
      id: response.id ?? '',
      email: response.email ?? email,
      firstName: response.firstName,
      lastName: response.lastName,
      mobile: response.mobile,
      type: response.type,
      status: response.status,
    );
    
    await _storage.saveUserData(jsonEncode(user.toJson()));
    return user;
  }

  Future<User> register(RegisterRequest request) async {
    final response = await _apiService.register(request);
    
    // Save tokens
    await _saveTokens(response.tokens);
    
    // Create and save user
    final user = User(
      id: response.id ?? '',
      email: response.email ?? request.email,
      firstName: response.firstName ?? request.firstName,
      lastName: response.lastName ?? request.lastName,
      mobile: response.mobile,
      type: response.type,
      status: response.status,
    );
    
    await _storage.saveUserData(jsonEncode(user.toJson()));
    return user;
  }

  Future<void> sendOtp(String email, String otpType) async {
    final request = SendOtpRequest(email: email, otpType: otpType);
    final response = await _apiService.sendOtp(request);
    
    // Save OTP token
    final otpToken = response.tokens.firstWhere(
      (t) => t.type == 'OTP_TOKEN',
      orElse: () => response.tokens.first,
    );
    await _storage.saveOtpToken(otpToken.token);
  }

  Future<void> verifyOtp(String otp) async {
    final request = VerifyOtpRequest(otp: otp);
    await _apiService.verifyOtp(request);
    
    // Clear OTP token after verification
    await _storage.saveOtpToken('');
  }

  Future<void> logout() async {
    try {
      await _apiService.logout();
    } finally {
      await _storage.clearAuth();
    }
  }

  Future<User?> getCurrentUser() async {
    final userData = await _storage.getUserData();
    if (userData == null || userData.isEmpty) return null;
    
    try {
      return User.fromJson(jsonDecode(userData));
    } catch (e) {
      return null;
    }
  }

  Future<User> getMe() async {
    final user = await _apiService.getMe();
    await _storage.saveUserData(jsonEncode(user.toJson()));
    return user;
  }

  Future<void> changePassword(String oldPassword, String newPassword) async {
    await _apiService.changePassword({
      'oldPassword': oldPassword,
      'newPassword': newPassword,
    });
  }

  Future<void> resetPassword(String newPassword) async {
    await _apiService.resetPassword({
      'newPassword': newPassword,
    });
  }

  Future<void> _saveTokens(List<AuthToken> tokens) async {
    for (var token in tokens) {
      switch (token.type) {
        case 'ACCESS_TOKEN':
          await _storage.saveAccessToken(token.token);
          break;
        case 'REFRESH_TOKEN':
          await _storage.saveRefreshToken(token.token);
          break;
        case 'OTP_TOKEN':
          await _storage.saveOtpToken(token.token);
          break;
      }
    }
  }
}
