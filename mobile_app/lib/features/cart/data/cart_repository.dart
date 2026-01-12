import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../core/network/dio_client.dart';
import '../domain/cart_models.dart';
import 'cart_api_service.dart';

final cartRepositoryProvider = Provider<CartRepository>((ref) {
  final dio = ref.read(dioProvider);
  return CartRepository(dio);
});

class CartRepository {
  final CartApiService _apiService;

  CartRepository(dio) : _apiService = CartApiService(dio);

  Future<Cart> getCart() async {
    try {
      return await _apiService.getCart();
    } catch (e) {
      // Return empty cart if not found
      return const Cart(items: []);
    }
  }

  Future<Cart> addToCart({
    required String productId,
    required String skuId,
    int quantity = 1,
  }) async {
    return await _apiService.updateCart(
      UpdateCartRequest(
        productId: productId,
        skuId: skuId,
        quantity: quantity,
      ),
    );
  }

  Future<Cart> updateQuantity({
    required String productId,
    required String skuId,
    required int quantity,
  }) async {
    return await _apiService.updateCart(
      UpdateCartRequest(
        productId: productId,
        skuId: skuId,
        quantity: quantity,
      ),
    );
  }

  Future<void> removeFromCart({
    required String productId,
    required String skuId,
  }) async {
    await _apiService.removeFromCart({
      'productId': productId,
      'skuId': skuId,
    });
  }

  Future<void> clearCart() async {
    await _apiService.clearCart();
  }
}
