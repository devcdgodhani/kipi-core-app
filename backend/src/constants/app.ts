import { ENV_VARIABLE } from '../configs';
import { TOKEN_TYPE } from './common';
import path from 'path';

export const AUTH_TOKEN_EXPIRATION_IN_MINUTES: Record<TOKEN_TYPE, number> = {
  [TOKEN_TYPE.ACCESS_TOKEN]: ENV_VARIABLE.JWT_ACCESS_EXPIRATION_MINUTES,
  [TOKEN_TYPE.REFRESH_TOKEN]: ENV_VARIABLE.JWT_REFRESH_EXPIRATION_DAYS * 24 * 60,
  [TOKEN_TYPE.OTP_TOKEN]: 5,
  [TOKEN_TYPE.FORGET_PASSWORD_TOKEN]: 5,
};

const TEMPLATES = path.join(process.cwd(), 'templates');
export const EJS_TEMPLATES = {
  ACCOUNT_VERIFICATION: path.join(TEMPLATES, 'ejs', 'verification-account.ejs'),
};

export const API_BASE_URL = path.join(ENV_VARIABLE.SERVER_URL, 'api/v1');

export const OPEN_API = {
  ACCOUNT_VERIFICATION: path.join(API_BASE_URL, 'auth', 'verifyOtp'),
};

export enum EMAIL_SUBJECT_MESSAGE {
  ACCOUNT_VERIFICATION = 'Account Verification',
}

export const APP_DETAILS = {
  SUPPORT_EMAIL: 'support@myapp.com',
  APP_NAME: 'My app',
};

export const MASTER_OTP = '55555555';
