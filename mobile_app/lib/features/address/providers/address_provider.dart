import 'package:riverpod_annotation/riverpod_annotation.dart';
import '../data/address_repository.dart';
import '../domain/address_models.dart';

part 'address_provider.g.dart';

@riverpod
class AddressNotifier extends _$AddressNotifier {
  @override
  Future<List<Address>> build() async {
    final repository = ref.read(addressRepositoryProvider);
    return await repository.getAll();
  }

  Future<void> addAddress(Address address) async {
    state = const AsyncValue.loading();
    try {
      final repository = ref.read(addressRepositoryProvider);
      await repository.add(address);
      ref.invalidateSelf();
    } catch (e, stack) {
      state = AsyncValue.error(e, stack);
      rethrow;
    }
  }

  Future<void> updateAddress(Address address) async {
    state = const AsyncValue.loading();
    try {
      final repository = ref.read(addressRepositoryProvider);
      await repository.update(address);
      ref.invalidateSelf();
    } catch (e, stack) {
      state = AsyncValue.error(e, stack);
      rethrow;
    }
  }

  Future<void> deleteAddress(String addressId) async {
    state = const AsyncValue.loading();
    try {
      final repository = ref.read(addressRepositoryProvider);
      await repository.delete(addressId);
      ref.invalidateSelf();
    } catch (e, stack) {
      state = AsyncValue.error(e, stack);
      rethrow;
    }
  }
}
