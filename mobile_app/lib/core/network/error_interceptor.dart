import 'package:dio/dio.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../error/app_exception.dart';

class ErrorInterceptor extends Interceptor {
  final Ref ref;

  ErrorInterceptor(this.ref);

  @override
  void onError(DioException err, ErrorInterceptorHandler handler) {
    AppException exception;

    switch (err.type) {
      case DioExceptionType.connectionTimeout:
      case DioExceptionType.sendTimeout:
      case DioExceptionType.receiveTimeout:
        exception = AppException(
          message: 'Connection timeout. Please check your internet connection.',
          statusCode: 408,
        );
        break;

      case DioExceptionType.badResponse:
        final statusCode = err.response?.statusCode ?? 500;
        final message = _extractErrorMessage(err.response?.data);
        
        exception = AppException(
          message: message,
          statusCode: statusCode,
        );
        break;

      case DioExceptionType.cancel:
        exception = AppException(
          message: 'Request cancelled',
          statusCode: 499,
        );
        break;

      case DioExceptionType.connectionError:
        exception = AppException(
          message: 'No internet connection. Please check your network.',
          statusCode: 0,
        );
        break;

      default:
        exception = AppException(
          message: 'Something went wrong. Please try again.',
          statusCode: 500,
        );
    }

    handler.reject(
      DioException(
        requestOptions: err.requestOptions,
        error: exception,
        type: err.type,
        response: err.response,
      ),
    );
  }

  String _extractErrorMessage(dynamic data) {
    if (data == null) return 'An error occurred';
    
    if (data is Map) {
      // Try different common error message keys
      if (data['message'] != null) return data['message'].toString();
      if (data['error'] != null) return data['error'].toString();
      if (data['msg'] != null) return data['msg'].toString();
    }
    
    return 'An error occurred';
  }
}
