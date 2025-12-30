import { OTP_TYPE } from '../../constants';
import { IAuthTokenAttributes, IUserAttributes } from '../../interfaces';
import { TGenerateTokenParams } from '../../types';

export interface IAuthService {
  checkUserAccountExist: (user: Partial<IUserAttributes>) => Promise<IUserAttributes | null>;
  generateUserTokens: (tokenData: TGenerateTokenParams) => Promise<IAuthTokenAttributes>;
  verifyPassword: (password: string, hashPassword: string) => Promise<boolean>;
  sendOtpAndGetOtpToken: (
    user: IUserAttributes,
    type: OTP_TYPE,
    maxUses?: number
  ) => Promise<IAuthTokenAttributes>;
  generateHashPassword: (password: string) => Promise<string>;
  userLogin: (user: IUserAttributes) => Promise<Omit<IUserAttributes, 'password'>>;
}
