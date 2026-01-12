import 'package:freezed_annotation/freezed_annotation.dart';

part 'wishlist_models.freezed.dart';
part 'wishlist_models.g.dart';

@freezed
class WishlistItem with _$WishlistItem {
  const factory WishlistItem({
    @JsonKey(name: '_id') required String id,
    @JsonKey(name: 'userId') required String userId,
    @JsonKey(name: 'productId') required String productId,
    @JsonKey(name: 'skuId') String? skuId,
    DateTime? createdAt,
    DateTime? updatedAt,
  }) = _WishlistItem;

  factory WishlistItem.fromJson(Map<String, dynamic> json) =>
      _$WishlistItemFromJson(json);
}

@freezed
class AddToWishlistRequest with _$AddToWishlistRequest {
  const factory AddToWishlistRequest({
    @JsonKey(name: 'productId') required String productId,
    @JsonKey(name: 'skuId') String? skuId,
  }) = _AddToWishlistRequest;

  factory AddToWishlistRequest.fromJson(Map<String, dynamic> json) =>
      _$AddToWishlistRequestFromJson(json);
}
