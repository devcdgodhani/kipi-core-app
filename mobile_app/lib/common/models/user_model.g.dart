// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'user_model.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

_$UserImpl _$$UserImplFromJson(Map<String, dynamic> json) => _$UserImpl(
      id: json['_id'] as String,
      email: json['email'] as String,
      firstName: json['firstName'] as String?,
      lastName: json['lastName'] as String?,
      mobile: json['mobile'] as String?,
      countryCode: json['countryCode'] as String?,
      profilePicture: json['profilePicture'] as String?,
      type: json['type'] as String?,
      status: json['status'] as String?,
      referralCode: json['referralCode'] as String?,
      usedReferralCode: json['usedReferralCode'] as String?,
      isEmailVerified: json['isEmailVerified'] as bool?,
      isMobileVerified: json['isMobileVerified'] as bool?,
      createdAt: json['createdAt'] == null
          ? null
          : DateTime.parse(json['createdAt'] as String),
      updatedAt: json['updatedAt'] == null
          ? null
          : DateTime.parse(json['updatedAt'] as String),
    );

Map<String, dynamic> _$$UserImplToJson(_$UserImpl instance) =>
    <String, dynamic>{
      '_id': instance.id,
      'email': instance.email,
      'firstName': instance.firstName,
      'lastName': instance.lastName,
      'mobile': instance.mobile,
      'countryCode': instance.countryCode,
      'profilePicture': instance.profilePicture,
      'type': instance.type,
      'status': instance.status,
      'referralCode': instance.referralCode,
      'usedReferralCode': instance.usedReferralCode,
      'isEmailVerified': instance.isEmailVerified,
      'isMobileVerified': instance.isMobileVerified,
      'createdAt': instance.createdAt?.toIso8601String(),
      'updatedAt': instance.updatedAt?.toIso8601String(),
    };
