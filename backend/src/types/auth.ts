import { IAuthTokenAttributes } from '../interfaces/authToken';
import { IApiResponse } from '../interfaces/common';
import { IUserAttributes } from '../interfaces/user';

/************* sign in **************/
export type TAuthSignInReq = {
  username: string;
  password: string;
};
export type TAuthSignInRes = IApiResponse<{
  tokens: IAuthTokenAttributes[];
  user?: IUserAttributes;
}>;

/************* sign up **************/
export type TAuthSignUpReq = Partial<IUserAttributes>;
export type TAuthSignUpRes = IApiResponse<{ tokens: IAuthTokenAttributes[] }>;

/************* verify otp **************/
export type TAuthVerifyOtpReq = {
  code: string;
};
export type TAuthVerifyOtpRes = TAuthSignInRes;

/***************** refresh token *******************/
export type TAuthRefreshTokenReq = {
  refreshToken: string;
};
export type TAuthRefreshTokenRes = IApiResponse<{ tokens: IAuthTokenAttributes[] }>;

/***************** forget password *******************/
export type TAuthForgetPasswordReq = {
  email: string;
};
export type TAuthForgetPasswordRes = TAuthSignUpRes;

/***************** reset password *******************/
export type TAuthResetPasswordReq = {
  password: string;
  confirmPassword: string;
};
export type TAuthResetPasswordRes = IApiResponse;

/***************** change password *******************/
export type TAuthChangePasswordReq = {
  oldPassword: string;
  newPassword: string;
  confirmPassword: string;
};
export type TAuthChangePasswordRes = IApiResponse<{ tokens: IAuthTokenAttributes[] }>;
