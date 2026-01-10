import * as cron from 'node-cron';
import { CronJobModel } from '../../db/mongodb/models/cronJobModel';
import { ICronJobDocument, ICronJobAttributes, CRON_JOB_STATUS } from '../../interfaces/cronJob';
import { MongooseCommonService } from './mongooseCommonService';
import { ICronJobService } from '../contracts/cronJobServiceInterface';
import { pulseService } from './pulseService';
import { UserService } from './userService';
import { PaymentService } from './paymentService';
import { CronJobHistoryService } from './cronJobHistoryService';
import { paymentQueue } from '../../jobs/payment/queue';
import { PAYMENT_STATUS } from '../../constants/payment';
import { BULL_QUEUES } from '../../constants/bullQueue';
import { whatsAppAccountService } from './whatsAppAccountService';
import { whatsAppRiskService } from './whatsAppRiskService';
import { notificationQueue } from '../../jobs/notification/queue';

export class CronJobService extends MongooseCommonService<ICronJobAttributes, ICronJobDocument> implements ICronJobService {
    private scheduledJobs: Map<string, cron.ScheduledTask> = new Map();
    private handlers: Map<string, () => Promise<void>> = new Map();
    private userService = new UserService();
    private paymentService = new PaymentService();
    private historyService = new CronJobHistoryService();

    constructor() {
        super(CronJobModel as any);
        this.registerHandlers();
    }

    private registerHandlers() {
        // Transferring handlers from EngagementCronService
        this.handlers.set('BIRTHDAY_REWARDS', this.processBirthdayRewards.bind(this));
        this.handlers.set('POINTS_EXPIRY_WARNING', this.processPointsExpiryWarnings.bind(this));
        this.handlers.set('PAYMENT_STATUS_SYNC', this.processPaymentStatusSync.bind(this));
        
        // WhatsApp Handlers
        this.handlers.set('WHATSAPP_DAILY_RESET', this.processDailyCounterReset.bind(this));
        this.handlers.set('WHATSAPP_HOURLY_RESET', this.processHourlyCounterReset.bind(this));
        this.handlers.set('WHATSAPP_RISK_DECAY', this.processRiskDecay.bind(this));
        this.handlers.set('WHATSAPP_HEALTH_CHECK', this.processHealthCheck.bind(this));
    }

    async init() {
        console.log('CronJobService: Synchronizing crons from database...');
        const jobs = await this.findAll({ status: CRON_JOB_STATUS.ACTIVE });
        
        for (const job of jobs) {
             // Migration: If schedule fields are missing, populate them from expression
             if (!job.scheduleMinute && job.expression) {
                const parts = job.expression.split(' ');
                if (parts.length === 5) {
                    await this.updateOne(
                        { _id: (job as any)._id } as any,
                        {
                            scheduleMinute: parts[0],
                            scheduleHour: parts[1],
                            scheduleDayOfMonth: parts[2],
                            scheduleMonth: parts[3],
                            scheduleDayOfWeek: parts[4]
                        } as any
                    );
                }
             }

            this.schedule(job);
        }

        // Seed default jobs if they don't exist
        await this.seedDefaultJobs();
    }

    private async seedDefaultJobs() {
        const defaultJobs = [
            {
                name: 'Birthday Rewards',
                identifier: 'BIRTHDAY_REWARDS',
                expression: '0 9 * * *',
                description: 'Sends rewards to users on their birthdays'
            },
            {
                name: 'Points Expiry Warnings',
                identifier: 'POINTS_EXPIRY_WARNING',
                expression: '0 10 * * *',
                description: 'Notifies users 30 days before points expire'
            },
            {
                name: 'Payment Status Sync',
                identifier: 'PAYMENT_STATUS_SYNC',
                expression: '*/15 * * * *', // Every 15 minutes
                description: 'Syncs pending payment statuses with gateways'
            },
            {
                name: 'WhatsApp Daily Reset',
                identifier: 'WHATSAPP_DAILY_RESET',
                expression: '0 0 * * *',
                description: 'Resets daily message counters for all WhatsApp accounts'
            },
            {
                name: 'WhatsApp Hourly Reset',
                identifier: 'WHATSAPP_HOURLY_RESET',
                expression: '0 * * * *',
                description: 'Resets hourly message counters for all WhatsApp accounts'
            },
            {
                name: 'WhatsApp Risk Decay',
                identifier: 'WHATSAPP_RISK_DECAY',
                expression: '0 1 * * *',
                description: 'Decays risk scores for all WhatsApp accounts daily'
            },
            {
                name: 'WhatsApp Health Check',
                identifier: 'WHATSAPP_HEALTH_CHECK',
                expression: '*/5 * * * *',
                description: 'Monitors global risk level and pauses system if critical'
            }
        ];

        for (const dj of defaultJobs) {
            const exists = await this.findOne({ identifier: dj.identifier });
            if (!exists) {
                await this.create(dj as any);
            }
        }
    }

    async updateCronSchedule(id: string, data: Partial<ICronJobAttributes>) {
        const existingJob = await this.findOne({ _id: id } as any);
        if (!existingJob) throw new Error('Cron job not found');

        // Construct expression if individual fields are present
        if (data.scheduleMinute || data.scheduleHour || data.scheduleDayOfMonth || data.scheduleMonth || data.scheduleDayOfWeek) {
            const m = data.scheduleMinute ?? existingJob.scheduleMinute ?? '*';
            const h = data.scheduleHour ?? existingJob.scheduleHour ?? '*';
            const dom = data.scheduleDayOfMonth ?? existingJob.scheduleDayOfMonth ?? '*';
            const mon = data.scheduleMonth ?? existingJob.scheduleMonth ?? '*';
            const dow = data.scheduleDayOfWeek ?? existingJob.scheduleDayOfWeek ?? '*';
            data.expression = `${m} ${h} ${dom} ${mon} ${dow}`;
        }

        await super.update({ _id: id } as any, data as any);
        const updatedJob = await this.findOne({ _id: id } as any);
        
        if (!updatedJob) return null;

        // If expression or status changed, we need to reschedule
        if (data.expression !== existingJob.expression || data.status !== existingJob.status) {
            console.log(`CronJobService: Rescheduling job [${updatedJob.name}] due to updates`);
            
            // Stop existing task
            if (this.scheduledJobs.has(updatedJob.identifier)) {
                this.scheduledJobs.get(updatedJob.identifier)?.stop();
                this.scheduledJobs.delete(updatedJob.identifier);
                console.log(`CronJobService: Stopped existing task for [${updatedJob.name}]`);
            }

            // Start new task if active
            if (updatedJob.status === CRON_JOB_STATUS.ACTIVE) {
                this.schedule(updatedJob);
            }
        }

        return updatedJob;
    }

    private schedule(job: ICronJobAttributes) {
        if (this.scheduledJobs.has(job.identifier)) {
            this.scheduledJobs.get(job.identifier)?.stop();
        }

        const task = cron.schedule(job.expression, async () => {
            await this.runJob(job.identifier);
        });

        this.scheduledJobs.set(job.identifier, task);
        console.log(`CronJobService: Scheduled [${job.name}] with expression [${job.expression}]`);
    }

    async runJob(identifier: string) {
        const job = await this.findOne({ identifier });
        if (!job) return;

        console.log(`CronJobService: Starting execution of [${job.name}]`);
        const startTime = Date.now();
        
        try {
            const handler = this.handlers.get(identifier);
            if (handler) {
                await handler();
                
                const duration = Date.now() - startTime;
                await this.updateOne(
                    { _id: (job as any)._id } as any,
                    { lastRun: new Date(), lastResult: 'SUCCESS', lastError: null } as any
                );
                
                await this.historyService.create({
                    cronJobId: (job as any)._id,
                    runAt: new Date(startTime),
                    durationMs: duration,
                    status: 'SUCCESS'
                } as any);
            } else {
                throw new Error(`No handler registered for identifier: ${identifier}`);
            }
        } catch (error: any) {
            const duration = Date.now() - startTime;
            console.error(`CronJobService: Error executing [${job.name}]:`, error);
            
            await this.updateOne(
                { _id: (job as any)._id } as any,
                { lastRun: new Date(), lastResult: 'FAILURE', lastError: error.message } as any
            );

            await this.historyService.create({
                cronJobId: (job as any)._id,
                runAt: new Date(startTime),
                durationMs: duration,
                status: 'FAILURE',
                error: error.message
            } as any);
        }
    }

    async getHistory(cronJobId: string) {
        return this.historyService.findAll({ cronJobId } as any, { sort: { runAt: -1 }, limit: 50 });
    }

    // --- Specific Handlers (Transferred from EngagementCronService) ---

    async processPointsExpiryWarnings() {
        const thirtyDaysFromNow = new Date();
        thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);
        const startOfDay = new Date(thirtyDaysFromNow.setHours(0, 0, 0, 0));
        const endOfDay = new Date(thirtyDaysFromNow.setHours(23, 59, 59, 999));

        const users = await this.userService.findAll({
            pointsExpiryDate: { $gte: startOfDay, $lte: endOfDay },
            loyaltyPoints: { $gt: 0 }
        } as any);

        for (const user of users) {
            await pulseService.triggerPointsExpiryWarning(user as any, (user as any).loyaltyPoints as number, 30);
        }
    }

    async processBirthdayRewards() {
        const today = new Date();
        const day = today.getDate();
        const month = today.getMonth() + 1;

        const users = await this.userService.aggregate([
            {
                $project: {
                    firstName: 1,
                    mobile: 1,
                    loyaltyPoints: 1,
                    day: { $dayOfMonth: '$dob' },
                    month: { $month: '$dob' }
                }
            },
            { $match: { day: day, month: month } }
        ]);

        for (const user of users) {
            await pulseService.triggerBirthdayReward(user);
        }
    }

    async processPaymentStatusSync() {
        console.log('CronJobService: Running payment status sync...');
        
        // Find payments in PENDING or INITIATED status older than 15 minutes
        const fifteenMinutesAgo = new Date(Date.now() - 15 * 60 * 1000);
        
        const pendingPayments = await this.paymentService.findAll({
            status: { $in: [PAYMENT_STATUS.PENDING, PAYMENT_STATUS.INITIATED] },
            createdAt: { $lt: fifteenMinutesAgo }
        } as any, { limit: 100 });

        console.log(`CronJobService: Found ${pendingPayments.length} pending payments to sync`);

        for (const payment of pendingPayments) {
            await paymentQueue.queue.add(BULL_QUEUES.PAYMENT.JOBS.SYNC_PAYMENT_STATUS, {
                paymentId: (payment as any)._id.toString()
            });
        }
    }

    // --- WhatsApp Handlers ---

    async processDailyCounterReset() {
        console.log('CronJobService: Running daily counter reset...');
        try {
            await whatsAppAccountService.resetDailyCounters();
            console.log('CronJobService: Daily counters reset successfully');
        } catch (error) {
            console.error('CronJobService: Error resetting daily counters:', error);
            throw error;
        }
    }

    async processHourlyCounterReset() {
        console.log('CronJobService: Running hourly counter reset...');
        try {
            await whatsAppAccountService.resetHourlyCounters();
            console.log('CronJobService: Hourly counters reset successfully');
        } catch (error) {
            console.error('CronJobService: Error resetting hourly counters:', error);
             throw error;
        }
    }

    async processRiskDecay() {
        console.log('CronJobService: Running risk decay...');
        try {
            await whatsAppRiskService.decayRiskScores();
            console.log('CronJobService: Risk scores decayed successfully');
        } catch (error) {
            console.error('CronJobService: Error decaying risk scores:', error);
             throw error;
        }
    }

    async processHealthCheck() {
        const RISK_THRESHOLD = 60; // Pause if average risk > 60
        try {
            const avgRisk = await whatsAppRiskService.getGlobalRiskAverage();
            
            if (avgRisk > RISK_THRESHOLD) {
                console.warn(`CronJobService: HIGH RISK ALERT: Average risk score is ${avgRisk.toFixed(2)}`);
                
                // Pause the queue
                const isPaused = await notificationQueue.queue.isPaused();
                if (!isPaused) {
                    await notificationQueue.queue.pause();
                    console.warn('CronJobService: System paused due to high global risk');
                    // TODO: Send alert notification to admin
                }
                if (isPaused && avgRisk < RISK_THRESHOLD - 10) {
                    await notificationQueue.queue.resume();
                    console.log('CronJobService: System auto-resumed, risk is back to normal');
                }
            }
        } catch (error) {
            console.error('CronJobService: Error in health check:', error);
             throw error;
        }
    }

    async create(data: Partial<ICronJobAttributes>, options?: any) {
        if (!data.expression && (data.scheduleMinute || data.scheduleHour)) {
            const m = data.scheduleMinute ?? '*';
            const h = data.scheduleHour ?? '*';
            const dom = data.scheduleDayOfMonth ?? '*';
            const mon = data.scheduleMonth ?? '*';
            const dow = data.scheduleDayOfWeek ?? '*';
            data.expression = `${m} ${h} ${dom} ${mon} ${dow}`;
        }
        return super.create(data, options);
    }
}

export const cronJobService = new CronJobService();
