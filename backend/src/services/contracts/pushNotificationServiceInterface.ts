import { IPushNotificationAttributes, IPushNotificationDocument } from '../../interfaces/pushNotification';
import { IMongooseCommonService } from './mongooseCommonServiceInterface';

export interface IPushNotificationService extends IMongooseCommonService<IPushNotificationAttributes, IPushNotificationDocument> {
    sendMulticast(tokens: string[], notification: any): Promise<any>;
    registerDevice(userId: string, token: string, platform?: string): Promise<void>;
}
