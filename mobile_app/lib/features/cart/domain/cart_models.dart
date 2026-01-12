import 'package:freezed_annotation/freezed_annotation.dart';

part 'cart_models.freezed.dart';
part 'cart_models.g.dart';

@freezed
class CartItem with _$CartItem {
  const factory CartItem({
    @JsonKey(name: '_id') String? id,
    @JsonKey(name: 'productId') required String productId,
    @JsonKey(name: 'skuId') required String skuId,
    required int quantity,
    String? productName,
    String? productImage,
    double? price,
    double? salePrice,
    Map<String, dynamic>? attributes,
    int? stock,
  }) = _CartItem;

  factory CartItem.fromJson(Map<String, dynamic> json) => _$CartItemFromJson(json);
}

@freezed
class Cart with _$Cart {
  const factory Cart({
    @JsonKey(name: '_id') String? id,
    @JsonKey(name: 'userId') String? userId,
    required List<CartItem> items,
    double? subtotal,
    double? discount,
    double? total,
    String? couponCode,
    DateTime? createdAt,
    DateTime? updatedAt,
  }) = _Cart;

  factory Cart.fromJson(Map<String, dynamic> json) => _$CartFromJson(json);
}

@freezed
class UpdateCartRequest with _$UpdateCartRequest {
  const factory UpdateCartRequest({
    @JsonKey(name: 'productId') required String productId,
    @JsonKey(name: 'skuId') required String skuId,
    required int quantity,
  }) = _UpdateCartRequest;

  factory UpdateCartRequest.fromJson(Map<String, dynamic> json) =>
      _$UpdateCartRequestFromJson(json);
}
