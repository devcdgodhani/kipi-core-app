import { Schema, model } from 'mongoose';
import { IUserDocument } from '../../../interfaces';
import { USER_TYPE, GENDER, SIGN_UP_TYPE, USER_STATUS } from '../../../constants';

export const UserSchema = new Schema<IUserDocument>(
  {
    firstName: {
      type: String,
      required: false,
      maxLength: 50,
      trim: true,
    },
    lastName: {
      type: String,
      required: false,
      maxLength: 50,
      trim: true,
    },
    username: {
      type: String,
      required: false,
      unique: true,
      index: true,
      trim: true,
    },
    password: {
      type: String,
      required: false,
    },
    mobile: {
      type: String,
      required: false,
      index: true,
    },
    countryCode: {
      type: String,
      required: false,
    },
    email: {
      type: String,
      required: false,
      lowercase: true,
      index: true,
      trim: true,
    },
    type: {
      type: String,
      enum: Object.values(USER_TYPE),
      required: false,
    },
    gender: {
      type: String,
      enum: Object.values(GENDER),
      required: false,
    },
    signUpType: {
      type: String,
      enum: Object.values(SIGN_UP_TYPE),
      required: false,
      default: SIGN_UP_TYPE.APP,
    },
    isEmailVerified: {
      type: Boolean,
      default: false,
    },
    isMobileVerified: {
      type: Boolean,
      default: false,
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    status: {
      type: String,
      enum: Object.values(USER_STATUS),
      default: USER_STATUS.ACTIVE,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

// Create model
export const UserModel = model<IUserDocument>('users', UserSchema);
