import 'package:dio/dio.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:logger/logger.dart';
import '../constants/api_constants.dart';
import '../constants/app_constants.dart';
import 'auth_interceptor.dart';
import 'error_interceptor.dart';
import 'logging_interceptor.dart';

final dioProvider = Provider<Dio>((ref) {
  return DioClient(ref).dio;
});

class DioClient {
  late final Dio dio;
  final Ref ref;
  final Logger logger = Logger();

  DioClient(this.ref) {
    dio = Dio(
      BaseOptions(
        baseUrl: ApiConstants.baseUrl,
        connectTimeout: const Duration(milliseconds: AppConstants.connectionTimeout),
        receiveTimeout: const Duration(milliseconds: AppConstants.receiveTimeout),
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
      ),
    );

    // Add interceptors in order
    dio.interceptors.addAll([
      LoggingInterceptor(logger),
      AuthInterceptor(ref),
      ErrorInterceptor(ref),
    ]);
  }
}
