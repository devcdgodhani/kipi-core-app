import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { HTTP_STATUS_CODE, OTP_TYPE, USER_TYPE } from '../constants';
import { validate } from '../helpers/zodValidator';

export default class AuthValidator {
  /*********************** register ***********************/
  registerValidator = validate(
    z.object({
      body: z.object({
        email: z.string().email(),
        mobile: z.string(),
        password: z.string().min(6),
        firstName: z.string().max(50),
        lastName: z.string().max(50),
        countryCode: z.string(),
        type: z.enum(USER_TYPE).optional(),
        gender: z.string().optional(),
      }),
    })
  );

  /*********************** login ***********************/
  loginValidator = validate(
    z.object({
      body: z.object({
        username: z.string(),
        password: z.string(),
        type: z.enum(Object.values(USER_TYPE)),
      }),
    })
  );

  /*********************** refresh tokens ***********************/
  refreshTokensValidator = validate(
    z.object({
      body: z.object({
        refreshToken: z.string(),
      }),
    })
  );

  /*********************** change password ***********************/
  changePasswordValidator = validate(
    z.object({
      body: z.object({
        password: z.string(),
        newPassword: z.string().min(6),
      }),
    })
  );

  /*********************** send OTP ***********************/
  sendOtpValidator = validate(
    z.object({
      body: z.object({
        username: z.string(),
        type: z.enum(Object.values(USER_TYPE)),
        otpType: z.enum(Object.values(OTP_TYPE)),
      }),
    })    
  );

  /*********************** verify OTP ***********************/
  verifyOtpValidator = validate(
    z.object({
      body: z.object({
        otp: z.string().length(6).optional(),
        token: z.string().optional(),
        otpType: z.enum(Object.values(OTP_TYPE)).optional(),
      }),
    })
  );

  /*********************** forget password ***********************/
  forgetPasswordValidator = validate(
    z.object({
      body: z.object({
        newPassword: z.string().min(6),
      }),
    })
  );
}
