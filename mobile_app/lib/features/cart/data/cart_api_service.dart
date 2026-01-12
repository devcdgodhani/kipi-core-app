import 'package:dio/dio.dart';
import 'package:retrofit/retrofit.dart';
import '../domain/cart_models.dart';

part 'cart_api_service.g.dart';

@RestApi()
abstract class CartApiService {
  factory CartApiService(Dio dio, {String baseUrl}) = _CartApiService;

  @GET('/cart/get')
  Future<Cart> getCart();

  @POST('/cart/update')
  Future<Cart> updateCart(@Body() UpdateCartRequest request);

  @DELETE('/cart/remove')
  Future<void> removeFromCart(@Body() Map<String, String> body);

  @DELETE('/cart/clear')
  Future<void> clearCart();
}
