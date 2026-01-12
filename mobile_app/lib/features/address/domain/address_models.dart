import 'package:freezed_annotation/freezed_annotation.dart';

part 'address_models.freezed.dart';
part 'address_models.g.dart';

@freezed
class Address with _$Address {
  const factory Address({
    @JsonKey(name: '_id') String? id,
    required String type, // 'HOME', 'WORK', etc.
    required String name,
    required String mobile,
    required String pincode,
    required String addressLine1,
    String? addressLine2,
    required String city,
    required String state,
    @Default(false) bool isDefault,
  }) = _Address;

  factory Address.fromJson(Map<String, dynamic> json) => _$AddressFromJson(json);
}
