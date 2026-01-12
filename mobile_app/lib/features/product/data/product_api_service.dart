import 'package:dio/dio.dart';
import 'package:retrofit/retrofit.dart';
import '../../../common/models/product_model.dart';

part 'product_api_service.g.dart';

@RestApi()
abstract class ProductApiService {
  factory ProductApiService(Dio dio, {String baseUrl}) = _ProductApiService;

  @POST('/product/getAll')
  Future<List<Product>> getAll(@Body() Map<String, dynamic> filters);

  @POST('/product/getWithPagination')
  Future<Map<String, dynamic>> getWithPagination(@Body() Map<String, dynamic> filters);

  @POST('/product/getOne')
  Future<Product> getOne(@Body() Map<String, dynamic> query);

  @POST('/sku/getAll')
  Future<List<SKU>> getSKUs(@Body() Map<String, dynamic> filters);

  @POST('/sku/getOne')
  Future<SKU> getSKU(@Body() Map<String, dynamic> query);
}
