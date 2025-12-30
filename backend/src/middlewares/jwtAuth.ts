import { Request, Response, NextFunction } from 'express';
import jwt, { JwtPayload } from 'jsonwebtoken';
import { ENV_VARIABLE } from '../configs';
import {
  HTTP_STATUS_CODE,
  AUTH_ERROR_MESSAGES,
  TOKEN_TYPE,
  USER_ERROR_MESSAGES,
  OTP_ERROR_MESSAGES,
} from '../constants';
import { ApiError } from '../helpers';
import { UserService, AuthTokenService } from '../services';

const userService = new UserService();
const authTokenService = new AuthTokenService();

export const jwtAuth =
  (tokenType: TOKEN_TYPE = TOKEN_TYPE.ACCESS_TOKEN) =>
  async (req: Request, _res: Response, next: NextFunction) => {
    try {
      const { query, params, body } = req;
      const bodyData = { ...query, ...params, ...body };
      const authorization = req.headers.authorization || (req.headers.Authorization as string);

      if (!bodyData.token && !bodyData.otp && tokenType === TOKEN_TYPE.OTP_TOKEN) {
        throw new ApiError(
          HTTP_STATUS_CODE.UNAUTHORIZED.CODE,
          HTTP_STATUS_CODE.UNAUTHORIZED.STATUS,
          AUTH_ERROR_MESSAGES.INVALID_VERIFICATION_OTP
        );
      }

      const token = authorization?.startsWith('Bearer ')
        ? authorization.split(' ')[1]
        : (bodyData.token as string | undefined);

      if (!token) {
        throw new ApiError(
          HTTP_STATUS_CODE.UNAUTHORIZED.CODE,
          HTTP_STATUS_CODE.UNAUTHORIZED.STATUS,
          AUTH_ERROR_MESSAGES.TOKEN_NOT_FOUND
        );
      }

      let decoded: JwtPayload | string;
      try {
        decoded = jwt.verify(token, ENV_VARIABLE.JWT_SECRET);
      } catch (err) {
        throw new ApiError(
          HTTP_STATUS_CODE.TOKEN_EXPIRED.CODE,
          HTTP_STATUS_CODE.TOKEN_EXPIRED.STATUS,
          AUTH_ERROR_MESSAGES.EXPIRED_TOKEN
        );
      }

      if (typeof decoded === 'string' || !decoded.sub) {
        throw new Error('Invalid JWT payload');
      }

      if (!decoded.otpType && decoded.type === TOKEN_TYPE.OTP_TOKEN) {
        throw new ApiError(
          HTTP_STATUS_CODE.INVALID_TOKEN.CODE,
          HTTP_STATUS_CODE.INVALID_TOKEN.STATUS,
          OTP_ERROR_MESSAGES.INVALID_OTP
        );
      }

      const tokenDoc = await authTokenService.findOne({
        token,
        type: tokenType,
        userId: decoded.sub,
      });

      if (!tokenDoc) {
        throw new ApiError(
          HTTP_STATUS_CODE.INVALID_TOKEN.CODE,
          HTTP_STATUS_CODE.INVALID_TOKEN.STATUS,
          AUTH_ERROR_MESSAGES.INVALID_TOKEN
        );
      }

      const user = await userService.findOne({ id: decoded.sub });
      if (!user) {
        throw new ApiError(
          HTTP_STATUS_CODE.UNAUTHORIZED.CODE,
          HTTP_STATUS_CODE.UNAUTHORIZED.STATUS,
          USER_ERROR_MESSAGES.NOT_FOUND
        );
      }

      if (!user.isVerified && tokenType !== TOKEN_TYPE.OTP_TOKEN) {
        throw new ApiError(
          HTTP_STATUS_CODE.UNAUTHORIZED.CODE,
          HTTP_STATUS_CODE.UNAUTHORIZED.STATUS,
          AUTH_ERROR_MESSAGES.PENDING_ACCOUNT_VERIFICATION
        );
      }

      delete user.password;
      req.user = user;
      req.token = { ...decoded };
      return next();
    } catch (error) {
      next(error);
    }
  };
