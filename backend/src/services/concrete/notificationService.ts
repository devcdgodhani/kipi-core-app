import { NotificationModel } from '../../db/mongodb';
import { INotificationAttributes, INotificationDocument } from '../../interfaces';
import { INotificationService } from '../contracts/notificationServiceInterface';
import { MongooseCommonService } from './mongooseCommonService';

export class NotificationService
  extends MongooseCommonService<INotificationAttributes, INotificationDocument>
  implements INotificationService
{
  constructor() {
    super(NotificationModel as any);
  }

  async getUnreadCount(userId: string): Promise<number> {
    return await NotificationModel.countDocuments({
      userId,
      isRead: false,
      status: 'ACTIVE',
    });
  }

  async markAsRead(notificationIds: string[], userId: string): Promise<void> {
    await NotificationModel.updateMany(
      {
        _id: { $in: notificationIds },
        userId,
      },
      {
        isRead: true,
        readAt: new Date(),
      }
    );
  }

  async markAllAsRead(userId: string): Promise<void> {
    await NotificationModel.updateMany(
      {
        userId,
        isRead: false,
      },
      {
        isRead: true,
        readAt: new Date(),
      }
    );
  }
}

export const notificationService = new NotificationService();
