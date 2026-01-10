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
    }

    async init() {
        console.log('CronJobService: Synchronizing crons from database...');
        const jobs = await this.findAll({ status: CRON_JOB_STATUS.ACTIVE });
        
        for (const job of jobs) {
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
            }
        ];

        for (const dj of defaultJobs) {
            const exists = await this.findOne({ identifier: dj.identifier });
            if (!exists) {
                await this.create(dj as any);
            }
        }
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
}

export const cronJobService = new CronJobService();
