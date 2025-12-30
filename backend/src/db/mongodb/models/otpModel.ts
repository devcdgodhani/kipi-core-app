import { Schema, model } from 'mongoose';
import { OTP_TYPE } from '../../../constants';
import { IOtpDocument } from '../../../interfaces';

// Schema
const OtpSchema = new Schema<IOtpDocument>(
  {
    code: { type: String, required: false },
    type: { type: String, enum: Object.values(OTP_TYPE), required: false },
    generateTokens: { type: [String], required: false, default: [] },
    userId: { type: Schema.Types.ObjectId, ref: 'users', required: false },
    expiredAt: { type: Number, required: false },
    maxUses: { type: Number, required: false, default: 1 },
    usesCount: { type: Number, required: false, default: 0 },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

// Model
export const OtpModel = model<IOtpDocument>('otps', OtpSchema);
