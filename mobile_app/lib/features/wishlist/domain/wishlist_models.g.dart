// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'wishlist_models.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

_$WishlistItemImpl _$$WishlistItemImplFromJson(Map<String, dynamic> json) =>
    _$WishlistItemImpl(
      id: json['_id'] as String,
      userId: json['userId'] as String,
      productId: json['productId'] as String,
      skuId: json['skuId'] as String?,
      createdAt: json['createdAt'] == null
          ? null
          : DateTime.parse(json['createdAt'] as String),
      updatedAt: json['updatedAt'] == null
          ? null
          : DateTime.parse(json['updatedAt'] as String),
    );

Map<String, dynamic> _$$WishlistItemImplToJson(_$WishlistItemImpl instance) =>
    <String, dynamic>{
      '_id': instance.id,
      'userId': instance.userId,
      'productId': instance.productId,
      'skuId': instance.skuId,
      'createdAt': instance.createdAt?.toIso8601String(),
      'updatedAt': instance.updatedAt?.toIso8601String(),
    };

_$AddToWishlistRequestImpl _$$AddToWishlistRequestImplFromJson(
        Map<String, dynamic> json) =>
    _$AddToWishlistRequestImpl(
      productId: json['productId'] as String,
      skuId: json['skuId'] as String?,
    );

Map<String, dynamic> _$$AddToWishlistRequestImplToJson(
        _$AddToWishlistRequestImpl instance) =>
    <String, dynamic>{
      'productId': instance.productId,
      'skuId': instance.skuId,
    };
