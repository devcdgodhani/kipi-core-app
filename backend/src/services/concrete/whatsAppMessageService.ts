import { MongooseCommonService } from './mongooseCommonService';
import { WhatsAppMessageModel } from '../../db/mongodb';
import { IWhatsAppMessageAttributes, IWhatsAppMessageDocument } from '../../interfaces';
import { WHATSAPP_MESSAGE_STATUS } from '../../constants';
import { logger } from '../../configs/logger';

import { IWhatsAppMessageServiceContract } from '../contracts/whatsAppMessageServiceInterface';

export class WhatsAppMessageService extends MongooseCommonService<IWhatsAppMessageAttributes, IWhatsAppMessageDocument> implements IWhatsAppMessageServiceContract {
  constructor() {
    super(WhatsAppMessageModel);
  }

  /**
   * Log a new message (Contract implementation)
   */
  async logMessage(data: Partial<IWhatsAppMessageAttributes> & { accountId: string }): Promise<IWhatsAppMessageDocument> {
      return this.create(data as any) as unknown as IWhatsAppMessageDocument;
  }

  /**
   * Create a new message record (Internal use with specific fields)
   */
  async createMessage(data: {
    accountId: string;
    contactId: string;
    message: string;
    jobId: string;
    templateId?: string;
  }): Promise<IWhatsAppMessageDocument> {
    const message = await this.create({
      ...data,
      status: WHATSAPP_MESSAGE_STATUS.QUEUED,
    } as any);

    logger.info(`[WhatsAppMessageService] Created message record for job ${data.jobId}`);
    return message as unknown as IWhatsAppMessageDocument;
  }

  async markAsDelivered(messageId: string): Promise<IWhatsAppMessageDocument | null> {
      return this.upsert(
          { _id: messageId } as any,
          { $set: { status: WHATSAPP_MESSAGE_STATUS.DELIVERED, deliveredAt: new Date() } } as any
      ) as unknown as IWhatsAppMessageDocument;
  }

  async markAsRead(messageId: string): Promise<IWhatsAppMessageDocument | null> {
      return this.upsert(
          { _id: messageId } as any,
          { $set: { status: WHATSAPP_MESSAGE_STATUS.READ, readAt: new Date() } } as any
      ) as unknown as IWhatsAppMessageDocument;
  }

  async markAsFailed(messageId: string, error: string): Promise<IWhatsAppMessageDocument | null> {
      return this.upsert(
          { _id: messageId } as any,
          { $set: { status: WHATSAPP_MESSAGE_STATUS.FAILED, failureReason: error } } as any
      ) as unknown as IWhatsAppMessageDocument;
  }

  /**
   * Update message status
   */
  async updateStatus(
    jobId: string,
    status: WHATSAPP_MESSAGE_STATUS,
    additionalData?: {
      sentAt?: Date;
      deliveredAt?: Date;
      readAt?: Date;
      failureReason?: string;
    }
  ): Promise<void> {
    await this.updateOne(
      { jobId } as any,
      {
        $set: {
          status,
          ...additionalData,
        },
      } as any
    );
  }

  /**
   * Get messages by status
   */
  async getMessagesByStatus(status: WHATSAPP_MESSAGE_STATUS): Promise<IWhatsAppMessageDocument[]> {
    return await this.findAll(
      { status } as any,
      { sort: { createdAt: -1 } } as any
    ) as unknown as IWhatsAppMessageDocument[];
  }

  /**
   * Get messages for an account
   */
  async getAccountMessages(accountId: string, limit: number = 100): Promise<IWhatsAppMessageDocument[]> {
    return await this.findAll(
      { accountId } as any,
      {
        sort: { createdAt: -1 },
        limit,
        populate: [{ path: 'contactId', select: 'mobile state' }]
      } as any
    ) as unknown as IWhatsAppMessageDocument[];
  }

  /**
   * Get messages for a contact
   */
  async getContactMessages(contactId: string): Promise<IWhatsAppMessageDocument[]> {
    return await this.findAll(
      { contactId } as any,
      { sort: { createdAt: -1 } } as any
    ) as unknown as IWhatsAppMessageDocument[];
  }

  /**
   * Get failed messages
   */
  async getFailedMessages(limit: number = 50): Promise<IWhatsAppMessageDocument[]> {
    return await this.findAll(
      { status: WHATSAPP_MESSAGE_STATUS.FAILED } as any,
      {
        sort: { createdAt: -1 },
        limit,
        populate: [
          { path: 'accountId', select: 'number' },
          { path: 'contactId', select: 'mobile' }
        ]
      } as any
    ) as unknown as IWhatsAppMessageDocument[];
  }

  /**
   * Get message statistics for today
   */
  async getTodayStats(): Promise<{
    sent: number;
    failed: number;
    queued: number;
    total: number;
  }> {
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    const stats = await WhatsAppMessageModel.aggregate([
      {
        $match: {
          createdAt: { $gte: startOfDay },
        },
      },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
        },
      },
    ]);

    const result = {
      sent: 0,
      failed: 0,
      queued: 0,
      total: 0,
    };

    stats.forEach((stat) => {
      if (stat._id === WHATSAPP_MESSAGE_STATUS.SENT) result.sent = stat.count;
      if (stat._id === WHATSAPP_MESSAGE_STATUS.FAILED) result.failed = stat.count;
      if (stat._id === WHATSAPP_MESSAGE_STATUS.QUEUED) result.queued = stat.count;
      result.total += stat.count;
    });

    return result;
  }

  /**
   * Check if a job has already been processed (idempotency check)
   */
  async isJobProcessed(jobId: string): Promise<boolean> {
    const message = await this.findOne({ jobId } as any);
    return message !== null;
  }
}
export const whatsAppMessageService = new WhatsAppMessageService();
