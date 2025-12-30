import { NextFunction, Request, Response } from 'express';
import { ENV_VARIABLE } from '../configs';
import {
  HTTP_STATUS_CODE,
  AUTH_SUCCESS_MESSAGES,
  AUTH_ERROR_MESSAGES,
  TOKEN_TYPE,
  AUTH_TOKEN_EXPIRATION_IN_MINUTES,
  USER_ERROR_MESSAGES,
  USER_SUCCESS_MESSAGES,
  OTP_TYPE,
} from '../constants';
import { ApiError } from '../helpers';
import { UserService } from '../services/concrete/userService';
import { AuthTokenService } from '../services/concrete/authTokenService';
import { AuthService } from '../services/concrete/authService';
import { OtpService } from '../services/concrete/otpService';
import {
  TAuthRefreshTokenRes,
  TAuthSignInRes,
  TAuthSignUpRes,
  TAuthVerifyOtpRes,
} from '../types/auth';
import { TGenerateTokenParams } from '../types/common';
import jwt, { JwtPayload } from 'jsonwebtoken';
import { IApiResponse, IAuthTokenAttributes, IUserAttributes } from '../interfaces';
import { getTime } from 'date-fns';

export default class AuthController {
  private userService = new UserService();
  private authTokenService = new AuthTokenService();
  private authService = new AuthService();
  private otpService = new OtpService();

  constructor() {}

  register = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const reqData = req.body;
      const existUser = await this.authService.checkUserAccountExist(reqData);
      if (existUser) {
        throw new ApiError(
          HTTP_STATUS_CODE.CONFLICT.CODE,
          HTTP_STATUS_CODE.CONFLICT.STATUS,
          AUTH_ERROR_MESSAGES.ACCOUNT_EXIST
        );
      }
      reqData.password = await this.authService.generateHashPassword(reqData.password);
      const user = await this.userService.create(reqData);
      if (!user) {
        throw new ApiError(
          HTTP_STATUS_CODE.INTERNAL_SERVER_ERROR.CODE,
          HTTP_STATUS_CODE.INTERNAL_SERVER_ERROR.STATUS,
          AUTH_ERROR_MESSAGES.ACCOUNT_CREATE_FAILED
        );
      }
      const otpToken = await this.authService.sendOtpAndGetOtpToken(user, OTP_TYPE.ACCOUNT_CREATE);

      const response: TAuthSignUpRes = {
        status: HTTP_STATUS_CODE.CREATED.STATUS,
        code: HTTP_STATUS_CODE.CREATED.CODE,
        message: AUTH_SUCCESS_MESSAGES.CREATE_SUCCESS,
        data: {
          tokens: [otpToken],
        },
      };
      return res.status(response.status).json(response);
    } catch (err) {
      next(err);
    }
  };

  login = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const bodyData = req.body;

      const loggedInUser = await this.authService.userLogin(bodyData);

      const refreshToken = await this.authService.generateUserTokens({
        userId: loggedInUser._id,
        tokenType: TOKEN_TYPE.REFRESH_TOKEN,
        expiredAt: AUTH_TOKEN_EXPIRATION_IN_MINUTES.REFRESH_TOKEN,
      });

      const accessToken = await this.authService.generateUserTokens({
        userId: loggedInUser._id,
        tokenType: TOKEN_TYPE.ACCESS_TOKEN,
        expiredAt: AUTH_TOKEN_EXPIRATION_IN_MINUTES.ACCESS_TOKEN,
        referenceTokenId: refreshToken._id,
      });

      const response: TAuthSignInRes = {
        status: HTTP_STATUS_CODE.OK.STATUS,
        code: HTTP_STATUS_CODE.OK.CODE,
        message: AUTH_SUCCESS_MESSAGES.LOGGED_IN_SUCCESS,
        data: {
          ...loggedInUser,
          tokens: [accessToken, refreshToken],
        },
      };

      return res.status(response.status).json(response);
    } catch (err) {
      return next(err);
    }
  };

  refreshTokens = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const bodyData = req.body;
      const authorization = req.headers.authorization || (req.headers.Authorization as string);
      const accessToken: string | undefined = authorization
        ? authorization.split(' ')[1]
        : undefined;

      if (!accessToken) {
        throw new ApiError(
          HTTP_STATUS_CODE.UNAUTHORIZED.CODE,
          HTTP_STATUS_CODE.UNAUTHORIZED.STATUS,
          AUTH_ERROR_MESSAGES.TOKEN_NOT_FOUND
        );
      }

      let decoded: JwtPayload | string;
      try {
        decoded = jwt.verify(bodyData.refreshToken, ENV_VARIABLE.JWT_SECRET);
      } catch (err) {
        throw new ApiError(
          HTTP_STATUS_CODE.TOKEN_EXPIRED.CODE,
          HTTP_STATUS_CODE.TOKEN_EXPIRED.STATUS,
          AUTH_ERROR_MESSAGES.EXPIRED_TOKEN
        );
      }

      const existAccessToken = await this.authTokenService.findOne({
        token: accessToken,
        type: TOKEN_TYPE.ACCESS_TOKEN,
        userId: decoded.sub,
      });

      if (!existAccessToken || !existAccessToken.referenceTokenId) {
        throw new ApiError(
          HTTP_STATUS_CODE.UNAUTHORIZED.CODE,
          HTTP_STATUS_CODE.UNAUTHORIZED.STATUS,
          AUTH_ERROR_MESSAGES.TOKEN_NOT_FOUND
        );
      }

      const existRefreshToken = await this.authTokenService.findOne({
        token: bodyData.refreshToken,
        type: TOKEN_TYPE.REFRESH_TOKEN,
        userId: decoded.sub,
        id: existAccessToken.referenceTokenId,
      });

      if (!existRefreshToken) {
        throw new ApiError(
          HTTP_STATUS_CODE.UNAUTHORIZED.CODE,
          HTTP_STATUS_CODE.UNAUTHORIZED.STATUS,
          AUTH_ERROR_MESSAGES.TOKEN_NOT_FOUND
        );
      }

      const newAccessToken = await this.authService.generateUserTokens({
        userId: existRefreshToken.userId,
        tokenType: TOKEN_TYPE.ACCESS_TOKEN,
        expiredAt: AUTH_TOKEN_EXPIRATION_IN_MINUTES.ACCESS_TOKEN,
        referenceTokenId: existRefreshToken._id,
      });

      const response: TAuthRefreshTokenRes = {
        status: HTTP_STATUS_CODE.OK.STATUS,
        code: HTTP_STATUS_CODE.OK.CODE,
        message: AUTH_SUCCESS_MESSAGES.LOGGED_IN_SUCCESS,
        data: {
          tokens: [newAccessToken, existRefreshToken],
        },
      };
      return res.status(response.status).json(response);
    } catch (err) {
      return next(err);
    }
  };

  logout = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const authorization = req.headers.authorization || (req.headers.Authorization as string);
      const accessToken: string | undefined = authorization
        ? authorization.split(' ')[1]
        : undefined;

      const existAccessToken = await this.authTokenService.findOne({
        token: accessToken,
      });

      await this.authTokenService.delete({
        id: { $in: [existAccessToken?._id, existAccessToken?.referenceTokenId] },
      });

      const response: IApiResponse = {
        status: HTTP_STATUS_CODE.OK.STATUS,
        code: HTTP_STATUS_CODE.OK.CODE,
        message: AUTH_SUCCESS_MESSAGES.LOG_OUT_SUCCESS,
      };
      return res.status(response.status).json(response);
    } catch (err) {
      return next(err);
    }
  };

  changePassword = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const bodyData = req.body;

      const authorization = req.headers.authorization || (req.headers.Authorization as string);
      const accessToken: string | undefined = authorization
        ? authorization.split(' ')[1]
        : undefined;

      const existAccessToken = await this.authTokenService.findOne({
        token: accessToken,
      });

      await this.authTokenService.delete({
        id: { $nin: [existAccessToken?._id, existAccessToken?.referenceTokenId] },
        userId: req.user._id,
      });

      const user = await this.userService.findOne({
        id: req.user._id,
      });

      if (!user) {
        throw new ApiError(
          HTTP_STATUS_CODE.BAD_REQUEST.CODE,
          HTTP_STATUS_CODE.BAD_REQUEST.STATUS,
          USER_ERROR_MESSAGES.NOT_FOUND
        );
      }

      const isPasswordValid = await this.authService.verifyPassword(
        user.password || '',
        bodyData.password || ''
      );
      if (!isPasswordValid) {
        throw new ApiError(
          HTTP_STATUS_CODE.BAD_REQUEST.CODE,
          HTTP_STATUS_CODE.BAD_REQUEST.STATUS,
          AUTH_ERROR_MESSAGES.INVALID_PASSWORD
        );
      }
      const newPassword = await this.authService.generateHashPassword(bodyData.newPassword);
      await this.userService.updateOne(
        { _id: user._id },
        { password: newPassword },
        { userId: req.user._id }
      );

      const response: IApiResponse = {
        status: HTTP_STATUS_CODE.OK.STATUS,
        code: HTTP_STATUS_CODE.OK.CODE,
        message: USER_SUCCESS_MESSAGES.PASSWORD_UPDATED,
      };
      return res.status(response.status).json(response);
    } catch (err) {
      return next(err);
    }
  };

  sendOtp = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const reqData = req.body;

      const user = await this.userService.findOne({
        $or: [
          { email: reqData.username },
          { mobile: reqData.username },
          { username: reqData.username },
          { id: reqData.username },
        ],
        type: reqData.type,
      });
      if (!user) {
        throw new ApiError(
          HTTP_STATUS_CODE.BAD_REQUEST.CODE,
          HTTP_STATUS_CODE.BAD_REQUEST.STATUS,
          USER_ERROR_MESSAGES.NOT_FOUND
        );
      }
      const otpToken = await this.authService.sendOtpAndGetOtpToken(user, reqData.otpType);

      const response: TAuthSignUpRes = {
        status: HTTP_STATUS_CODE.OK.STATUS,
        code: HTTP_STATUS_CODE.OK.CODE,
        message: AUTH_SUCCESS_MESSAGES.OTP_SENT_SUCCESS,
        data: {
          tokens: [otpToken],
        },
      };
      return res.status(response.status).json(response);
    } catch (err) {
      return next(err);
    }
  };

  verifyOtp = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const reqData = req.body;

      const otp = await this.otpService.findOne({
        userId: req.user._id,
        code: reqData.otp,
        type: req.token.otpType,
        expiredAt: { $gt: getTime(new Date()) },
      });
      if (!otp || otp.usesCount === otp.maxUses) {
        throw new ApiError(
          HTTP_STATUS_CODE.UNAUTHORIZED.CODE,
          HTTP_STATUS_CODE.UNAUTHORIZED.STATUS,
          AUTH_ERROR_MESSAGES.INVALID_VERIFICATION_OTP
        );
      }

      const updateData: Partial<IUserAttributes> = {
        isVerified: true,
      };
      if (reqData.token) {
        updateData.isEmailVerified = true;
      } else {
        updateData.isMobileVerified = true;
      }
      await this.userService.updateOne({ id: req.user._id }, updateData, { userId: req.user._id });
      await this.otpService.updateOne(
        { id: otp._id },
        { usesCount: (otp.usesCount || 0) + 1 },
        { userId: req.user._id }
      );

      const response: TAuthVerifyOtpRes = {
        status: HTTP_STATUS_CODE.OK.STATUS,
        code: HTTP_STATUS_CODE.OK.CODE,
        message: AUTH_SUCCESS_MESSAGES.OTP_VERIFICATION_SUCCESS,
        data: {
          tokens: [],
        },
      };

      if (otp?.generateTokens?.length) {
        let refreshToken: IAuthTokenAttributes | null = null;
        if (otp.generateTokens.includes(TOKEN_TYPE.REFRESH_TOKEN)) {
          refreshToken = await this.authService.generateUserTokens({
            userId: req.user._id,
            tokenType: TOKEN_TYPE.REFRESH_TOKEN,
            expiredAt: AUTH_TOKEN_EXPIRATION_IN_MINUTES.REFRESH_TOKEN,
          });
        }
        const tokens = await Promise.all(
          otp.generateTokens
            .filter((tokenType: TOKEN_TYPE) => tokenType !== TOKEN_TYPE.REFRESH_TOKEN)
            .map((tokenType: TOKEN_TYPE) => {
              const newToken: TGenerateTokenParams = {
                userId: req.user._id,
                tokenType,
                expiredAt: AUTH_TOKEN_EXPIRATION_IN_MINUTES[tokenType],
              };
              if (tokenType === TOKEN_TYPE.ACCESS_TOKEN && refreshToken) {
                newToken.referenceTokenId = refreshToken._id;
              }
              return this.authService.generateUserTokens(newToken);
            })
        );
        if (refreshToken) tokens.push(refreshToken);
        response.data = {
          tokens,
          user: refreshToken ? req.user : undefined,
        };
      }

      return res.status(response.status).json(response);
    } catch (err) {
      return next(err);
    }
  };

  forgetPassword = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const reqData = req.body;

      const newPassword = await this.authService.generateHashPassword(reqData.newPassword);
      await this.userService.updateOne(
        { id: req.user._id },
        { password: newPassword },
        { userId: req.user._id }
      );

      const response: IApiResponse = {
        status: HTTP_STATUS_CODE.OK.STATUS,
        code: HTTP_STATUS_CODE.OK.CODE,
        message: USER_SUCCESS_MESSAGES.PASSWORD_UPDATED,
      };

      return res.status(response.status).json(response);
    } catch (err) {
      return next(err);
    }
  };

  getLoggedInUser = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const response: IApiResponse<IUserAttributes> = {
        status: HTTP_STATUS_CODE.OK.STATUS,
        code: HTTP_STATUS_CODE.OK.CODE,
        message: USER_SUCCESS_MESSAGES.PASSWORD_UPDATED,
        data: req.user,
      };

      return res.status(response.status).json(response);
    } catch (err) {
      return next(err);
    }
  };
}
