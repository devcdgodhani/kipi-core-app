import { Job } from 'bullmq';
import { QueueFactory } from '../../services/infrastructure/queueFactory';
import { QUEUE_NAMES } from '../../jobs/queues/logisticsQueues';
import { INotificationJobPayload } from '../../jobs/types';
import { sendEmail } from '../../helpers/sendEmail';

import { WhatsAppAccountService } from '../../services/concrete/whatsAppAccountService'; 

const notificationProcessor = async (job: Job<INotificationJobPayload>) => {
  const { type, recipient, template, data } = job.data;
  const whatsAppAccountService = new WhatsAppAccountService();
  console.log(`Processing notification job ${job.id} [${type}] for ${recipient}`);

  try {
    if (type === 'EMAIL') {
      const subject = data.subject || 'Logistics Update';
      const body = data.body || `Update for your order: ${template}`;
      const html = data.html || `<p>${body}</p>`;
      
      await sendEmail({
        to: Array.isArray(recipient) ? recipient : [recipient],
        subject: subject,
        text: body,
        html: html
      });
    } else if (type === 'WHATSAPP') {
       const message = data.body || data.message || `Update for your order: ${template}`;
       // Use queue-based sending instead of direct send
       await whatsAppAccountService.enqueueBestEffortMessage(recipient, message);
    }

    return Promise.resolve();
  } catch (error) {
    console.error(`Notification failed for ${recipient}:`, error);
    return Promise.reject(error);
  }
};


export const setupNotificationWorker = () => {
  QueueFactory.createWorker(QUEUE_NAMES.NOTIFICATION, notificationProcessor);
  console.log('Notification worker started');
};
