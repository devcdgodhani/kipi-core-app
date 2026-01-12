import 'package:freezed_annotation/freezed_annotation.dart';

part 'product_model.freezed.dart';
part 'product_model.g.dart';

@freezed
class Product with _$Product {
  const factory Product({
    @JsonKey(name: '_id') required String id,
    required String name,
    String? slug,
    String? description,
    @JsonKey(name: 'categoryId') String? categoryId,
    List<String>? images,
    double? basePrice,
    double? salePrice,
    String? status,
    @JsonKey(name: 'isFeatured') bool? isFeatured,
    @JsonKey(name: 'isNewArrival') bool? isNewArrival,
    int? viewCount,
    double? rating,
    int? reviewCount,
    DateTime? createdAt,
    DateTime? updatedAt,
  }) = _Product;

  factory Product.fromJson(Map<String, dynamic> json) => _$ProductFromJson(json);
}

@freezed
class SKU with _$SKU {
  const factory SKU({
    @JsonKey(name: '_id') required String id,
    @JsonKey(name: 'productId') required String productId,
    required String sku,
    Map<String, dynamic>? attributes,
    double? price,
    double? salePrice,
    int? stock,
    List<String>? images,
    String? status,
    DateTime? createdAt,
    DateTime? updatedAt,
  }) = _SKU;

  factory SKU.fromJson(Map<String, dynamic> json) => _$SKUFromJson(json);
}

@freezed
class Category with _$Category {
  const factory Category({
    @JsonKey(name: '_id') required String id,
    required String name,
    String? slug,
    String? description,
    String? image,
    String? parentId,
    int? order,
    String? status,
    DateTime? createdAt,
    DateTime? updatedAt,
  }) = _Category;

  factory Category.fromJson(Map<String, dynamic> json) => _$CategoryFromJson(json);
}

@freezed
class PaginatedResponse<T> with _$PaginatedResponse<T> {
  const factory PaginatedResponse({
    required List<T> data,
    required int total,
    required int page,
    required int limit,
    required int totalPages,
  }) = _PaginatedResponse<T>;

  factory PaginatedResponse.fromJson(
    Map<String, dynamic> json,
    T Function(Object?) fromJsonT,
  ) =>
      _$PaginatedResponseFromJson(json, fromJsonT);
}
