import 'package:dio/dio.dart';
import 'package:retrofit/retrofit.dart';
import '../domain/address_models.dart';

part 'address_api_service.g.dart';

@RestApi()
abstract class AddressApiService {
  factory AddressApiService(Dio dio, {String baseUrl}) = _AddressApiService;

  @POST('/address/getAll')
  Future<List<Address>> getAll();

  @POST('/address/add')
  Future<Address> add(@Body() Address address);

  @POST('/address/update')
  Future<Address> update(@Body() Address address);

  @DELETE('/address/delete')
  Future<void> delete(@Body() Map<String, String> body);
}
