// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'cart_models.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

_$CartItemImpl _$$CartItemImplFromJson(Map<String, dynamic> json) =>
    _$CartItemImpl(
      id: json['_id'] as String?,
      productId: json['productId'] as String,
      skuId: json['skuId'] as String,
      quantity: (json['quantity'] as num).toInt(),
      productName: json['productName'] as String?,
      productImage: json['productImage'] as String?,
      price: (json['price'] as num?)?.toDouble(),
      salePrice: (json['salePrice'] as num?)?.toDouble(),
      attributes: json['attributes'] as Map<String, dynamic>?,
      stock: (json['stock'] as num?)?.toInt(),
    );

Map<String, dynamic> _$$CartItemImplToJson(_$CartItemImpl instance) =>
    <String, dynamic>{
      '_id': instance.id,
      'productId': instance.productId,
      'skuId': instance.skuId,
      'quantity': instance.quantity,
      'productName': instance.productName,
      'productImage': instance.productImage,
      'price': instance.price,
      'salePrice': instance.salePrice,
      'attributes': instance.attributes,
      'stock': instance.stock,
    };

_$CartImpl _$$CartImplFromJson(Map<String, dynamic> json) => _$CartImpl(
      id: json['_id'] as String?,
      userId: json['userId'] as String?,
      items: (json['items'] as List<dynamic>)
          .map((e) => CartItem.fromJson(e as Map<String, dynamic>))
          .toList(),
      subtotal: (json['subtotal'] as num?)?.toDouble(),
      discount: (json['discount'] as num?)?.toDouble(),
      total: (json['total'] as num?)?.toDouble(),
      couponCode: json['couponCode'] as String?,
      createdAt: json['createdAt'] == null
          ? null
          : DateTime.parse(json['createdAt'] as String),
      updatedAt: json['updatedAt'] == null
          ? null
          : DateTime.parse(json['updatedAt'] as String),
    );

Map<String, dynamic> _$$CartImplToJson(_$CartImpl instance) =>
    <String, dynamic>{
      '_id': instance.id,
      'userId': instance.userId,
      'items': instance.items,
      'subtotal': instance.subtotal,
      'discount': instance.discount,
      'total': instance.total,
      'couponCode': instance.couponCode,
      'createdAt': instance.createdAt?.toIso8601String(),
      'updatedAt': instance.updatedAt?.toIso8601String(),
    };

_$UpdateCartRequestImpl _$$UpdateCartRequestImplFromJson(
        Map<String, dynamic> json) =>
    _$UpdateCartRequestImpl(
      productId: json['productId'] as String,
      skuId: json['skuId'] as String,
      quantity: (json['quantity'] as num).toInt(),
    );

Map<String, dynamic> _$$UpdateCartRequestImplToJson(
        _$UpdateCartRequestImpl instance) =>
    <String, dynamic>{
      'productId': instance.productId,
      'skuId': instance.skuId,
      'quantity': instance.quantity,
    };
