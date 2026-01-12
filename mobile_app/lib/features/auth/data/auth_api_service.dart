import 'package:dio/dio.dart';
import 'package:retrofit/retrofit.dart';
import '../domain/auth_models.dart';
import '../../../common/models/user_model.dart';

part 'auth_api_service.g.dart';

@RestApi()
abstract class AuthApiService {
  factory AuthApiService(Dio dio, {String baseUrl}) = _AuthApiService;

  @POST('/auth/login')
  Future<AuthResponse> login(@Body() LoginRequest request);

  @POST('/auth/register')
  Future<AuthResponse> register(@Body() RegisterRequest request);

  @POST('/auth/sendOtp')
  Future<AuthResponse> sendOtp(@Body() SendOtpRequest request);

  @POST('/auth/verifyOtp')
  Future<void> verifyOtp(@Body() VerifyOtpRequest request);

  @POST('/auth/logout')
  Future<void> logout();

  @GET('/auth/me')
  Future<User> getMe();

  @POST('/auth/changePassword')
  Future<void> changePassword(@Body() Map<String, dynamic> data);

  @POST('/auth/forgetPassword')
  Future<void> resetPassword(@Body() Map<String, dynamic> data);

  @POST('/auth/refreshTokens')
  Future<AuthResponse> refreshToken(@Body() Map<String, String> data);
}
