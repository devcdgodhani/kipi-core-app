import 'package:riverpod_annotation/riverpod_annotation.dart';
import '../data/wishlist_repository.dart';
import '../domain/wishlist_models.dart';

part 'wishlist_provider.g.dart';

@riverpod
class WishlistNotifier extends _$WishlistNotifier {
  @override
  Future<List<WishlistItem>> build() async {
    final repository = ref.read(wishlistRepositoryProvider);
    return await repository.getAll();
  }

  Future<void> addToWishlist({
    required String productId,
    String? skuId,
  }) async {
    state = const AsyncValue.loading();
    
    try {
      final repository = ref.read(wishlistRepositoryProvider);
      await repository.add(productId: productId, skuId: skuId);
      
      // Refresh wishlist
      final items = await repository.getAll();
      state = AsyncValue.data(items);
    } catch (e, stack) {
      state = AsyncValue.error(e, stack);
      rethrow;
    }
  }

  Future<void> removeFromWishlist(String productId) async {
    state = const AsyncValue.loading();
    
    try {
      final repository = ref.read(wishlistRepositoryProvider);
      await repository.remove(productId);
      
      // Refresh wishlist
      final items = await repository.getAll();
      state = AsyncValue.data(items);
    } catch (e, stack) {
      state = AsyncValue.error(e, stack);
      rethrow;
    }
  }

  Future<void> refresh() async {
    state = const AsyncValue.loading();
    
    try {
      final repository = ref.read(wishlistRepositoryProvider);
      final items = await repository.getAll();
      state = AsyncValue.data(items);
    } catch (e, stack) {
      state = AsyncValue.error(e, stack);
    }
  }

  bool isInWishlist(String productId) {
    return state.value?.any((item) => item.productId == productId) ?? false;
  }

  int get itemCount {
    return state.value?.length ?? 0;
  }
}
