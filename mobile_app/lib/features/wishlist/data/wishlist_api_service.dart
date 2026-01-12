import 'package:dio/dio.dart';
import 'package:retrofit/retrofit.dart';
import '../domain/wishlist_models.dart';

part 'wishlist_api_service.g.dart';

@RestApi()
abstract class WishlistApiService {
  factory WishlistApiService(Dio dio, {String baseUrl}) = _WishlistApiService;

  @POST('/wishlist/getAll')
  Future<List<WishlistItem>> getAll(@Body() Map<String, dynamic> filters);

  @POST('/wishlist/add')
  Future<WishlistItem> add(@Body() AddToWishlistRequest request);

  @DELETE('/wishlist/remove')
  Future<void> remove(@Body() Map<String, String> body);
}
