import 'package:freezed_annotation/freezed_annotation.dart';

part 'home_models.freezed.dart';
part 'home_models.g.dart';

@freezed
class Banner with _$Banner {
  const factory Banner({
    @JsonKey(name: '_id') required String id,
    required String title,
    String? description,
    String? image,
    String? link,
    String? linkType, // 'PRODUCT', 'CATEGORY', 'EXTERNAL'
    int? order,
    String? status,
    DateTime? createdAt,
    DateTime? updatedAt,
  }) = _Banner;

  factory Banner.fromJson(Map<String, dynamic> json) => _$BannerFromJson(json);
}

@freezed
class FlashDeal with _$FlashDeal {
  const factory FlashDeal({
    @JsonKey(name: '_id') required String id,
    required String name,
    String? description,
    required DateTime startDate,
    required DateTime endDate,
    List<String>? productIds,
    double? discountPercentage,
    String? status,
    DateTime? createdAt,
    DateTime? updatedAt,
  }) = _FlashDeal;

  factory FlashDeal.fromJson(Map<String, dynamic> json) => _$FlashDealFromJson(json);
}

@freezed
class HomeData with _$HomeData {
  const factory HomeData({
    required List<Banner> banners,
    required List<dynamic> categories, // Using dynamic to avoid circular dependency
    required List<dynamic> featuredProducts,
    List<FlashDeal>? flashDeals,
  }) = _HomeData;

  factory HomeData.fromJson(Map<String, dynamic> json) => _$HomeDataFromJson(json);
}
