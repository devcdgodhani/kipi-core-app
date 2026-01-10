import cron from 'node-cron';
import { whatsAppAccountService } from '../../services/concrete/whatsAppAccountService';
import { whatsAppRiskService } from '../../services/concrete/whatsAppRiskService';
import { notificationQueue } from '../notification/queue';

/**
 * Daily counter reset - runs at midnight (00:00)
 */
export const setupDailyCounterReset = () => {
  cron.schedule('0 0 * * *', async () => {
    console.log('[WhatsApp Cron] Running daily counter reset...');
    try {
      await whatsAppAccountService.resetDailyCounters();
      console.log('[WhatsApp Cron] Daily counters reset successfully');
    } catch (error) {
      console.error('[WhatsApp Cron] Error resetting daily counters:', error);
    }
  });
  console.log('[WhatsApp Cron] Daily counter reset scheduled (00:00)');
};

/**
 * Hourly counter reset - runs at the start of every hour
 */
export const setupHourlyCounterReset = () => {
  cron.schedule('0 * * * *', async () => {
    console.log('[WhatsApp Cron] Running hourly counter reset...');
    try {
      await whatsAppAccountService.resetHourlyCounters();
      console.log('[WhatsApp Cron] Hourly counters reset successfully');
    } catch (error) {
      console.error('[WhatsApp Cron] Error resetting hourly counters:', error);
    }
  });
  console.log('[WhatsApp Cron] Hourly counter reset scheduled (every hour at :00)');
};

/**
 * Risk decay - runs daily at 01:00
 * Reduces all risk scores by 1 point
 */
export const setupRiskDecay = () => {
  cron.schedule('0 1 * * *', async () => {
    console.log('[WhatsApp Cron] Running risk decay...');
    try {
      await whatsAppRiskService.decayRiskScores();
      console.log('[WhatsApp Cron] Risk scores decayed successfully');
    } catch (error) {
      console.error('[WhatsApp Cron] Error decaying risk scores:', error);
    }
  });
  console.log('[WhatsApp Cron] Risk decay scheduled (01:00)');
};

/**
 * Health check - runs every 5 minutes
 * Monitors global risk and pauses system if needed
 */
export const setupHealthCheck = () => {
  const RISK_THRESHOLD = 60; // Pause if average risk > 60

  cron.schedule('*/5 * * * *', async () => {
    try {
      const avgRisk = await whatsAppRiskService.getGlobalRiskAverage();
      
      if (avgRisk > RISK_THRESHOLD) {
        console.warn(`[WhatsApp Cron] HIGH RISK ALERT: Average risk score is ${avgRisk.toFixed(2)}`);
        
        // Pause the queue
        const isPaused = await notificationQueue.queue.isPaused();
        if (!isPaused) {
          await notificationQueue.queue.pause();
          console.warn('[WhatsApp Cron] System paused due to high global risk');
          // TODO: Send alert notification to admin
        }
      } else {
        // Auto-resume if risk is back to normal
        const isPaused = await notificationQueue.queue.isPaused();
        if (isPaused && avgRisk < RISK_THRESHOLD - 10) {
          await notificationQueue.queue.resume();
          console.log('[WhatsApp Cron] System auto-resumed, risk is back to normal');
        }
      }
    } catch (error) {
      console.error('[WhatsApp Cron] Error in health check:', error);
    }
  });
  console.log('[WhatsApp Cron] Health check scheduled (every 5 minutes)');
};

/**
 * Initialize all WhatsApp cron jobs
 */
export const initWhatsAppCronJobs = () => {
  console.log('[WhatsApp Cron] Initializing WhatsApp cron jobs...');
  setupDailyCounterReset();
  setupHourlyCounterReset();
  setupRiskDecay();
  setupHealthCheck();
  console.log('[WhatsApp Cron] All WhatsApp cron jobs initialized');
};
