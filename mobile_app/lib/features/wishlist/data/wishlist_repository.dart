import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../core/network/dio_client.dart';
import '../domain/wishlist_models.dart';
import 'wishlist_api_service.dart';

final wishlistRepositoryProvider = Provider<WishlistRepository>((ref) {
  final dio = ref.read(dioProvider);
  return WishlistRepository(dio);
});

class WishlistRepository {
  final WishlistApiService _apiService;

  WishlistRepository(dio) : _apiService = WishlistApiService(dio);

  Future<List<WishlistItem>> getAll() async {
    try {
      return await _apiService.getAll({});
    } catch (e) {
      return [];
    }
  }

  Future<WishlistItem> add({
    required String productId,
    String? skuId,
  }) async {
    return await _apiService.add(
      AddToWishlistRequest(
        productId: productId,
        skuId: skuId,
      ),
    );
  }

  Future<void> remove(String productId) async {
    await _apiService.remove({'productId': productId});
  }
}
