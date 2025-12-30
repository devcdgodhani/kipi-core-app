import { ObjectId } from 'mongoose';
import { OTP_TYPE, TOKEN_TYPE } from '../constants';

export type TMongoDbConfig = {
  connectionUrl: string;
  dbName: string;
};

export type TGenerateTokenParams = {
  userId: ObjectId;
  tokenType: TOKEN_TYPE;
  expiredAt: number;
  referenceTokenId?: ObjectId | null;
  otpType?: OTP_TYPE;
};
