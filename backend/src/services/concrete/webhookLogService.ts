import { WebhookLogModel } from '../../db/mongodb';
import { IWebhookLogAttributes, IWebhookLogDocument } from '../../interfaces/webhookLog';
import { MongooseCommonService } from './mongooseCommonService';
 
export class WebhookLogService extends MongooseCommonService<IWebhookLogAttributes, IWebhookLogDocument> {
  constructor() {
    super(WebhookLogModel as any);
  }
}
 
export const webhookLogService = new WebhookLogService();
