import 'package:freezed_annotation/freezed_annotation.dart';

part 'order_models.freezed.dart';
part 'order_models.g.dart';

@freezed
class OrderItem with _$OrderItem {
  const factory OrderItem({
    @JsonKey(name: 'productId') required String productId,
    @JsonKey(name: 'skuId') required String skuId,
    required int quantity,
    required double price,
    String? productName,
    String? productImage,
    Map<String, dynamic>? attributes,
  }) = _OrderItem;

  factory OrderItem.fromJson(Map<String, dynamic> json) => _$OrderItemFromJson(json);
}

@freezed
class Order with _$Order {
  const factory Order({
    @JsonKey(name: '_id') required String id,
    @JsonKey(name: 'userId') required String userId,
    required String orderNumber,
    required List<OrderItem> items,
    required double subtotal,
    required double discount,
    required double shippingCharge,
    required double total,
    required String status,
    required String paymentMethod,
    required String paymentStatus,
    Map<String, dynamic>? shippingAddress,
    Map<String, dynamic>? billingAddress,
    String? trackingNumber,
    String? couponCode,
    DateTime? createdAt,
    DateTime? updatedAt,
    DateTime? deliveredAt,
  }) = _Order;

  factory Order.fromJson(Map<String, dynamic> json) => _$OrderFromJson(json);
}
