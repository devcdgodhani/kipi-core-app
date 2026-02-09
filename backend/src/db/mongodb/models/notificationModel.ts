import { Schema, model } from 'mongoose';
import { INotificationDocument } from '../../../interfaces/notification';
import { NOTIFICATION_TYPE, NOTIFICATION_STATUS } from '../../../constants';

const notificationSchema = new Schema<INotificationDocument>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'users', required: true },
    type: { 
      type: String, 
      enum: Object.values(NOTIFICATION_TYPE), 
      required: true
    },
    title: { type: String, required: true },
    message: { type: String, required: true },
    data: { type: Schema.Types.Mixed },
    isRead: { type: Boolean, default: false },
    readAt: { type: Date },
    imageUrl: { type: String },
    actionUrl: { type: String },
    status: { 
      type: String, 
      enum: Object.values(NOTIFICATION_STATUS), 
      default: NOTIFICATION_STATUS.ACTIVE
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

// Indexes for performance
notificationSchema.index({ userId: 1, isRead: 1, createdAt: -1 });
notificationSchema.index({ userId: 1, status: 1, createdAt: -1 });
notificationSchema.index({ type: 1, createdAt: -1 });

export const NotificationModel = model<INotificationDocument>('Notification', notificationSchema);
