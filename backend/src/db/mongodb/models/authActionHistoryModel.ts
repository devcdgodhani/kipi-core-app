import { Schema, model } from 'mongoose';
import { IAuthActionHistoryDocument } from '../../../interfaces';
import { AUTH_ACTION_TYPE } from '../../../constants';

// Schema
const AuthActionHistorySchema = new Schema<IAuthActionHistoryDocument>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'users', required: false },
    type: { type: String, enum: Object.values(AUTH_ACTION_TYPE), required: false },
    actionAt: { type: Number, required: false },
    deviceId: { type: String, required: false },
    deviceIp: { type: Boolean, required: false },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

// Model
export const AuthActionHistoryModel = model<IAuthActionHistoryDocument>(
  'auth_action_histories',
  AuthActionHistorySchema
);
