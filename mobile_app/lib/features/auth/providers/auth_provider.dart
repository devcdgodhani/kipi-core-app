import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:riverpod_annotation/riverpod_annotation.dart';
import '../../../common/models/user_model.dart';
import '../data/auth_repository.dart';
import '../domain/auth_models.dart';

part 'auth_provider.g.dart';

// Auth State
class AuthState {
  final User? user;
  final bool isLoading;
  final String? error;
  final bool isAuthenticated;

  AuthState({
    this.user,
    this.isLoading = false,
    this.error,
    this.isAuthenticated = false,
  });

  AuthState copyWith({
    User? user,
    bool? isLoading,
    String? error,
    bool? isAuthenticated,
  }) {
    return AuthState(
      user: user ?? this.user,
      isLoading: isLoading ?? this.isLoading,
      error: error,
      isAuthenticated: isAuthenticated ?? this.isAuthenticated,
    );
  }
}

// Auth Notifier
@riverpod
class Auth extends _$Auth {
  @override
  Future<AuthState> build() async {
    // Check if user is already logged in
    final repository = ref.read(authRepositoryProvider);
    final user = await repository.getCurrentUser();
    
    return AuthState(
      user: user,
      isAuthenticated: user != null,
    );
  }

  Future<void> login(String email, String password) async {
    state = AsyncValue.data(state.value!.copyWith(isLoading: true, error: null));
    
    try {
      final repository = ref.read(authRepositoryProvider);
      final user = await repository.login(email, password);
      
      state = AsyncValue.data(AuthState(
        user: user,
        isAuthenticated: true,
        isLoading: false,
      ));
    } catch (e) {
      state = AsyncValue.data(state.value!.copyWith(
        isLoading: false,
        error: e.toString(),
      ));
      rethrow;
    }
  }

  Future<void> register(RegisterRequest request) async {
    state = AsyncValue.data(state.value!.copyWith(isLoading: true, error: null));
    
    try {
      final repository = ref.read(authRepositoryProvider);
      final user = await repository.register(request);
      
      state = AsyncValue.data(AuthState(
        user: user,
        isAuthenticated: true,
        isLoading: false,
      ));
    } catch (e) {
      state = AsyncValue.data(state.value!.copyWith(
        isLoading: false,
        error: e.toString(),
      ));
      rethrow;
    }
  }

  Future<void> sendOtp(String email, String otpType) async {
    state = AsyncValue.data(state.value!.copyWith(isLoading: true, error: null));
    
    try {
      final repository = ref.read(authRepositoryProvider);
      await repository.sendOtp(email, otpType);
      
      state = AsyncValue.data(state.value!.copyWith(isLoading: false));
    } catch (e) {
      state = AsyncValue.data(state.value!.copyWith(
        isLoading: false,
        error: e.toString(),
      ));
      rethrow;
    }
  }

  Future<void> verifyOtp(String otp) async {
    state = AsyncValue.data(state.value!.copyWith(isLoading: true, error: null));
    
    try {
      final repository = ref.read(authRepositoryProvider);
      await repository.verifyOtp(otp);
      
      state = AsyncValue.data(state.value!.copyWith(isLoading: false));
    } catch (e) {
      state = AsyncValue.data(state.value!.copyWith(
        isLoading: false,
        error: e.toString(),
      ));
      rethrow;
    }
  }

  Future<void> logout() async {
    state = AsyncValue.data(state.value!.copyWith(isLoading: true));
    
    try {
      final repository = ref.read(authRepositoryProvider);
      await repository.logout();
      
      state = AsyncValue.data(AuthState(
        user: null,
        isAuthenticated: false,
        isLoading: false,
      ));
    } catch (e) {
      state = AsyncValue.data(state.value!.copyWith(
        isLoading: false,
        error: e.toString(),
      ));
    }
  }

  Future<void> refreshUser() async {
    try {
      final repository = ref.read(authRepositoryProvider);
      final user = await repository.getMe();
      
      state = AsyncValue.data(state.value!.copyWith(user: user));
    } catch (e) {
      // Silently fail, user data will be stale
    }
  }
}
