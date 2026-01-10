import { logisticsQueues } from '../../jobs/queues/logisticsQueues';
import { logger } from '../../configs/logger';

import { IWhatsAppSystemServiceContract } from '../contracts/whatsAppSystemServiceInterface';

import { whatsAppAccountService } from './whatsAppAccountService';

export class WhatsAppSystemService implements IWhatsAppSystemServiceContract {
  private get queue() { return logisticsQueues.whatsappQueue; }
  private get accountService() { return whatsAppAccountService; }

  constructor() {}

  async getQueueStatus() {
    const counts = await this.queue.getJobCounts('wait', 'active', 'completed', 'failed', 'delayed', 'paused');

    return {
      waiting: counts.wait,
      active: counts.active,
      completed: counts.completed,
      failed: counts.failed,
      delayed: counts.delayed,
      paused: counts.paused
    };
  }

  async retryFailedJobs() {
    const failedJobs = await this.queue.getFailed();
    const results = await Promise.allSettled(failedJobs.map(job => job.retry()));
    const retriedCount = results.filter(r => r.status === 'fulfilled').length;
    logger.info(`[WhatsAppSystemService] Retried ${retriedCount} failed jobs`);
    return retriedCount;
  }

  async cleanQueue(status: string, limit?: number) {
    const count = await this.queue.clean(0, limit || 1000, status as any);
    logger.info(`[WhatsAppSystemService] Cleaned ${count} ${status} jobs`);
    const countNumber = Array.isArray(count) ? count.length : count;
    return typeof countNumber === 'number' ? countNumber : 0;
  }

  async clearQueue() {
    await this.queue.drain();
    logger.info(`[WhatsAppSystemService] Queue drained`);
  }

  async pauseQueue() {
    await this.queue.pause();
    logger.info(`[WhatsAppSystemService] Queue paused`);
  }

  async resumeQueue() {
    await this.queue.resume();
    logger.info(`[WhatsAppSystemService] Queue resumed`);
  }

  async resetCounters() {
    await this.accountService.resetDailyCounters();
    await this.accountService.resetHourlyCounters();
    logger.info(`[WhatsAppSystemService] Daily and hourly counters reset`);
  }
}

export const whatsAppSystemService = new WhatsAppSystemService();
