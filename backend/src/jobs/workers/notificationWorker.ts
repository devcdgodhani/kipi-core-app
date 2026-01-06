import { Job } from 'bullmq';
import { QueueFactory } from '../../services/infrastructure/queueFactory';
import { QUEUE_NAMES } from '../../jobs/queues/logisticsQueues';
import { INotificationJobPayload } from '../../jobs/types';
import { sendEmail } from '../../helpers/sendEmail';

// Placeholder for WhatsApp service - assuming it exists or will be implemented
// import { whatsAppService } from '../../services/concrete/whatsAppService'; 

const notificationProcessor = async (job: Job<INotificationJobPayload>) => {
  const { type, recipient, template, data } = job.data;
  console.log(`Processing notification job ${job.id} [${type}] for ${recipient}`);

  try {
    if (type === 'EMAIL') {
      // Assuming sendEmail takes (to, subject, text, html?)
      // We need to map 'template' to actual content. 
      // For now, we will just send a generic message or assume 'data' contains valid email params.
      // This is a placeholder implementation to be refined with actual transactional email templates.
      
      const subject = data.subject || 'Logistics Update';
      const body = data.body || `Update for your order: ${template}`;
      
      await sendEmail({
        to: [recipient],
        subject: subject,
        text: body,
        html: `<p>${body}</p>`
      });
    } else if (type === 'WHATSAPP') {
       // await whatsAppService.sendMessage(recipient, template, data);
       console.log('WhatsApp notification logic pending integration');
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
