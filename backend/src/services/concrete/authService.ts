import { FilterQuery } from 'mongoose';
import jwt, { JwtPayload } from 'jsonwebtoken';
import * as bcrypt from 'bcrypt';
import ejs from 'ejs';
import { IAuthService } from '../contracts/authServiceInterface';
import { ENV_VARIABLE } from '../../configs';
import {
  TOKEN_TYPE,
  HTTP_STATUS_CODE,
  AUTH_ERROR_MESSAGES,
  OTP_TYPE,
  AUTH_TOKEN_EXPIRATION_IN_MINUTES,
  EJS_TEMPLATES,
  OPEN_API,
  EMAIL_SUBJECT_MESSAGE,
  APP_DETAILS,
  USER_DEFAULT_ATTRIBUTES,
} from '../../constants';
import { ApiError, generateOtp, sendEmail } from '../../helpers';
import { IAuthTokenAttributes, IUserAttributes } from '../../interfaces';
import { AuthTokenService } from './authTokenService';
import { OtpService } from './otpService';
import { UserService } from './userService';
import { TOtpCreate } from '../../types/otp';
import { addMinutes, getTime, getUnixTime } from 'date-fns';
import { TAuthTokenCreate } from '../../types/authToken';
import { TGenerateTokenParams } from '../../types/common';

export class AuthService implements IAuthService {
  private userService = new UserService();
  private authTokenService = new AuthTokenService();
  private otpService = new OtpService();
  constructor() {}

  checkUserAccountExist = async (
    user: Partial<IUserAttributes>
  ): Promise<IUserAttributes | null> => {
    const where: FilterQuery<IUserAttributes> = {};
    if (user.email) where.email = user.email.toLowerCase();
    if (user.type) where.type = user.type;
    if (user.mobile) where.mobile = user.mobile;
    return await this.userService.findOne(where);
  };

  generateUserTokens = async (tokenData: TGenerateTokenParams): Promise<IAuthTokenAttributes> => {
    const exp = getUnixTime(addMinutes(new Date(), tokenData.expiredAt));
    await this.authTokenService.delete({ userId: tokenData.userId, type: tokenData.tokenType });
    const payload: JwtPayload = {
      sub: tokenData.userId.toString(),
      iat: getUnixTime(new Date()),
      exp,
      type: tokenData.tokenType,
    };
    if (tokenData.otpType) payload.otpType = tokenData.otpType;

    const token = jwt.sign(payload, ENV_VARIABLE.JWT_SECRET);
    const tokenCreateData: TAuthTokenCreate = {
      userId: tokenData.userId,
      token,
      expiredAt: exp,
      type: tokenData.tokenType,
    };

    if (tokenData.referenceTokenId) tokenCreateData.referenceTokenId = tokenData.referenceTokenId;
    const authToken = await this.authTokenService.create(tokenCreateData);
    return authToken;
  };

  verifyPassword = async (password: string, hashPassword: string): Promise<boolean> => {
    return await bcrypt.compare(password, hashPassword);
  };

  generateHashPassword = async (password: string): Promise<string> => {
    return bcrypt.hashSync(password as string, 10);
  };

  userLogin = async (
    loginData: Pick<IUserAttributes, 'email' | 'password' | 'type'>
  ): Promise<Omit<IUserAttributes, 'password'>> => {
    const user = await this.userService.findOne({
      $or: [
        { email: loginData.email },
        { mobile: loginData.email },
      ],
      type: loginData.type,
    });

    if (!user) {
      throw new ApiError(
        HTTP_STATUS_CODE.BAD_REQUEST.CODE,
        HTTP_STATUS_CODE.BAD_REQUEST.STATUS,
        AUTH_ERROR_MESSAGES.INVALID_USERNAME
      );
    }

    const isPasswordValid = await this.verifyPassword(
      loginData.password || '',
      user.password || ''
    );
    if (!isPasswordValid) {
      throw new ApiError(
        HTTP_STATUS_CODE.UNAUTHORIZED.CODE,
        HTTP_STATUS_CODE.UNAUTHORIZED.STATUS,
        AUTH_ERROR_MESSAGES.INVALID_PASSWORD
      );
    }
    if (!user.isVerified) {
       throw new ApiError(
          HTTP_STATUS_CODE.PENDING_ACCOUNT_VERIFICATION.CODE,
          HTTP_STATUS_CODE.PENDING_ACCOUNT_VERIFICATION.STATUS,
          AUTH_ERROR_MESSAGES.PENDING_ACCOUNT_VERIFICATION
        );
    }
    const safeUser: any = {};
    USER_DEFAULT_ATTRIBUTES.forEach((attr) => {
        if ((user as any)[attr] !== undefined) {
             safeUser[attr] = (user as any)[attr];
        }
    });
    return safeUser;
  };

  sendOtpAndGetOtpToken = async (
    user: IUserAttributes,
    type: OTP_TYPE,
    maxUses: number = 1
  ): Promise<IAuthTokenAttributes> => {
    // Delete all previous OTPs of the same type for this user
    await this.otpService.delete({
      userId: user._id,
      type,
    });

    // Delete all previous OTP tokens of the same type for this user (if any)
    await this.authTokenService.delete({
      userId: user._id,
      type: TOKEN_TYPE.OTP_TOKEN,
    });

    const expiredAt = getTime(addMinutes(new Date(), AUTH_TOKEN_EXPIRATION_IN_MINUTES.OTP_TOKEN));

    const generateTokens: TOKEN_TYPE[] = [];

    switch (type) {
      case OTP_TYPE.ACCOUNT_CREATE:
        generateTokens.push(TOKEN_TYPE.ACCESS_TOKEN);
        generateTokens.push(TOKEN_TYPE.REFRESH_TOKEN);
        break;

      case OTP_TYPE.FORGET_PASSWORD:
        generateTokens.push(TOKEN_TYPE.FORGET_PASSWORD_TOKEN);
        break;
      default:
        break;
    }

    const newOtp = generateOtp();
    let otp: TOtpCreate = {
      userId: user._id,
      code: newOtp,
      type,
      generateTokens,
      maxUses,
      expiredAt,
    };
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    otp = await this.otpService.create(otp, { userId: user._id });

    const token = await this.generateUserTokens({
      userId: user._id,
      tokenType: TOKEN_TYPE.OTP_TOKEN,
      expiredAt: AUTH_TOKEN_EXPIRATION_IN_MINUTES.OTP_TOKEN,
      otpType: type,
    });

    if (user.email) {
      const html = await ejs.renderFile(EJS_TEMPLATES.ACCOUNT_VERIFICATION, {
        userName: user.firstName || 'User',
        otp: newOtp,
        appName: APP_DETAILS.APP_NAME,
        supportEmail: APP_DETAILS.SUPPORT_EMAIL,
        expiresIn: `${AUTH_TOKEN_EXPIRATION_IN_MINUTES.OTP_TOKEN} minutes`,
      });
      await sendEmail({
        to: user.email,
        subject: EMAIL_SUBJECT_MESSAGE.ACCOUNT_VERIFICATION,
        html,
      });
    }
    if (user.mobile) {
      //
    }
    return token;
  };
}
