import { Job } from 'bullmq';
import { QueueFactory } from '../../services/infrastructure/queueFactory';
import { QUEUE_NAMES } from '../queues/logisticsQueues';
import { IWhatsAppJobPayload } from '../types';
import { WHATSAPP_MESSAGE_STATUS } from '../../constants';

import { whatsAppAccountService } from '../../services/concrete/whatsAppAccountService';
import { whatsAppContactService } from '../../services/concrete/whatsAppContactService';
import { whatsAppMessageService } from '../../services/concrete/whatsAppMessageService';
import { whatsAppRiskService } from '../../services/concrete/whatsAppRiskService';
import { WHATSAPP_CONNECTION_STATUS, WHATSAPP_ACCOUNT_STATUS, WHATSAPP_RISK_EVENT_TYPE } from '../../constants';

const whatsAppProcessor = async (job: Job<IWhatsAppJobPayload>) => {
  const { accountId, contactId, message, templateId, metadata } = job.data;

  console.log(`[WhatsApp Worker] Processing job ${job.id} for account ${accountId}`);

  let effectiveAccountId = accountId;
  try {
    // 1. Resolve effective account (failover logic)
    let account = await whatsAppAccountService.getAccount(accountId);

    // Check if assigned account is available for sending
    const isAccountAvailable = account && 
                               account.socketStatus === WHATSAPP_CONNECTION_STATUS.CONNECTED && 
                               account.status === WHATSAPP_ACCOUNT_STATUS.ACTIVE;

    if (!isAccountAvailable) {
      console.log(`[WhatsApp Worker] Original account ${accountId} is unavailable (Status: ${account?.status}, Socket: ${account?.socketStatus}). Selecting best available account...`);
      const bestAccount = await whatsAppAccountService.selectBestAccount();
      
      if (!bestAccount) {
        throw new Error(`Assigned account ${accountId} is unavailable and no other active accounts are available`);
      }
      
      account = bestAccount as any;
      effectiveAccountId = account!._id.toString();
      console.log(`[WhatsApp Worker] Failover: Using account ${effectiveAccountId} (${account?.number}) instead of ${accountId}`);

      // Update message record to reflect the new account used
      await whatsAppMessageService.updateOne(
        { jobId: job.id } as any,
          { accountId: effectiveAccountId } as any
      );
    }

    // Get contact details for mobile number
    const contact = await whatsAppContactService.findById(contactId);
    if (!contact) {
      throw new Error(`WhatsApp contact ${contactId} not found`);
    }

    // 3. Send message
    await whatsAppAccountService.sendMessage(effectiveAccountId, contact.mobile, job.data.message);

    // Update message status
    await whatsAppMessageService.updateStatus(job.id!, WHATSAPP_MESSAGE_STATUS.SENT, {
        sentAt: new Date()
    });

    // Update account counters
    await whatsAppAccountService.incrementCounters(effectiveAccountId);

    console.log(`[WhatsApp Worker] Message sent successfully via job ${job.id}`);
    return Promise.resolve({ success: true, jobId: job.id });
  } catch (error: any) {
    console.error(`[WhatsApp Worker] Failed to send message:`, error);

    // Update message status to failed
    await whatsAppMessageService.updateStatus(job.id!, WHATSAPP_MESSAGE_STATUS.FAILED, {
        failureReason: error.message
    });

    // Update account failure counter
    try {
        const failureAccountId = (error.message.includes('unavailable')) ? accountId : (effectiveAccountId || accountId);
        await whatsAppAccountService.updateOne(
          { _id: failureAccountId } as any,
          {
            $inc: { 'metadata.totalFailed': 1 },
          } as any
        );
    } catch (err) {
        console.error('[WhatsApp Worker] Failed to update failure counter:', err);
    }

    // Log risk if message failed (using standardized risk scoring)
    try {
      await whatsAppRiskService.logRiskEvent(
        accountId, 
        WHATSAPP_RISK_EVENT_TYPE.SEND_FAILURE, 
        { error: error.message, contactId }
      );
    } catch (riskErr) {
      console.error('[WhatsApp Worker] Failed to log risk event:', riskErr);
    }

    return Promise.reject(error);
  }
};

export const setupWhatsAppWorker = () => {
  QueueFactory.createWorker(QUEUE_NAMES.WHATSAPP, whatsAppProcessor);
  console.log('[WhatsApp Worker] WhatsApp message worker started');
};

