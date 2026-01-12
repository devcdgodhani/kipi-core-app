import 'package:dio/dio.dart';
import 'package:retrofit/retrofit.dart';
import '../domain/home_models.dart';
import '../../../common/models/product_model.dart';

part 'home_api_service.g.dart';

@RestApi()
abstract class HomeApiService {
  factory HomeApiService(Dio dio, {String baseUrl}) = _HomeApiService;

  @POST('/banner/getAll')
  Future<List<Banner>> getBanners(@Body() Map<String, dynamic> filters);

  @POST('/category/getAll')
  Future<List<Category>> getCategories(@Body() Map<String, dynamic> filters);

  @POST('/product/getWithPagination')
  Future<Map<String, dynamic>> getFeaturedProducts(@Body() Map<String, dynamic> filters);

  @GET('/flashDeal/getActive')
  Future<List<FlashDeal>> getActiveFlashDeals();
}
