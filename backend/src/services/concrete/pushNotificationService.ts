import { PushNotificationModel } from '../../db/mongodb/models/pushNotificationModel';
import { IPushNotificationAttributes, IPushNotificationDocument } from '../../interfaces/pushNotification';
import { IPushNotificationService } from '../contracts/pushNotificationServiceInterface';
import { MongooseCommonService } from './mongooseCommonService';
import { messaging } from '../../configs/firebase';
import { UserService } from './userService';
import { PUSH_NOTIFICATION_STATUS, PUSH_TARGET_TYPE } from '../../constants/pushNotification';

export class PushNotificationService
  extends MongooseCommonService<IPushNotificationAttributes, IPushNotificationDocument>
  implements IPushNotificationService
{
  private userService = new UserService();

  constructor() {
    super(PushNotificationModel as any);
  }

  async sendMulticast(tokens: string[], notification: any): Promise<any> {
    if (!tokens.length) return { successCount: 0, failureCount: 0 };

    // Batch tokens in groups of 500 (Firebase limit)
    const BATCH_SIZE = 500;
    const batches = [];
    for (let i = 0; i < tokens.length; i += BATCH_SIZE) {
      batches.push(tokens.slice(i, i + BATCH_SIZE));
    }

    let successCount = 0;
    let failureCount = 0;

    for (const batchTokens of batches) {
      try {
        const response = await messaging.sendEachForMulticast({
          tokens: batchTokens,
          notification: {
            title: notification.title,
            body: notification.body,
            imageUrl: notification.imageUrl,
          },
          data: notification.data || {},
        });
        successCount += response.successCount;
        failureCount += response.failureCount;
      } catch (error) {
        console.error('Error sending multicast batch:', error);
        failureCount += batchTokens.length;
      }
    }

    return { successCount, failureCount };
  }

  async registerDevice(userId: string, token: string, platform: string = 'unknown'): Promise<void> {
    const user = await this.userService.findOne({ _id: userId } as any);
    if (user) {
      // Add token if not exists (prevent duplicates)
      await this.userService.update(
        { _id: userId } as any,
        { $addToSet: { fcmTokens: token } } as any
      );
    }
  }

  async unregisterDevice(userId: string, token: string): Promise<void> {
    await this.userService.update(
        { _id: userId } as any,
        { $pull: { fcmTokens: token } } as any
    );
  }
}

export const pushNotificationService = new PushNotificationService();
