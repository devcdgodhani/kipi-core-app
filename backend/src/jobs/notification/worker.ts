import { Job } from 'bullmq';
import { QueueFactory } from '../../services/infrastructure/queueFactory';
import { BULL_QUEUES } from '../../constants/bullQueue';
import { IEmailJobPayload, IWhatsAppJobPayload } from '../types';
import { sendEmail } from '../../helpers/sendEmail';
import { WhatsAppAccountService } from '../../services/concrete/whatsAppAccountService';
import { whatsAppContactService } from '../../services/concrete/whatsAppContactService';

/**
 * Email Job Processor
 * Handles email notification delivery
 */
const processEmailJob = async (job: Job<IEmailJobPayload>) => {
  const { recipient, subject, body, html, data } = job.data;
  
  console.log(`[Notification Worker] Processing email job ${job.id} for ${recipient}`);

  try {
    const emailHtml = html || data?.html || `<p>${body}</p>`;
    const emailBody = body || data?.body || '';

    await sendEmail({
      to: Array.isArray(recipient) ? recipient : [recipient],
      subject: subject,
      text: emailBody,
      html: emailHtml
    });

    console.log(`[Notification Worker] Email sent successfully to ${recipient}`);
    return { success: true, jobId: job.id };
  } catch (error: any) {
    console.error(`[Notification Worker] Email failed for ${recipient}:`, error);
    throw error;
  }
};

/**
 * WhatsApp Job Processor
 * Handles WhatsApp message delivery with failover support
 */
const processWhatsAppJob = async (job: Job<IWhatsAppJobPayload>) => {
  const { accountId, contactId, message, templateId } = job.data;
  const whatsAppAccountService = new WhatsAppAccountService();

  console.log(`[Notification Worker] Processing WhatsApp job ${job.id} for contact ${contactId}`);

  try {
    // Get contact to retrieve mobile number
    const contact = await whatsAppContactService.findById(contactId);
    
    if (!contact) {
      throw new Error(`Contact ${contactId} not found`);
    }

    // Use the existing WhatsApp service logic with mobile number
    await whatsAppAccountService.enqueueBestEffortMessage(
      contact.mobile, 
      message, 
      { templateId }
    );

    console.log(`[Notification Worker] WhatsApp message enqueued successfully for ${contact.mobile}`);
    return { success: true, jobId: job.id };
  } catch (error: any) {
    console.error(`[Notification Worker] WhatsApp failed for contact ${contactId}:`, error);
    throw error;
  }
};

/**
 * Unified Notification Processor
 * Routes jobs to appropriate handler based on job name
 */
const notificationProcessor = async (job: Job<IEmailJobPayload | IWhatsAppJobPayload>) => {
  console.log(`[Notification Worker] Processing job ${job.id} of type ${job.name}`);

  switch (job.name) {
    case BULL_QUEUES.NOTIFICATION.JOBS.SEND_EMAIL:
      return processEmailJob(job as Job<IEmailJobPayload>);
    
    case BULL_QUEUES.NOTIFICATION.JOBS.SEND_WHATSAPP:
      return processWhatsAppJob(job as Job<IWhatsAppJobPayload>);
    
    default:
      console.error(`[Notification Worker] Unknown job type: ${job.name}`);
      throw new Error(`Unknown notification job type: ${job.name}`);
  }
};

/**
 * Setup Notification Worker
 * Initializes the worker to process notification jobs
 */
export const setupNotificationWorker = () => {
  QueueFactory.createWorker(BULL_QUEUES.NOTIFICATION.NAME, notificationProcessor);
  console.log('[Notification Worker] Notification worker started');
};
