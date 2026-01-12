import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../core/network/dio_client.dart';
import '../domain/order_models.dart';
import 'order_api_service.dart';

final orderRepositoryProvider = Provider<OrderRepository>((ref) {
  final dio = ref.read(dioProvider);
  return OrderRepository(dio);
});

class OrderRepository {
  final OrderApiService _apiService;

  OrderRepository(dio) : _apiService = OrderApiService(dio);

  Future<List<Order>> getOrders({int page = 1, int limit = 10}) async {
    // Modify based on backend actual response structure for pagination if needed
    // Assuming /getAll returns list directly or handling paginated response wrapper might be needed similar to products
    // For now simplistic implementation:
    return await _apiService.getAll({
      'sort': {'createdAt': -1}
    });
  }

  Future<Order> getOrderById(String orderId) async {
    return await _apiService.getOne({'_id': orderId});
  }

  Future<Order> createOrder(Map<String, dynamic> orderData) async {
    return await _apiService.create(orderData);
  }

  Future<void> cancelOrder(String orderId) async {
    await _apiService.cancel({'orderId': orderId});
  }
}
