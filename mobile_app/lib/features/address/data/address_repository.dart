import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../core/network/dio_client.dart';
import '../domain/address_models.dart';
import 'address_api_service.dart';

final addressRepositoryProvider = Provider<AddressRepository>((ref) {
  final dio = ref.read(dioProvider);
  return AddressRepository(dio);
});

class AddressRepository {
  final AddressApiService _apiService;

  AddressRepository(dio) : _apiService = AddressApiService(dio);

  Future<List<Address>> getAll() async {
    try {
      return await _apiService.getAll();
    } catch (e) {
      return [];
    }
  }

  Future<Address> add(Address address) async {
    return await _apiService.add(address);
  }

  Future<Address> update(Address address) async {
    return await _apiService.update(address);
  }

  Future<void> delete(String addressId) async {
    await _apiService.delete({'addressId': addressId});
  }
}
