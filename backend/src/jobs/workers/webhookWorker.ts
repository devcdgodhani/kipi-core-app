import { Job } from 'bullmq';
import { QueueFactory } from '../../services/infrastructure/queueFactory';
import { QUEUE_NAMES } from '../../jobs/queues/logisticsQueues';
import { IWebhookJobPayload } from '../../jobs/types';
import { webhookService } from '../../services/concrete/webhookService';

const webhookProcessor = async (job: Job<IWebhookJobPayload>) => {
  const { provider, body } = job.data;
  console.log(`Processing webhook job ${job.id} for ${provider}`);

  // In async flow, we assume validation happened before queuing, 
  // but we need to re-normalize or just pass the body if we queued the raw body.
  // Ideally, if we passed 'normalizedEvent' in payload it would be better,
  // but let's assume we queued the RAW payload to be safe and robust.
  
  // Actually, WebhookService.processEvent expects the NORMALIZED event.
  // But wait, in the Service refactor, I made validateAndLog return the normalized event.
  // It's better to queue the NORMALIZED event so the worker doesn't need to re-parse.
  // However, I defined IWebhookJobPayload as having 'body: any'.
  // Let's rely on the service to handle it.
  
  // Strategy:
  // 1. Controller calls validateAndLog -> gets normalizedEvent.
  // 2. Controller queues normalizedEvent.
  // 3. Worker calls processEvent(normalizedEvent).
  
  // But wait, the payload interface says 'headers' and 'body'.
  // If I change the strategy to queueing NORMALIZED event, I should update the interface.
  // Or I can just queue the raw body and let the worker normalize again?
  // Normalization is cheap. Re-normalization is safer if logic changes.
  
  // Let's stick to the plan: Queue raw payload. Worker normalizes or Service normalizes?
  // Service.processEvent(event) expects NORMALIZED event.
  // So the worker needs to normalize.
  // But wait, I don't have access to provider instance here easily without Service.
  // I should add a method 'normalize' to service or use the provider directly.
  
  // Easier path: Update WebhookService to have 'processJob(jobData)'.
  // Let's assume we queue the RAW data.
  // The worker will call a new method in Service `processAsyncWebhook(jobData)`.
  // OR, better:
  // The controller queues the NORMALIZED event.
  // I will update the job payload type to reflect this in the next step if strictly needed,
  // but 'body' type 'any' is flexible.
  
  // Let's use the Service's public `processWebhook` (deprecated one) logic but split?
  // No, I already split it. 
  
  // Re-evaluating:
  // If I queue raw payload + headers, I can re-validate (optional) and normalize.
  // But validation requires headers.
  
  // Let's look at `processEvent` in `WebhookService`. It takes `event: any` (normalized).
  // So the worker must provide normalized event.
  // I can import `shiprocketProvider` here to normalize, or ask `webhookService` to normalize.
  // `webhookService` has `shiprocketProvider` private. 
  // I'll add a `normalizePayload` public method to `WebhookService`? 
  // No, `validateAndLog` returns `normalizedEvent`.
  // Controller has it!
  // So Controller can queue the `normalizedEvent`.
  
  // So job payload body will be the `normalizedEvent`.
  
  try {
    // We expect job.data.body to be the NORMALIZED event if we change controller logic.
    // If we stick to interface (headers, body), then it's raw.
    // Let's make the Controller queue the RAW data for maximum recoverability (Dead Letter Queue replay).
    // If we queue normalized data, and normalization logic had a bug, we can't replay raw data.
    // SO: Queue RAW data.
    
    // Logic:
    // 1. Worker receives RAW body + headers.
    // 2. Worker calls: webhookService.validateAndLog (idempotency check needed? or just skip log if exists?)
    //    Wait, Controller ALREADY logged it as PENDING.
    //    We don't want to double log.
    // 3. We need a method `processRawWebhook(payload, headers)` that skips logging new entry, 
    //    but updates the EXISTING entry (found by some ID?)
    //    We need to pass the `logId` in the job payload!
    
    // REVISED STRATEGY:
    // Controller:
    // 1. validateAndLog -> Returns { isValid, logId, normalizedEvent }
    // 2. Queue { logId, event: normalizedEvent }
    
    // Worker:
    // 1. Receive { logId, event }
    // 2. call webhookService.processEvent(event).
    
    // This is clean. The logId is embedded in finding the record to update status.
    // `processEvent` takes `event` which usually has `eventId` (from provider). 
    // My `WebhookLogModel` uses `eventId` as key too?
    // Let's check `WebhookLogModel`.
    // It filters by `eventId: normalizedEvent.eventId`.
    
    // So passing `normalizedEvent` is sufficient!
    
    await webhookService.processEvent(job.data.body);

    return Promise.resolve();
  } catch (error) {
    return Promise.reject(error);
  }
};

export const setupWebhookWorker = () => {
  QueueFactory.createWorker(QUEUE_NAMES.WEBHOOK, webhookProcessor);
  console.log('Webhook worker started');
};
