// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'auth_models.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

_$LoginRequestImpl _$$LoginRequestImplFromJson(Map<String, dynamic> json) =>
    _$LoginRequestImpl(
      email: json['email'] as String,
      password: json['password'] as String,
      type: json['type'] as String? ?? 'CUSTOMER',
    );

Map<String, dynamic> _$$LoginRequestImplToJson(_$LoginRequestImpl instance) =>
    <String, dynamic>{
      'email': instance.email,
      'password': instance.password,
      'type': instance.type,
    };

_$RegisterRequestImpl _$$RegisterRequestImplFromJson(
        Map<String, dynamic> json) =>
    _$RegisterRequestImpl(
      firstName: json['firstName'] as String,
      lastName: json['lastName'] as String,
      email: json['email'] as String,
      password: json['password'] as String,
      mobile: json['mobile'] as String?,
      countryCode: json['countryCode'] as String?,
      usedReferralCode: json['usedReferralCode'] as String?,
      type: json['type'] as String? ?? 'CUSTOMER',
    );

Map<String, dynamic> _$$RegisterRequestImplToJson(
        _$RegisterRequestImpl instance) =>
    <String, dynamic>{
      'firstName': instance.firstName,
      'lastName': instance.lastName,
      'email': instance.email,
      'password': instance.password,
      'mobile': instance.mobile,
      'countryCode': instance.countryCode,
      'usedReferralCode': instance.usedReferralCode,
      'type': instance.type,
    };

_$SendOtpRequestImpl _$$SendOtpRequestImplFromJson(Map<String, dynamic> json) =>
    _$SendOtpRequestImpl(
      email: json['email'] as String,
      type: json['type'] as String? ?? 'CUSTOMER',
      otpType: json['otpType'] as String,
    );

Map<String, dynamic> _$$SendOtpRequestImplToJson(
        _$SendOtpRequestImpl instance) =>
    <String, dynamic>{
      'email': instance.email,
      'type': instance.type,
      'otpType': instance.otpType,
    };

_$VerifyOtpRequestImpl _$$VerifyOtpRequestImplFromJson(
        Map<String, dynamic> json) =>
    _$VerifyOtpRequestImpl(
      otp: json['otp'] as String,
    );

Map<String, dynamic> _$$VerifyOtpRequestImplToJson(
        _$VerifyOtpRequestImpl instance) =>
    <String, dynamic>{
      'otp': instance.otp,
    };

_$AuthTokenImpl _$$AuthTokenImplFromJson(Map<String, dynamic> json) =>
    _$AuthTokenImpl(
      token: json['token'] as String,
      type: json['type'] as String,
      userId: json['userId'] as String,
      expiredAt: (json['expiredAt'] as num).toInt(),
      createdAt: json['createdAt'] as String,
      updatedAt: json['updatedAt'] as String,
      id: json['_id'] as String,
    );

Map<String, dynamic> _$$AuthTokenImplToJson(_$AuthTokenImpl instance) =>
    <String, dynamic>{
      'token': instance.token,
      'type': instance.type,
      'userId': instance.userId,
      'expiredAt': instance.expiredAt,
      'createdAt': instance.createdAt,
      'updatedAt': instance.updatedAt,
      '_id': instance.id,
    };

_$AuthResponseImpl _$$AuthResponseImplFromJson(Map<String, dynamic> json) =>
    _$AuthResponseImpl(
      tokens: (json['tokens'] as List<dynamic>)
          .map((e) => AuthToken.fromJson(e as Map<String, dynamic>))
          .toList(),
      email: json['email'] as String?,
      firstName: json['firstName'] as String?,
      lastName: json['lastName'] as String?,
      mobile: json['mobile'] as String?,
      type: json['type'] as String?,
      status: json['status'] as String?,
      id: json['_id'] as String?,
    );

Map<String, dynamic> _$$AuthResponseImplToJson(_$AuthResponseImpl instance) =>
    <String, dynamic>{
      'tokens': instance.tokens,
      'email': instance.email,
      'firstName': instance.firstName,
      'lastName': instance.lastName,
      'mobile': instance.mobile,
      'type': instance.type,
      'status': instance.status,
      '_id': instance.id,
    };
