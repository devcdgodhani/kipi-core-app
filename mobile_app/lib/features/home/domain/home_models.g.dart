// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'home_models.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

_$BannerImpl _$$BannerImplFromJson(Map<String, dynamic> json) => _$BannerImpl(
      id: json['_id'] as String,
      title: json['title'] as String,
      description: json['description'] as String?,
      image: json['image'] as String?,
      link: json['link'] as String?,
      linkType: json['linkType'] as String?,
      order: (json['order'] as num?)?.toInt(),
      status: json['status'] as String?,
      createdAt: json['createdAt'] == null
          ? null
          : DateTime.parse(json['createdAt'] as String),
      updatedAt: json['updatedAt'] == null
          ? null
          : DateTime.parse(json['updatedAt'] as String),
    );

Map<String, dynamic> _$$BannerImplToJson(_$BannerImpl instance) =>
    <String, dynamic>{
      '_id': instance.id,
      'title': instance.title,
      'description': instance.description,
      'image': instance.image,
      'link': instance.link,
      'linkType': instance.linkType,
      'order': instance.order,
      'status': instance.status,
      'createdAt': instance.createdAt?.toIso8601String(),
      'updatedAt': instance.updatedAt?.toIso8601String(),
    };

_$FlashDealImpl _$$FlashDealImplFromJson(Map<String, dynamic> json) =>
    _$FlashDealImpl(
      id: json['_id'] as String,
      name: json['name'] as String,
      description: json['description'] as String?,
      startDate: DateTime.parse(json['startDate'] as String),
      endDate: DateTime.parse(json['endDate'] as String),
      productIds: (json['productIds'] as List<dynamic>?)
          ?.map((e) => e as String)
          .toList(),
      discountPercentage: (json['discountPercentage'] as num?)?.toDouble(),
      status: json['status'] as String?,
      createdAt: json['createdAt'] == null
          ? null
          : DateTime.parse(json['createdAt'] as String),
      updatedAt: json['updatedAt'] == null
          ? null
          : DateTime.parse(json['updatedAt'] as String),
    );

Map<String, dynamic> _$$FlashDealImplToJson(_$FlashDealImpl instance) =>
    <String, dynamic>{
      '_id': instance.id,
      'name': instance.name,
      'description': instance.description,
      'startDate': instance.startDate.toIso8601String(),
      'endDate': instance.endDate.toIso8601String(),
      'productIds': instance.productIds,
      'discountPercentage': instance.discountPercentage,
      'status': instance.status,
      'createdAt': instance.createdAt?.toIso8601String(),
      'updatedAt': instance.updatedAt?.toIso8601String(),
    };

_$HomeDataImpl _$$HomeDataImplFromJson(Map<String, dynamic> json) =>
    _$HomeDataImpl(
      banners: (json['banners'] as List<dynamic>)
          .map((e) => Banner.fromJson(e as Map<String, dynamic>))
          .toList(),
      categories: json['categories'] as List<dynamic>,
      featuredProducts: json['featuredProducts'] as List<dynamic>,
      flashDeals: (json['flashDeals'] as List<dynamic>?)
          ?.map((e) => FlashDeal.fromJson(e as Map<String, dynamic>))
          .toList(),
    );

Map<String, dynamic> _$$HomeDataImplToJson(_$HomeDataImpl instance) =>
    <String, dynamic>{
      'banners': instance.banners,
      'categories': instance.categories,
      'featuredProducts': instance.featuredProducts,
      'flashDeals': instance.flashDeals,
    };
