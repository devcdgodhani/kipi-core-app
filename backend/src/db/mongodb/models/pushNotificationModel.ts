import { Schema, model } from 'mongoose';
import { IPushNotificationDocument } from '../../../interfaces/pushNotification';
import { PUSH_NOTIFICATION_STATUS, PUSH_TARGET_TYPE } from '../../../constants/pushNotification';

const pushNotificationSchema = new Schema<IPushNotificationDocument>(
  {
    title: { type: String, required: true },
    body: { type: String, required: true },
    imageUrl: { type: String },
    data: { type: Object },
    target: {
      type: { 
        type: String, 
        enum: Object.values(PUSH_TARGET_TYPE), 
        required: true 
      },
      values: [{ type: String }]
    },
    scheduling: {
      isScheduled: { type: Boolean, default: false },
      scheduledAt: { type: Date }
    },
    stats: {
      sentCount: { type: Number, default: 0 },
      successCount: { type: Number, default: 0 },
      failureCount: { type: Number, default: 0 }
    },
    status: {
      type: String,
      enum: Object.values(PUSH_NOTIFICATION_STATUS),
      default: PUSH_NOTIFICATION_STATUS.DRAFT
    },
    createdBy: { type: Schema.Types.ObjectId, ref: 'users' }
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

// Indexes
pushNotificationSchema.index({ status: 1 });
pushNotificationSchema.index({ 'scheduling.scheduledAt': 1 }); // For scheduler
pushNotificationSchema.index({ createdBy: 1 });

export const PushNotificationModel = model<IPushNotificationDocument>('PushNotification', pushNotificationSchema);
