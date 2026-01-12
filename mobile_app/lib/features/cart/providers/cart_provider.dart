import 'package:riverpod_annotation/riverpod_annotation.dart';
import '../data/cart_repository.dart';
import '../domain/cart_models.dart';

part 'cart_provider.g.dart';

@riverpod
class CartNotifier extends _$CartNotifier {
  @override
  Future<Cart> build() async {
    final repository = ref.read(cartRepositoryProvider);
    return await repository.getCart();
  }

  Future<void> addToCart({
    required String productId,
    required String skuId,
    int quantity = 1,
  }) async {
    state = const AsyncValue.loading();
    
    try {
      final repository = ref.read(cartRepositoryProvider);
      final cart = await repository.addToCart(
        productId: productId,
        skuId: skuId,
        quantity: quantity,
      );
      
      state = AsyncValue.data(cart);
    } catch (e, stack) {
      state = AsyncValue.error(e, stack);
      rethrow;
    }
  }

  Future<void> updateQuantity({
    required String productId,
    required String skuId,
    required int quantity,
  }) async {
    if (quantity <= 0) {
      await removeFromCart(productId: productId, skuId: skuId);
      return;
    }

    state = const AsyncValue.loading();
    
    try {
      final repository = ref.read(cartRepositoryProvider);
      final cart = await repository.updateQuantity(
        productId: productId,
        skuId: skuId,
        quantity: quantity,
      );
      
      state = AsyncValue.data(cart);
    } catch (e, stack) {
      state = AsyncValue.error(e, stack);
      rethrow;
    }
  }

  Future<void> removeFromCart({
    required String productId,
    required String skuId,
  }) async {
    state = const AsyncValue.loading();
    
    try {
      final repository = ref.read(cartRepositoryProvider);
      await repository.removeFromCart(
        productId: productId,
        skuId: skuId,
      );
      
      // Refresh cart
      final cart = await repository.getCart();
      state = AsyncValue.data(cart);
    } catch (e, stack) {
      state = AsyncValue.error(e, stack);
      rethrow;
    }
  }

  Future<void> clearCart() async {
    state = const AsyncValue.loading();
    
    try {
      final repository = ref.read(cartRepositoryProvider);
      await repository.clearCart();
      
      state = const AsyncValue.data(Cart(items: []));
    } catch (e, stack) {
      state = AsyncValue.error(e, stack);
      rethrow;
    }
  }

  Future<void> refresh() async {
    state = const AsyncValue.loading();
    
    try {
      final repository = ref.read(cartRepositoryProvider);
      final cart = await repository.getCart();
      state = AsyncValue.data(cart);
    } catch (e, stack) {
      state = AsyncValue.error(e, stack);
    }
  }

  int get itemCount {
    return state.value?.items.fold<int>(
          0,
          (sum, item) => sum + item.quantity,
        ) ??
        0;
  }

  double get total {
    return state.value?.total ?? 0.0;
  }
}
