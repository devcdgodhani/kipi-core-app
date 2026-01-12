// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'order_models.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

_$OrderItemImpl _$$OrderItemImplFromJson(Map<String, dynamic> json) =>
    _$OrderItemImpl(
      productId: json['productId'] as String,
      skuId: json['skuId'] as String,
      quantity: (json['quantity'] as num).toInt(),
      price: (json['price'] as num).toDouble(),
      productName: json['productName'] as String?,
      productImage: json['productImage'] as String?,
      attributes: json['attributes'] as Map<String, dynamic>?,
    );

Map<String, dynamic> _$$OrderItemImplToJson(_$OrderItemImpl instance) =>
    <String, dynamic>{
      'productId': instance.productId,
      'skuId': instance.skuId,
      'quantity': instance.quantity,
      'price': instance.price,
      'productName': instance.productName,
      'productImage': instance.productImage,
      'attributes': instance.attributes,
    };

_$OrderImpl _$$OrderImplFromJson(Map<String, dynamic> json) => _$OrderImpl(
      id: json['_id'] as String,
      userId: json['userId'] as String,
      orderNumber: json['orderNumber'] as String,
      items: (json['items'] as List<dynamic>)
          .map((e) => OrderItem.fromJson(e as Map<String, dynamic>))
          .toList(),
      subtotal: (json['subtotal'] as num).toDouble(),
      discount: (json['discount'] as num).toDouble(),
      shippingCharge: (json['shippingCharge'] as num).toDouble(),
      total: (json['total'] as num).toDouble(),
      status: json['status'] as String,
      paymentMethod: json['paymentMethod'] as String,
      paymentStatus: json['paymentStatus'] as String,
      shippingAddress: json['shippingAddress'] as Map<String, dynamic>?,
      billingAddress: json['billingAddress'] as Map<String, dynamic>?,
      trackingNumber: json['trackingNumber'] as String?,
      couponCode: json['couponCode'] as String?,
      createdAt: json['createdAt'] == null
          ? null
          : DateTime.parse(json['createdAt'] as String),
      updatedAt: json['updatedAt'] == null
          ? null
          : DateTime.parse(json['updatedAt'] as String),
      deliveredAt: json['deliveredAt'] == null
          ? null
          : DateTime.parse(json['deliveredAt'] as String),
    );

Map<String, dynamic> _$$OrderImplToJson(_$OrderImpl instance) =>
    <String, dynamic>{
      '_id': instance.id,
      'userId': instance.userId,
      'orderNumber': instance.orderNumber,
      'items': instance.items,
      'subtotal': instance.subtotal,
      'discount': instance.discount,
      'shippingCharge': instance.shippingCharge,
      'total': instance.total,
      'status': instance.status,
      'paymentMethod': instance.paymentMethod,
      'paymentStatus': instance.paymentStatus,
      'shippingAddress': instance.shippingAddress,
      'billingAddress': instance.billingAddress,
      'trackingNumber': instance.trackingNumber,
      'couponCode': instance.couponCode,
      'createdAt': instance.createdAt?.toIso8601String(),
      'updatedAt': instance.updatedAt?.toIso8601String(),
      'deliveredAt': instance.deliveredAt?.toIso8601String(),
    };
