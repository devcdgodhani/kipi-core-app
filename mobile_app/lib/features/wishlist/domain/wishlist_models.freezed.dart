// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint
// ignore_for_file: unused_element, deprecated_member_use, deprecated_member_use_from_same_package, use_function_type_syntax_for_parameters, unnecessary_const, avoid_init_to_null, invalid_override_different_default_values_named, prefer_expression_function_bodies, annotate_overrides, invalid_annotation_target, unnecessary_question_mark

part of 'wishlist_models.dart';

// **************************************************************************
// FreezedGenerator
// **************************************************************************

T _$identity<T>(T value) => value;

final _privateConstructorUsedError = UnsupportedError(
    'It seems like you constructed your class using `MyClass._()`. This constructor is only meant to be used by freezed and you are not supposed to need it nor use it.\nPlease check the documentation here for more information: https://github.com/rrousselGit/freezed#adding-getters-and-methods-to-our-models');

WishlistItem _$WishlistItemFromJson(Map<String, dynamic> json) {
  return _WishlistItem.fromJson(json);
}

/// @nodoc
mixin _$WishlistItem {
  @JsonKey(name: '_id')
  String get id => throw _privateConstructorUsedError;
  @JsonKey(name: 'userId')
  String get userId => throw _privateConstructorUsedError;
  @JsonKey(name: 'productId')
  String get productId => throw _privateConstructorUsedError;
  @JsonKey(name: 'skuId')
  String? get skuId => throw _privateConstructorUsedError;
  DateTime? get createdAt => throw _privateConstructorUsedError;
  DateTime? get updatedAt => throw _privateConstructorUsedError;

  /// Serializes this WishlistItem to a JSON map.
  Map<String, dynamic> toJson() => throw _privateConstructorUsedError;

  /// Create a copy of WishlistItem
  /// with the given fields replaced by the non-null parameter values.
  @JsonKey(includeFromJson: false, includeToJson: false)
  $WishlistItemCopyWith<WishlistItem> get copyWith =>
      throw _privateConstructorUsedError;
}

/// @nodoc
abstract class $WishlistItemCopyWith<$Res> {
  factory $WishlistItemCopyWith(
          WishlistItem value, $Res Function(WishlistItem) then) =
      _$WishlistItemCopyWithImpl<$Res, WishlistItem>;
  @useResult
  $Res call(
      {@JsonKey(name: '_id') String id,
      @JsonKey(name: 'userId') String userId,
      @JsonKey(name: 'productId') String productId,
      @JsonKey(name: 'skuId') String? skuId,
      DateTime? createdAt,
      DateTime? updatedAt});
}

/// @nodoc
class _$WishlistItemCopyWithImpl<$Res, $Val extends WishlistItem>
    implements $WishlistItemCopyWith<$Res> {
  _$WishlistItemCopyWithImpl(this._value, this._then);

  // ignore: unused_field
  final $Val _value;
  // ignore: unused_field
  final $Res Function($Val) _then;

  /// Create a copy of WishlistItem
  /// with the given fields replaced by the non-null parameter values.
  @pragma('vm:prefer-inline')
  @override
  $Res call({
    Object? id = null,
    Object? userId = null,
    Object? productId = null,
    Object? skuId = freezed,
    Object? createdAt = freezed,
    Object? updatedAt = freezed,
  }) {
    return _then(_value.copyWith(
      id: null == id
          ? _value.id
          : id // ignore: cast_nullable_to_non_nullable
              as String,
      userId: null == userId
          ? _value.userId
          : userId // ignore: cast_nullable_to_non_nullable
              as String,
      productId: null == productId
          ? _value.productId
          : productId // ignore: cast_nullable_to_non_nullable
              as String,
      skuId: freezed == skuId
          ? _value.skuId
          : skuId // ignore: cast_nullable_to_non_nullable
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
abstract class _$$WishlistItemImplCopyWith<$Res>
    implements $WishlistItemCopyWith<$Res> {
  factory _$$WishlistItemImplCopyWith(
          _$WishlistItemImpl value, $Res Function(_$WishlistItemImpl) then) =
      __$$WishlistItemImplCopyWithImpl<$Res>;
  @override
  @useResult
  $Res call(
      {@JsonKey(name: '_id') String id,
      @JsonKey(name: 'userId') String userId,
      @JsonKey(name: 'productId') String productId,
      @JsonKey(name: 'skuId') String? skuId,
      DateTime? createdAt,
      DateTime? updatedAt});
}

/// @nodoc
class __$$WishlistItemImplCopyWithImpl<$Res>
    extends _$WishlistItemCopyWithImpl<$Res, _$WishlistItemImpl>
    implements _$$WishlistItemImplCopyWith<$Res> {
  __$$WishlistItemImplCopyWithImpl(
      _$WishlistItemImpl _value, $Res Function(_$WishlistItemImpl) _then)
      : super(_value, _then);

  /// Create a copy of WishlistItem
  /// with the given fields replaced by the non-null parameter values.
  @pragma('vm:prefer-inline')
  @override
  $Res call({
    Object? id = null,
    Object? userId = null,
    Object? productId = null,
    Object? skuId = freezed,
    Object? createdAt = freezed,
    Object? updatedAt = freezed,
  }) {
    return _then(_$WishlistItemImpl(
      id: null == id
          ? _value.id
          : id // ignore: cast_nullable_to_non_nullable
              as String,
      userId: null == userId
          ? _value.userId
          : userId // ignore: cast_nullable_to_non_nullable
              as String,
      productId: null == productId
          ? _value.productId
          : productId // ignore: cast_nullable_to_non_nullable
              as String,
      skuId: freezed == skuId
          ? _value.skuId
          : skuId // ignore: cast_nullable_to_non_nullable
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
class _$WishlistItemImpl implements _WishlistItem {
  const _$WishlistItemImpl(
      {@JsonKey(name: '_id') required this.id,
      @JsonKey(name: 'userId') required this.userId,
      @JsonKey(name: 'productId') required this.productId,
      @JsonKey(name: 'skuId') this.skuId,
      this.createdAt,
      this.updatedAt});

  factory _$WishlistItemImpl.fromJson(Map<String, dynamic> json) =>
      _$$WishlistItemImplFromJson(json);

  @override
  @JsonKey(name: '_id')
  final String id;
  @override
  @JsonKey(name: 'userId')
  final String userId;
  @override
  @JsonKey(name: 'productId')
  final String productId;
  @override
  @JsonKey(name: 'skuId')
  final String? skuId;
  @override
  final DateTime? createdAt;
  @override
  final DateTime? updatedAt;

  @override
  String toString() {
    return 'WishlistItem(id: $id, userId: $userId, productId: $productId, skuId: $skuId, createdAt: $createdAt, updatedAt: $updatedAt)';
  }

  @override
  bool operator ==(Object other) {
    return identical(this, other) ||
        (other.runtimeType == runtimeType &&
            other is _$WishlistItemImpl &&
            (identical(other.id, id) || other.id == id) &&
            (identical(other.userId, userId) || other.userId == userId) &&
            (identical(other.productId, productId) ||
                other.productId == productId) &&
            (identical(other.skuId, skuId) || other.skuId == skuId) &&
            (identical(other.createdAt, createdAt) ||
                other.createdAt == createdAt) &&
            (identical(other.updatedAt, updatedAt) ||
                other.updatedAt == updatedAt));
  }

  @JsonKey(includeFromJson: false, includeToJson: false)
  @override
  int get hashCode => Object.hash(
      runtimeType, id, userId, productId, skuId, createdAt, updatedAt);

  /// Create a copy of WishlistItem
  /// with the given fields replaced by the non-null parameter values.
  @JsonKey(includeFromJson: false, includeToJson: false)
  @override
  @pragma('vm:prefer-inline')
  _$$WishlistItemImplCopyWith<_$WishlistItemImpl> get copyWith =>
      __$$WishlistItemImplCopyWithImpl<_$WishlistItemImpl>(this, _$identity);

  @override
  Map<String, dynamic> toJson() {
    return _$$WishlistItemImplToJson(
      this,
    );
  }
}

abstract class _WishlistItem implements WishlistItem {
  const factory _WishlistItem(
      {@JsonKey(name: '_id') required final String id,
      @JsonKey(name: 'userId') required final String userId,
      @JsonKey(name: 'productId') required final String productId,
      @JsonKey(name: 'skuId') final String? skuId,
      final DateTime? createdAt,
      final DateTime? updatedAt}) = _$WishlistItemImpl;

  factory _WishlistItem.fromJson(Map<String, dynamic> json) =
      _$WishlistItemImpl.fromJson;

  @override
  @JsonKey(name: '_id')
  String get id;
  @override
  @JsonKey(name: 'userId')
  String get userId;
  @override
  @JsonKey(name: 'productId')
  String get productId;
  @override
  @JsonKey(name: 'skuId')
  String? get skuId;
  @override
  DateTime? get createdAt;
  @override
  DateTime? get updatedAt;

  /// Create a copy of WishlistItem
  /// with the given fields replaced by the non-null parameter values.
  @override
  @JsonKey(includeFromJson: false, includeToJson: false)
  _$$WishlistItemImplCopyWith<_$WishlistItemImpl> get copyWith =>
      throw _privateConstructorUsedError;
}

AddToWishlistRequest _$AddToWishlistRequestFromJson(Map<String, dynamic> json) {
  return _AddToWishlistRequest.fromJson(json);
}

/// @nodoc
mixin _$AddToWishlistRequest {
  @JsonKey(name: 'productId')
  String get productId => throw _privateConstructorUsedError;
  @JsonKey(name: 'skuId')
  String? get skuId => throw _privateConstructorUsedError;

  /// Serializes this AddToWishlistRequest to a JSON map.
  Map<String, dynamic> toJson() => throw _privateConstructorUsedError;

  /// Create a copy of AddToWishlistRequest
  /// with the given fields replaced by the non-null parameter values.
  @JsonKey(includeFromJson: false, includeToJson: false)
  $AddToWishlistRequestCopyWith<AddToWishlistRequest> get copyWith =>
      throw _privateConstructorUsedError;
}

/// @nodoc
abstract class $AddToWishlistRequestCopyWith<$Res> {
  factory $AddToWishlistRequestCopyWith(AddToWishlistRequest value,
          $Res Function(AddToWishlistRequest) then) =
      _$AddToWishlistRequestCopyWithImpl<$Res, AddToWishlistRequest>;
  @useResult
  $Res call(
      {@JsonKey(name: 'productId') String productId,
      @JsonKey(name: 'skuId') String? skuId});
}

/// @nodoc
class _$AddToWishlistRequestCopyWithImpl<$Res,
        $Val extends AddToWishlistRequest>
    implements $AddToWishlistRequestCopyWith<$Res> {
  _$AddToWishlistRequestCopyWithImpl(this._value, this._then);

  // ignore: unused_field
  final $Val _value;
  // ignore: unused_field
  final $Res Function($Val) _then;

  /// Create a copy of AddToWishlistRequest
  /// with the given fields replaced by the non-null parameter values.
  @pragma('vm:prefer-inline')
  @override
  $Res call({
    Object? productId = null,
    Object? skuId = freezed,
  }) {
    return _then(_value.copyWith(
      productId: null == productId
          ? _value.productId
          : productId // ignore: cast_nullable_to_non_nullable
              as String,
      skuId: freezed == skuId
          ? _value.skuId
          : skuId // ignore: cast_nullable_to_non_nullable
              as String?,
    ) as $Val);
  }
}

/// @nodoc
abstract class _$$AddToWishlistRequestImplCopyWith<$Res>
    implements $AddToWishlistRequestCopyWith<$Res> {
  factory _$$AddToWishlistRequestImplCopyWith(_$AddToWishlistRequestImpl value,
          $Res Function(_$AddToWishlistRequestImpl) then) =
      __$$AddToWishlistRequestImplCopyWithImpl<$Res>;
  @override
  @useResult
  $Res call(
      {@JsonKey(name: 'productId') String productId,
      @JsonKey(name: 'skuId') String? skuId});
}

/// @nodoc
class __$$AddToWishlistRequestImplCopyWithImpl<$Res>
    extends _$AddToWishlistRequestCopyWithImpl<$Res, _$AddToWishlistRequestImpl>
    implements _$$AddToWishlistRequestImplCopyWith<$Res> {
  __$$AddToWishlistRequestImplCopyWithImpl(_$AddToWishlistRequestImpl _value,
      $Res Function(_$AddToWishlistRequestImpl) _then)
      : super(_value, _then);

  /// Create a copy of AddToWishlistRequest
  /// with the given fields replaced by the non-null parameter values.
  @pragma('vm:prefer-inline')
  @override
  $Res call({
    Object? productId = null,
    Object? skuId = freezed,
  }) {
    return _then(_$AddToWishlistRequestImpl(
      productId: null == productId
          ? _value.productId
          : productId // ignore: cast_nullable_to_non_nullable
              as String,
      skuId: freezed == skuId
          ? _value.skuId
          : skuId // ignore: cast_nullable_to_non_nullable
              as String?,
    ));
  }
}

/// @nodoc
@JsonSerializable()
class _$AddToWishlistRequestImpl implements _AddToWishlistRequest {
  const _$AddToWishlistRequestImpl(
      {@JsonKey(name: 'productId') required this.productId,
      @JsonKey(name: 'skuId') this.skuId});

  factory _$AddToWishlistRequestImpl.fromJson(Map<String, dynamic> json) =>
      _$$AddToWishlistRequestImplFromJson(json);

  @override
  @JsonKey(name: 'productId')
  final String productId;
  @override
  @JsonKey(name: 'skuId')
  final String? skuId;

  @override
  String toString() {
    return 'AddToWishlistRequest(productId: $productId, skuId: $skuId)';
  }

  @override
  bool operator ==(Object other) {
    return identical(this, other) ||
        (other.runtimeType == runtimeType &&
            other is _$AddToWishlistRequestImpl &&
            (identical(other.productId, productId) ||
                other.productId == productId) &&
            (identical(other.skuId, skuId) || other.skuId == skuId));
  }

  @JsonKey(includeFromJson: false, includeToJson: false)
  @override
  int get hashCode => Object.hash(runtimeType, productId, skuId);

  /// Create a copy of AddToWishlistRequest
  /// with the given fields replaced by the non-null parameter values.
  @JsonKey(includeFromJson: false, includeToJson: false)
  @override
  @pragma('vm:prefer-inline')
  _$$AddToWishlistRequestImplCopyWith<_$AddToWishlistRequestImpl>
      get copyWith =>
          __$$AddToWishlistRequestImplCopyWithImpl<_$AddToWishlistRequestImpl>(
              this, _$identity);

  @override
  Map<String, dynamic> toJson() {
    return _$$AddToWishlistRequestImplToJson(
      this,
    );
  }
}

abstract class _AddToWishlistRequest implements AddToWishlistRequest {
  const factory _AddToWishlistRequest(
          {@JsonKey(name: 'productId') required final String productId,
          @JsonKey(name: 'skuId') final String? skuId}) =
      _$AddToWishlistRequestImpl;

  factory _AddToWishlistRequest.fromJson(Map<String, dynamic> json) =
      _$AddToWishlistRequestImpl.fromJson;

  @override
  @JsonKey(name: 'productId')
  String get productId;
  @override
  @JsonKey(name: 'skuId')
  String? get skuId;

  /// Create a copy of AddToWishlistRequest
  /// with the given fields replaced by the non-null parameter values.
  @override
  @JsonKey(includeFromJson: false, includeToJson: false)
  _$$AddToWishlistRequestImplCopyWith<_$AddToWishlistRequestImpl>
      get copyWith => throw _privateConstructorUsedError;
}
