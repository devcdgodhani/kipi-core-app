// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint
// ignore_for_file: unused_element, deprecated_member_use, deprecated_member_use_from_same_package, use_function_type_syntax_for_parameters, unnecessary_const, avoid_init_to_null, invalid_override_different_default_values_named, prefer_expression_function_bodies, annotate_overrides, invalid_annotation_target, unnecessary_question_mark

part of 'home_models.dart';

// **************************************************************************
// FreezedGenerator
// **************************************************************************

T _$identity<T>(T value) => value;

final _privateConstructorUsedError = UnsupportedError(
    'It seems like you constructed your class using `MyClass._()`. This constructor is only meant to be used by freezed and you are not supposed to need it nor use it.\nPlease check the documentation here for more information: https://github.com/rrousselGit/freezed#adding-getters-and-methods-to-our-models');

Banner _$BannerFromJson(Map<String, dynamic> json) {
  return _Banner.fromJson(json);
}

/// @nodoc
mixin _$Banner {
  @JsonKey(name: '_id')
  String get id => throw _privateConstructorUsedError;
  String get title => throw _privateConstructorUsedError;
  String? get description => throw _privateConstructorUsedError;
  String? get image => throw _privateConstructorUsedError;
  String? get link => throw _privateConstructorUsedError;
  String? get linkType =>
      throw _privateConstructorUsedError; // 'PRODUCT', 'CATEGORY', 'EXTERNAL'
  int? get order => throw _privateConstructorUsedError;
  String? get status => throw _privateConstructorUsedError;
  DateTime? get createdAt => throw _privateConstructorUsedError;
  DateTime? get updatedAt => throw _privateConstructorUsedError;

  /// Serializes this Banner to a JSON map.
  Map<String, dynamic> toJson() => throw _privateConstructorUsedError;

  /// Create a copy of Banner
  /// with the given fields replaced by the non-null parameter values.
  @JsonKey(includeFromJson: false, includeToJson: false)
  $BannerCopyWith<Banner> get copyWith => throw _privateConstructorUsedError;
}

/// @nodoc
abstract class $BannerCopyWith<$Res> {
  factory $BannerCopyWith(Banner value, $Res Function(Banner) then) =
      _$BannerCopyWithImpl<$Res, Banner>;
  @useResult
  $Res call(
      {@JsonKey(name: '_id') String id,
      String title,
      String? description,
      String? image,
      String? link,
      String? linkType,
      int? order,
      String? status,
      DateTime? createdAt,
      DateTime? updatedAt});
}

/// @nodoc
class _$BannerCopyWithImpl<$Res, $Val extends Banner>
    implements $BannerCopyWith<$Res> {
  _$BannerCopyWithImpl(this._value, this._then);

  // ignore: unused_field
  final $Val _value;
  // ignore: unused_field
  final $Res Function($Val) _then;

  /// Create a copy of Banner
  /// with the given fields replaced by the non-null parameter values.
  @pragma('vm:prefer-inline')
  @override
  $Res call({
    Object? id = null,
    Object? title = null,
    Object? description = freezed,
    Object? image = freezed,
    Object? link = freezed,
    Object? linkType = freezed,
    Object? order = freezed,
    Object? status = freezed,
    Object? createdAt = freezed,
    Object? updatedAt = freezed,
  }) {
    return _then(_value.copyWith(
      id: null == id
          ? _value.id
          : id // ignore: cast_nullable_to_non_nullable
              as String,
      title: null == title
          ? _value.title
          : title // ignore: cast_nullable_to_non_nullable
              as String,
      description: freezed == description
          ? _value.description
          : description // ignore: cast_nullable_to_non_nullable
              as String?,
      image: freezed == image
          ? _value.image
          : image // ignore: cast_nullable_to_non_nullable
              as String?,
      link: freezed == link
          ? _value.link
          : link // ignore: cast_nullable_to_non_nullable
              as String?,
      linkType: freezed == linkType
          ? _value.linkType
          : linkType // ignore: cast_nullable_to_non_nullable
              as String?,
      order: freezed == order
          ? _value.order
          : order // ignore: cast_nullable_to_non_nullable
              as int?,
      status: freezed == status
          ? _value.status
          : status // ignore: cast_nullable_to_non_nullable
              as String?,
      createdAt: freezed == createdAt
          ? _value.createdAt
          : createdAt // ignore: cast_nullable_to_non_nullable
              as DateTime?,
      updatedAt: freezed == updatedAt
          ? _value.updatedAt
          : updatedAt // ignore: cast_nullable_to_non_nullable
              as DateTime?,
    ) as $Val);
  }
}

/// @nodoc
abstract class _$$BannerImplCopyWith<$Res> implements $BannerCopyWith<$Res> {
  factory _$$BannerImplCopyWith(
          _$BannerImpl value, $Res Function(_$BannerImpl) then) =
      __$$BannerImplCopyWithImpl<$Res>;
  @override
  @useResult
  $Res call(
      {@JsonKey(name: '_id') String id,
      String title,
      String? description,
      String? image,
      String? link,
      String? linkType,
      int? order,
      String? status,
      DateTime? createdAt,
      DateTime? updatedAt});
}

/// @nodoc
class __$$BannerImplCopyWithImpl<$Res>
    extends _$BannerCopyWithImpl<$Res, _$BannerImpl>
    implements _$$BannerImplCopyWith<$Res> {
  __$$BannerImplCopyWithImpl(
      _$BannerImpl _value, $Res Function(_$BannerImpl) _then)
      : super(_value, _then);

  /// Create a copy of Banner
  /// with the given fields replaced by the non-null parameter values.
  @pragma('vm:prefer-inline')
  @override
  $Res call({
    Object? id = null,
    Object? title = null,
    Object? description = freezed,
    Object? image = freezed,
    Object? link = freezed,
    Object? linkType = freezed,
    Object? order = freezed,
    Object? status = freezed,
    Object? createdAt = freezed,
    Object? updatedAt = freezed,
  }) {
    return _then(_$BannerImpl(
      id: null == id
          ? _value.id
          : id // ignore: cast_nullable_to_non_nullable
              as String,
      title: null == title
          ? _value.title
          : title // ignore: cast_nullable_to_non_nullable
              as String,
      description: freezed == description
          ? _value.description
          : description // ignore: cast_nullable_to_non_nullable
              as String?,
      image: freezed == image
          ? _value.image
          : image // ignore: cast_nullable_to_non_nullable
              as String?,
      link: freezed == link
          ? _value.link
          : link // ignore: cast_nullable_to_non_nullable
              as String?,
      linkType: freezed == linkType
          ? _value.linkType
          : linkType // ignore: cast_nullable_to_non_nullable
              as String?,
      order: freezed == order
          ? _value.order
          : order // ignore: cast_nullable_to_non_nullable
              as int?,
      status: freezed == status
          ? _value.status
          : status // ignore: cast_nullable_to_non_nullable
              as String?,
      createdAt: freezed == createdAt
          ? _value.createdAt
          : createdAt // ignore: cast_nullable_to_non_nullable
              as DateTime?,
      updatedAt: freezed == updatedAt
          ? _value.updatedAt
          : updatedAt // ignore: cast_nullable_to_non_nullable
              as DateTime?,
    ));
  }
}

/// @nodoc
@JsonSerializable()
class _$BannerImpl implements _Banner {
  const _$BannerImpl(
      {@JsonKey(name: '_id') required this.id,
      required this.title,
      this.description,
      this.image,
      this.link,
      this.linkType,
      this.order,
      this.status,
      this.createdAt,
      this.updatedAt});

  factory _$BannerImpl.fromJson(Map<String, dynamic> json) =>
      _$$BannerImplFromJson(json);

  @override
  @JsonKey(name: '_id')
  final String id;
  @override
  final String title;
  @override
  final String? description;
  @override
  final String? image;
  @override
  final String? link;
  @override
  final String? linkType;
// 'PRODUCT', 'CATEGORY', 'EXTERNAL'
  @override
  final int? order;
  @override
  final String? status;
  @override
  final DateTime? createdAt;
  @override
  final DateTime? updatedAt;

  @override
  String toString() {
    return 'Banner(id: $id, title: $title, description: $description, image: $image, link: $link, linkType: $linkType, order: $order, status: $status, createdAt: $createdAt, updatedAt: $updatedAt)';
  }

  @override
  bool operator ==(Object other) {
    return identical(this, other) ||
        (other.runtimeType == runtimeType &&
            other is _$BannerImpl &&
            (identical(other.id, id) || other.id == id) &&
            (identical(other.title, title) || other.title == title) &&
            (identical(other.description, description) ||
                other.description == description) &&
            (identical(other.image, image) || other.image == image) &&
            (identical(other.link, link) || other.link == link) &&
            (identical(other.linkType, linkType) ||
                other.linkType == linkType) &&
            (identical(other.order, order) || other.order == order) &&
            (identical(other.status, status) || other.status == status) &&
            (identical(other.createdAt, createdAt) ||
                other.createdAt == createdAt) &&
            (identical(other.updatedAt, updatedAt) ||
                other.updatedAt == updatedAt));
  }

  @JsonKey(includeFromJson: false, includeToJson: false)
  @override
  int get hashCode => Object.hash(runtimeType, id, title, description, image,
      link, linkType, order, status, createdAt, updatedAt);

  /// Create a copy of Banner
  /// with the given fields replaced by the non-null parameter values.
  @JsonKey(includeFromJson: false, includeToJson: false)
  @override
  @pragma('vm:prefer-inline')
  _$$BannerImplCopyWith<_$BannerImpl> get copyWith =>
      __$$BannerImplCopyWithImpl<_$BannerImpl>(this, _$identity);

  @override
  Map<String, dynamic> toJson() {
    return _$$BannerImplToJson(
      this,
    );
  }
}

abstract class _Banner implements Banner {
  const factory _Banner(
      {@JsonKey(name: '_id') required final String id,
      required final String title,
      final String? description,
      final String? image,
      final String? link,
      final String? linkType,
      final int? order,
      final String? status,
      final DateTime? createdAt,
      final DateTime? updatedAt}) = _$BannerImpl;

  factory _Banner.fromJson(Map<String, dynamic> json) = _$BannerImpl.fromJson;

  @override
  @JsonKey(name: '_id')
  String get id;
  @override
  String get title;
  @override
  String? get description;
  @override
  String? get image;
  @override
  String? get link;
  @override
  String? get linkType; // 'PRODUCT', 'CATEGORY', 'EXTERNAL'
  @override
  int? get order;
  @override
  String? get status;
  @override
  DateTime? get createdAt;
  @override
  DateTime? get updatedAt;

  /// Create a copy of Banner
  /// with the given fields replaced by the non-null parameter values.
  @override
  @JsonKey(includeFromJson: false, includeToJson: false)
  _$$BannerImplCopyWith<_$BannerImpl> get copyWith =>
      throw _privateConstructorUsedError;
}

FlashDeal _$FlashDealFromJson(Map<String, dynamic> json) {
  return _FlashDeal.fromJson(json);
}

/// @nodoc
mixin _$FlashDeal {
  @JsonKey(name: '_id')
  String get id => throw _privateConstructorUsedError;
  String get name => throw _privateConstructorUsedError;
  String? get description => throw _privateConstructorUsedError;
  DateTime get startDate => throw _privateConstructorUsedError;
  DateTime get endDate => throw _privateConstructorUsedError;
  List<String>? get productIds => throw _privateConstructorUsedError;
  double? get discountPercentage => throw _privateConstructorUsedError;
  String? get status => throw _privateConstructorUsedError;
  DateTime? get createdAt => throw _privateConstructorUsedError;
  DateTime? get updatedAt => throw _privateConstructorUsedError;

  /// Serializes this FlashDeal to a JSON map.
  Map<String, dynamic> toJson() => throw _privateConstructorUsedError;

  /// Create a copy of FlashDeal
  /// with the given fields replaced by the non-null parameter values.
  @JsonKey(includeFromJson: false, includeToJson: false)
  $FlashDealCopyWith<FlashDeal> get copyWith =>
      throw _privateConstructorUsedError;
}

/// @nodoc
abstract class $FlashDealCopyWith<$Res> {
  factory $FlashDealCopyWith(FlashDeal value, $Res Function(FlashDeal) then) =
      _$FlashDealCopyWithImpl<$Res, FlashDeal>;
  @useResult
  $Res call(
      {@JsonKey(name: '_id') String id,
      String name,
      String? description,
      DateTime startDate,
      DateTime endDate,
      List<String>? productIds,
      double? discountPercentage,
      String? status,
      DateTime? createdAt,
      DateTime? updatedAt});
}

/// @nodoc
class _$FlashDealCopyWithImpl<$Res, $Val extends FlashDeal>
    implements $FlashDealCopyWith<$Res> {
  _$FlashDealCopyWithImpl(this._value, this._then);

  // ignore: unused_field
  final $Val _value;
  // ignore: unused_field
  final $Res Function($Val) _then;

  /// Create a copy of FlashDeal
  /// with the given fields replaced by the non-null parameter values.
  @pragma('vm:prefer-inline')
  @override
  $Res call({
    Object? id = null,
    Object? name = null,
    Object? description = freezed,
    Object? startDate = null,
    Object? endDate = null,
    Object? productIds = freezed,
    Object? discountPercentage = freezed,
    Object? status = freezed,
    Object? createdAt = freezed,
    Object? updatedAt = freezed,
  }) {
    return _then(_value.copyWith(
      id: null == id
          ? _value.id
          : id // ignore: cast_nullable_to_non_nullable
              as String,
      name: null == name
          ? _value.name
          : name // ignore: cast_nullable_to_non_nullable
              as String,
      description: freezed == description
          ? _value.description
          : description // ignore: cast_nullable_to_non_nullable
              as String?,
      startDate: null == startDate
          ? _value.startDate
          : startDate // ignore: cast_nullable_to_non_nullable
              as DateTime,
      endDate: null == endDate
          ? _value.endDate
          : endDate // ignore: cast_nullable_to_non_nullable
              as DateTime,
      productIds: freezed == productIds
          ? _value.productIds
          : productIds // ignore: cast_nullable_to_non_nullable
              as List<String>?,
      discountPercentage: freezed == discountPercentage
          ? _value.discountPercentage
          : discountPercentage // ignore: cast_nullable_to_non_nullable
              as double?,
      status: freezed == status
          ? _value.status
          : status // ignore: cast_nullable_to_non_nullable
              as String?,
      createdAt: freezed == createdAt
          ? _value.createdAt
          : createdAt // ignore: cast_nullable_to_non_nullable
              as DateTime?,
      updatedAt: freezed == updatedAt
          ? _value.updatedAt
          : updatedAt // ignore: cast_nullable_to_non_nullable
              as DateTime?,
    ) as $Val);
  }
}

/// @nodoc
abstract class _$$FlashDealImplCopyWith<$Res>
    implements $FlashDealCopyWith<$Res> {
  factory _$$FlashDealImplCopyWith(
          _$FlashDealImpl value, $Res Function(_$FlashDealImpl) then) =
      __$$FlashDealImplCopyWithImpl<$Res>;
  @override
  @useResult
  $Res call(
      {@JsonKey(name: '_id') String id,
      String name,
      String? description,
      DateTime startDate,
      DateTime endDate,
      List<String>? productIds,
      double? discountPercentage,
      String? status,
      DateTime? createdAt,
      DateTime? updatedAt});
}

/// @nodoc
class __$$FlashDealImplCopyWithImpl<$Res>
    extends _$FlashDealCopyWithImpl<$Res, _$FlashDealImpl>
    implements _$$FlashDealImplCopyWith<$Res> {
  __$$FlashDealImplCopyWithImpl(
      _$FlashDealImpl _value, $Res Function(_$FlashDealImpl) _then)
      : super(_value, _then);

  /// Create a copy of FlashDeal
  /// with the given fields replaced by the non-null parameter values.
  @pragma('vm:prefer-inline')
  @override
  $Res call({
    Object? id = null,
    Object? name = null,
    Object? description = freezed,
    Object? startDate = null,
    Object? endDate = null,
    Object? productIds = freezed,
    Object? discountPercentage = freezed,
    Object? status = freezed,
    Object? createdAt = freezed,
    Object? updatedAt = freezed,
  }) {
    return _then(_$FlashDealImpl(
      id: null == id
          ? _value.id
          : id // ignore: cast_nullable_to_non_nullable
              as String,
      name: null == name
          ? _value.name
          : name // ignore: cast_nullable_to_non_nullable
              as String,
      description: freezed == description
          ? _value.description
          : description // ignore: cast_nullable_to_non_nullable
              as String?,
      startDate: null == startDate
          ? _value.startDate
          : startDate // ignore: cast_nullable_to_non_nullable
              as DateTime,
      endDate: null == endDate
          ? _value.endDate
          : endDate // ignore: cast_nullable_to_non_nullable
              as DateTime,
      productIds: freezed == productIds
          ? _value._productIds
          : productIds // ignore: cast_nullable_to_non_nullable
              as List<String>?,
      discountPercentage: freezed == discountPercentage
          ? _value.discountPercentage
          : discountPercentage // ignore: cast_nullable_to_non_nullable
              as double?,
      status: freezed == status
          ? _value.status
          : status // ignore: cast_nullable_to_non_nullable
              as String?,
      createdAt: freezed == createdAt
          ? _value.createdAt
          : createdAt // ignore: cast_nullable_to_non_nullable
              as DateTime?,
      updatedAt: freezed == updatedAt
          ? _value.updatedAt
          : updatedAt // ignore: cast_nullable_to_non_nullable
              as DateTime?,
    ));
  }
}

/// @nodoc
@JsonSerializable()
class _$FlashDealImpl implements _FlashDeal {
  const _$FlashDealImpl(
      {@JsonKey(name: '_id') required this.id,
      required this.name,
      this.description,
      required this.startDate,
      required this.endDate,
      final List<String>? productIds,
      this.discountPercentage,
      this.status,
      this.createdAt,
      this.updatedAt})
      : _productIds = productIds;

  factory _$FlashDealImpl.fromJson(Map<String, dynamic> json) =>
      _$$FlashDealImplFromJson(json);

  @override
  @JsonKey(name: '_id')
  final String id;
  @override
  final String name;
  @override
  final String? description;
  @override
  final DateTime startDate;
  @override
  final DateTime endDate;
  final List<String>? _productIds;
  @override
  List<String>? get productIds {
    final value = _productIds;
    if (value == null) return null;
    if (_productIds is EqualUnmodifiableListView) return _productIds;
    // ignore: implicit_dynamic_type
    return EqualUnmodifiableListView(value);
  }

  @override
  final double? discountPercentage;
  @override
  final String? status;
  @override
  final DateTime? createdAt;
  @override
  final DateTime? updatedAt;

  @override
  String toString() {
    return 'FlashDeal(id: $id, name: $name, description: $description, startDate: $startDate, endDate: $endDate, productIds: $productIds, discountPercentage: $discountPercentage, status: $status, createdAt: $createdAt, updatedAt: $updatedAt)';
  }

  @override
  bool operator ==(Object other) {
    return identical(this, other) ||
        (other.runtimeType == runtimeType &&
            other is _$FlashDealImpl &&
            (identical(other.id, id) || other.id == id) &&
            (identical(other.name, name) || other.name == name) &&
            (identical(other.description, description) ||
                other.description == description) &&
            (identical(other.startDate, startDate) ||
                other.startDate == startDate) &&
            (identical(other.endDate, endDate) || other.endDate == endDate) &&
            const DeepCollectionEquality()
                .equals(other._productIds, _productIds) &&
            (identical(other.discountPercentage, discountPercentage) ||
                other.discountPercentage == discountPercentage) &&
            (identical(other.status, status) || other.status == status) &&
            (identical(other.createdAt, createdAt) ||
                other.createdAt == createdAt) &&
            (identical(other.updatedAt, updatedAt) ||
                other.updatedAt == updatedAt));
  }

  @JsonKey(includeFromJson: false, includeToJson: false)
  @override
  int get hashCode => Object.hash(
      runtimeType,
      id,
      name,
      description,
      startDate,
      endDate,
      const DeepCollectionEquality().hash(_productIds),
      discountPercentage,
      status,
      createdAt,
      updatedAt);

  /// Create a copy of FlashDeal
  /// with the given fields replaced by the non-null parameter values.
  @JsonKey(includeFromJson: false, includeToJson: false)
  @override
  @pragma('vm:prefer-inline')
  _$$FlashDealImplCopyWith<_$FlashDealImpl> get copyWith =>
      __$$FlashDealImplCopyWithImpl<_$FlashDealImpl>(this, _$identity);

  @override
  Map<String, dynamic> toJson() {
    return _$$FlashDealImplToJson(
      this,
    );
  }
}

abstract class _FlashDeal implements FlashDeal {
  const factory _FlashDeal(
      {@JsonKey(name: '_id') required final String id,
      required final String name,
      final String? description,
      required final DateTime startDate,
      required final DateTime endDate,
      final List<String>? productIds,
      final double? discountPercentage,
      final String? status,
      final DateTime? createdAt,
      final DateTime? updatedAt}) = _$FlashDealImpl;

  factory _FlashDeal.fromJson(Map<String, dynamic> json) =
      _$FlashDealImpl.fromJson;

  @override
  @JsonKey(name: '_id')
  String get id;
  @override
  String get name;
  @override
  String? get description;
  @override
  DateTime get startDate;
  @override
  DateTime get endDate;
  @override
  List<String>? get productIds;
  @override
  double? get discountPercentage;
  @override
  String? get status;
  @override
  DateTime? get createdAt;
  @override
  DateTime? get updatedAt;

  /// Create a copy of FlashDeal
  /// with the given fields replaced by the non-null parameter values.
  @override
  @JsonKey(includeFromJson: false, includeToJson: false)
  _$$FlashDealImplCopyWith<_$FlashDealImpl> get copyWith =>
      throw _privateConstructorUsedError;
}

HomeData _$HomeDataFromJson(Map<String, dynamic> json) {
  return _HomeData.fromJson(json);
}

/// @nodoc
mixin _$HomeData {
  List<Banner> get banners => throw _privateConstructorUsedError;
  List<dynamic> get categories =>
      throw _privateConstructorUsedError; // Using dynamic to avoid circular dependency
  List<dynamic> get featuredProducts => throw _privateConstructorUsedError;
  List<FlashDeal>? get flashDeals => throw _privateConstructorUsedError;

  /// Serializes this HomeData to a JSON map.
  Map<String, dynamic> toJson() => throw _privateConstructorUsedError;

  /// Create a copy of HomeData
  /// with the given fields replaced by the non-null parameter values.
  @JsonKey(includeFromJson: false, includeToJson: false)
  $HomeDataCopyWith<HomeData> get copyWith =>
      throw _privateConstructorUsedError;
}

/// @nodoc
abstract class $HomeDataCopyWith<$Res> {
  factory $HomeDataCopyWith(HomeData value, $Res Function(HomeData) then) =
      _$HomeDataCopyWithImpl<$Res, HomeData>;
  @useResult
  $Res call(
      {List<Banner> banners,
      List<dynamic> categories,
      List<dynamic> featuredProducts,
      List<FlashDeal>? flashDeals});
}

/// @nodoc
class _$HomeDataCopyWithImpl<$Res, $Val extends HomeData>
    implements $HomeDataCopyWith<$Res> {
  _$HomeDataCopyWithImpl(this._value, this._then);

  // ignore: unused_field
  final $Val _value;
  // ignore: unused_field
  final $Res Function($Val) _then;

  /// Create a copy of HomeData
  /// with the given fields replaced by the non-null parameter values.
  @pragma('vm:prefer-inline')
  @override
  $Res call({
    Object? banners = null,
    Object? categories = null,
    Object? featuredProducts = null,
    Object? flashDeals = freezed,
  }) {
    return _then(_value.copyWith(
      banners: null == banners
          ? _value.banners
          : banners // ignore: cast_nullable_to_non_nullable
              as List<Banner>,
      categories: null == categories
          ? _value.categories
          : categories // ignore: cast_nullable_to_non_nullable
              as List<dynamic>,
      featuredProducts: null == featuredProducts
          ? _value.featuredProducts
          : featuredProducts // ignore: cast_nullable_to_non_nullable
              as List<dynamic>,
      flashDeals: freezed == flashDeals
          ? _value.flashDeals
          : flashDeals // ignore: cast_nullable_to_non_nullable
              as List<FlashDeal>?,
    ) as $Val);
  }
}

/// @nodoc
abstract class _$$HomeDataImplCopyWith<$Res>
    implements $HomeDataCopyWith<$Res> {
  factory _$$HomeDataImplCopyWith(
          _$HomeDataImpl value, $Res Function(_$HomeDataImpl) then) =
      __$$HomeDataImplCopyWithImpl<$Res>;
  @override
  @useResult
  $Res call(
      {List<Banner> banners,
      List<dynamic> categories,
      List<dynamic> featuredProducts,
      List<FlashDeal>? flashDeals});
}

/// @nodoc
class __$$HomeDataImplCopyWithImpl<$Res>
    extends _$HomeDataCopyWithImpl<$Res, _$HomeDataImpl>
    implements _$$HomeDataImplCopyWith<$Res> {
  __$$HomeDataImplCopyWithImpl(
      _$HomeDataImpl _value, $Res Function(_$HomeDataImpl) _then)
      : super(_value, _then);

  /// Create a copy of HomeData
  /// with the given fields replaced by the non-null parameter values.
  @pragma('vm:prefer-inline')
  @override
  $Res call({
    Object? banners = null,
    Object? categories = null,
    Object? featuredProducts = null,
    Object? flashDeals = freezed,
  }) {
    return _then(_$HomeDataImpl(
      banners: null == banners
          ? _value._banners
          : banners // ignore: cast_nullable_to_non_nullable
              as List<Banner>,
      categories: null == categories
          ? _value._categories
          : categories // ignore: cast_nullable_to_non_nullable
              as List<dynamic>,
      featuredProducts: null == featuredProducts
          ? _value._featuredProducts
          : featuredProducts // ignore: cast_nullable_to_non_nullable
              as List<dynamic>,
      flashDeals: freezed == flashDeals
          ? _value._flashDeals
          : flashDeals // ignore: cast_nullable_to_non_nullable
              as List<FlashDeal>?,
    ));
  }
}

/// @nodoc
@JsonSerializable()
class _$HomeDataImpl implements _HomeData {
  const _$HomeDataImpl(
      {required final List<Banner> banners,
      required final List<dynamic> categories,
      required final List<dynamic> featuredProducts,
      final List<FlashDeal>? flashDeals})
      : _banners = banners,
        _categories = categories,
        _featuredProducts = featuredProducts,
        _flashDeals = flashDeals;

  factory _$HomeDataImpl.fromJson(Map<String, dynamic> json) =>
      _$$HomeDataImplFromJson(json);

  final List<Banner> _banners;
  @override
  List<Banner> get banners {
    if (_banners is EqualUnmodifiableListView) return _banners;
    // ignore: implicit_dynamic_type
    return EqualUnmodifiableListView(_banners);
  }

  final List<dynamic> _categories;
  @override
  List<dynamic> get categories {
    if (_categories is EqualUnmodifiableListView) return _categories;
    // ignore: implicit_dynamic_type
    return EqualUnmodifiableListView(_categories);
  }

// Using dynamic to avoid circular dependency
  final List<dynamic> _featuredProducts;
// Using dynamic to avoid circular dependency
  @override
  List<dynamic> get featuredProducts {
    if (_featuredProducts is EqualUnmodifiableListView)
      return _featuredProducts;
    // ignore: implicit_dynamic_type
    return EqualUnmodifiableListView(_featuredProducts);
  }

  final List<FlashDeal>? _flashDeals;
  @override
  List<FlashDeal>? get flashDeals {
    final value = _flashDeals;
    if (value == null) return null;
    if (_flashDeals is EqualUnmodifiableListView) return _flashDeals;
    // ignore: implicit_dynamic_type
    return EqualUnmodifiableListView(value);
  }

  @override
  String toString() {
    return 'HomeData(banners: $banners, categories: $categories, featuredProducts: $featuredProducts, flashDeals: $flashDeals)';
  }

  @override
  bool operator ==(Object other) {
    return identical(this, other) ||
        (other.runtimeType == runtimeType &&
            other is _$HomeDataImpl &&
            const DeepCollectionEquality().equals(other._banners, _banners) &&
            const DeepCollectionEquality()
                .equals(other._categories, _categories) &&
            const DeepCollectionEquality()
                .equals(other._featuredProducts, _featuredProducts) &&
            const DeepCollectionEquality()
                .equals(other._flashDeals, _flashDeals));
  }

  @JsonKey(includeFromJson: false, includeToJson: false)
  @override
  int get hashCode => Object.hash(
      runtimeType,
      const DeepCollectionEquality().hash(_banners),
      const DeepCollectionEquality().hash(_categories),
      const DeepCollectionEquality().hash(_featuredProducts),
      const DeepCollectionEquality().hash(_flashDeals));

  /// Create a copy of HomeData
  /// with the given fields replaced by the non-null parameter values.
  @JsonKey(includeFromJson: false, includeToJson: false)
  @override
  @pragma('vm:prefer-inline')
  _$$HomeDataImplCopyWith<_$HomeDataImpl> get copyWith =>
      __$$HomeDataImplCopyWithImpl<_$HomeDataImpl>(this, _$identity);

  @override
  Map<String, dynamic> toJson() {
    return _$$HomeDataImplToJson(
      this,
    );
  }
}

abstract class _HomeData implements HomeData {
  const factory _HomeData(
      {required final List<Banner> banners,
      required final List<dynamic> categories,
      required final List<dynamic> featuredProducts,
      final List<FlashDeal>? flashDeals}) = _$HomeDataImpl;

  factory _HomeData.fromJson(Map<String, dynamic> json) =
      _$HomeDataImpl.fromJson;

  @override
  List<Banner> get banners;
  @override
  List<dynamic> get categories; // Using dynamic to avoid circular dependency
  @override
  List<dynamic> get featuredProducts;
  @override
  List<FlashDeal>? get flashDeals;

  /// Create a copy of HomeData
  /// with the given fields replaced by the non-null parameter values.
  @override
  @JsonKey(includeFromJson: false, includeToJson: false)
  _$$HomeDataImplCopyWith<_$HomeDataImpl> get copyWith =>
      throw _privateConstructorUsedError;
}
