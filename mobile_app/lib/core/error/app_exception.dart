class AppException implements Exception {
  final String message;
  final int? statusCode;
  final dynamic data;

  AppException({
    required this.message,
    this.statusCode,
    this.data,
  });

  @override
  String toString() => message;
}

class NetworkException extends AppException {
  NetworkException({String? message})
      : super(
          message: message ?? 'No internet connection',
          statusCode: 0,
        );
}

class UnauthorizedException extends AppException {
  UnauthorizedException({String? message})
      : super(
          message: message ?? 'Unauthorized access',
          statusCode: 401,
        );
}

class NotFoundException extends AppException {
  NotFoundException({String? message})
      : super(
          message: message ?? 'Resource not found',
          statusCode: 404,
        );
}

class ServerException extends AppException {
  ServerException({String? message})
      : super(
          message: message ?? 'Server error occurred',
          statusCode: 500,
        );
}

class ValidationException extends AppException {
  ValidationException({String? message, dynamic data})
      : super(
          message: message ?? 'Validation failed',
          statusCode: 400,
          data: data,
        );
}
