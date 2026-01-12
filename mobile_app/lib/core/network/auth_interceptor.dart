import 'package:dio/dio.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../common/services/storage_service.dart';
import '../constants/app_constants.dart';

class AuthInterceptor extends Interceptor {
  final Ref ref;

  AuthInterceptor(this.ref);

  @override
  void onRequest(RequestOptions options, RequestInterceptorHandler handler) async {
    // Get access token from storage
    final token = await ref.read(storageServiceProvider).getAccessToken();
    
    if (token != null && token.isNotEmpty) {
      options.headers['Authorization'] = 'Bearer $token';
    }

    handler.next(options);
  }

  @override
  void onError(DioException err, ErrorInterceptorHandler handler) async {
    if (err.response?.statusCode == 401) {
      // Token expired, try to refresh
      final refreshToken = await ref.read(storageServiceProvider).getRefreshToken();
      
      if (refreshToken != null && refreshToken.isNotEmpty) {
        try {
          // Attempt to refresh token
          final dio = Dio(BaseOptions(
            baseUrl: err.requestOptions.baseUrl,
          ));
          
          final response = await dio.post(
            '/auth/refreshTokens',
            data: {'refreshToken': refreshToken},
          );

          if (response.statusCode == 200 && response.data != null) {
            final tokens = response.data['tokens'] as List?;
            
            if (tokens != null) {
              for (var tokenObj in tokens) {
                final type = tokenObj['type'] as String?;
                final token = tokenObj['token'] as String?;
                
                if (type == 'ACCESS_TOKEN' && token != null) {
                  await ref.read(storageServiceProvider).saveAccessToken(token);
                } else if (type == 'REFRESH_TOKEN' && token != null) {
                  await ref.read(storageServiceProvider).saveRefreshToken(token);
                }
              }
              
              // Retry the original request with new token
              final newToken = await ref.read(storageServiceProvider).getAccessToken();
              err.requestOptions.headers['Authorization'] = 'Bearer $newToken';
              
              final clonedRequest = await Dio().fetch(err.requestOptions);
              return handler.resolve(clonedRequest);
            }
          }
        } catch (e) {
          // Refresh failed, clear tokens and redirect to login
          await ref.read(storageServiceProvider).clearAuth();
          // TODO: Navigate to login screen
        }
      } else {
        // No refresh token, clear auth
        await ref.read(storageServiceProvider).clearAuth();
      }
    }

    handler.next(err);
  }
}
