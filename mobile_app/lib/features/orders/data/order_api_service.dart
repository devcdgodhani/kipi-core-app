import 'package:dio/dio.dart';
import 'package:retrofit/retrofit.dart';
import '../domain/order_models.dart';

part 'order_api_service.g.dart';

@RestApi()
abstract class OrderApiService {
  factory OrderApiService(Dio dio, {String baseUrl}) = _OrderApiService;

  @POST('/order/getAll')
  Future<List<Order>> getAll(@Body() Map<String, dynamic> filters);

  @POST('/order/getOne')
  Future<Order> getOne(@Body() Map<String, dynamic> query);

  @POST('/order/create')
  Future<Order> create(@Body() Map<String, dynamic> data);

  @POST('/order/cancel')
  Future<void> cancel(@Body() Map<String, String> body);
}
