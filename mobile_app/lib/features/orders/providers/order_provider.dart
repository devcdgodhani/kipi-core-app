import 'package:riverpod_annotation/riverpod_annotation.dart';
import '../data/order_repository.dart';
import '../domain/order_models.dart';

part 'order_provider.g.dart';

@riverpod
class OrderList extends _$OrderList {
  @override
  Future<List<Order>> build() async {
    final repository = ref.read(orderRepositoryProvider);
    return await repository.getOrders();
  }

  Future<void> refresh() async {
    state = const AsyncValue.loading();
    try {
      final repository = ref.read(orderRepositoryProvider);
      final orders = await repository.getOrders();
      state = AsyncValue.data(orders);
    } catch (e, stack) {
      state = AsyncValue.error(e, stack);
    }
  }
}

@riverpod
Future<Order> orderDetail(OrderDetailRef ref, String orderId) async {
  final repository = ref.read(orderRepositoryProvider);
  return await repository.getOrderById(orderId);
}
