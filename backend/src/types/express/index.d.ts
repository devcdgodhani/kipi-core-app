import { JwtPayload } from 'jsonwebtoken';
import { IUserAttributes } from '../../interfaces';

declare global {
  namespace Express {
    export interface Request {
      user: IUserAttributes & { deviceIp?: string };
      token: JwtPayload & { otpType?: string };
    }
  }
}
