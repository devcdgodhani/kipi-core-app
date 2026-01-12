import 'package:freezed_annotation/freezed_annotation.dart';

part 'user_model.freezed.dart';
part 'user_model.g.dart';

@freezed
class User with _$User {
  const factory User({
    @JsonKey(name: '_id') required String id,
    required String email,
    String? firstName,
    String? lastName,
    String? mobile,
    String? countryCode,
    String? profilePicture,
    String? type,
    String? status,
    String? referralCode,
    String? usedReferralCode,
    @JsonKey(name: 'isEmailVerified') bool? isEmailVerified,
    @JsonKey(name: 'isMobileVerified') bool? isMobileVerified,
    DateTime? createdAt,
    DateTime? updatedAt,
  }) = _User;

  factory User.fromJson(Map<String, dynamic> json) => _$UserFromJson(json);
}
