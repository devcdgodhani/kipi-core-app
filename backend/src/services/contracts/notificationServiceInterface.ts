import { INotificationAttributes, INotificationDocument } from '../../interfaces';
import { IMongooseCommonService } from './mongooseCommonServiceInterface';

export interface INotificationService extends IMongooseCommonService<INotificationAttributes, INotificationDocument> {
  // Add custom methods here if needed
  getUnreadCount(userId: string): Promise<number>;
  markAsRead(notificationIds: string[], userId: string): Promise<void>;
  markAllAsRead(userId: string): Promise<void>;
}
