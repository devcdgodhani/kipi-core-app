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
import { CouponModel } from '../../db/mongodb/models/couponModel';
import { COUPON_STATUS } from '../../constants/coupon';
import { FlashDealModel } from '../../db/mongodb/models/flashDealModel';
import { FLASH_DEAL_STATUS } from '../../constants/flashDeal';
import { CartModel } from '../../db/mongodb/models/cartModel';
import { CART_STATUS } from '../../constants/cart';
import { PushNotificationModel } from '../../db/mongodb/models/pushNotificationModel';
import { PUSH_NOTIFICATION_STATUS } from '../../constants/pushNotification';
import { pushNotificationService } from './pushNotificationService';
import { logisticsQueue } from '../../jobs/logistics/queue';
import { ShipmentModel } from '../../db/mongodb/models/shipmentModel';
import { SHIPMENT_STATUS } from '../../constants/shipment';
import { walletService } from './walletService';
import { walletTransactionService } from './walletTransactionService';
import { WALLET_TRANSACTION_STATUS } from '../../constants/walletTransaction';

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
        this.handlers.set('WALLET_EXPIRY_WARNING', this.processWalletExpiryWarnings.bind(this));
        this.handlers.set('PAYMENT_STATUS_SYNC', this.processPaymentStatusSync.bind(this));
        
        // WhatsApp Handlers
        this.handlers.set('WHATSAPP_DAILY_RESET', this.processDailyCounterReset.bind(this));
        this.handlers.set('WHATSAPP_HOURLY_RESET', this.processHourlyCounterReset.bind(this));
        this.handlers.set('WHATSAPP_RISK_DECAY', this.processRiskDecay.bind(this));
        this.handlers.set('WHATSAPP_HEALTH_CHECK', this.processHealthCheck.bind(this));

        // New Engagement Handlers
        this.handlers.set('OFFER_EXPIRY', this.processOfferExpiry.bind(this));
        this.handlers.set('FLASH_DEAL_CLEANUP', this.processFlashDealCleanup.bind(this));
        this.handlers.set('ABANDONED_CART', this.processAbandonedCarts.bind(this));
        this.handlers.set('PUSH_CAMPAIGN_SCHEDULER', this.processScheduledPushCampaigns.bind(this));
        this.handlers.set('LOGISTICS_TRACKING_SYNC', this.processLogisticsTrackingSync.bind(this));

        // Wallet Handlers
        this.handlers.set('WALLET_EXPIRY_CHECK', this.processWalletExpiry.bind(this));
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
                name: 'Wallet Expiry Warnings',
                identifier: 'WALLET_EXPIRY_WARNING',
                expression: '0 10 * * *',
                description: 'Notifies users 7 days before wallet credits expire'
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
            },
            // New Default Jobs
            {
                name: 'Offer Expiry Check',
                identifier: 'OFFER_EXPIRY',
                expression: '0 0 * * *', // Daily at midnight
                description: 'Marks expired offers and coupons as inactive'
            },
            {
                name: 'Flash Deal Cleanup',
                identifier: 'FLASH_DEAL_CLEANUP',
                expression: '0 * * * *', // Hourly
                description: 'Deactivates ended flash deals'
            },
            {
                name: 'Abandoned Cart Follow-up',
                identifier: 'ABANDONED_CART',
                expression: '0 * * * *', // Hourly
                description: 'Notifies users with items left in cart for > 24h'
            },
            {
                name: 'Push Campaign Scheduler',
                identifier: 'PUSH_CAMPAIGN_SCHEDULER',
                expression: '*/15 * * * *', // Every 15 mins
                description: 'Triggers scheduled push notification campaigns'
            },
            {
                name: 'Logistics Tracking Sync',
                identifier: 'LOGISTICS_TRACKING_SYNC',
                expression: '0 */4 * * *', // Every 4 hours
                description: 'Syncs tracking status for all active shipments'
            },
            {
                name: 'Wallet Expiry Check',
                identifier: 'WALLET_EXPIRY_CHECK',
                expression: '0 1 * * *', // Daily at 1 AM
                description: 'Expires wallet transactions tailored to expiry date'
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

    async processWalletExpiryWarnings() {
        console.log('CronJobService: Running wallet expiry warnings...');
        const warningDays = 7; // Warn 7 days in advance
        const expiryThreshold = new Date();
        expiryThreshold.setDate(expiryThreshold.getDate() + warningDays);
        const startOfDay = new Date(expiryThreshold.setHours(0, 0, 0, 0));
        const endOfDay = new Date(expiryThreshold.setHours(23, 59, 59, 999));

        // Find transactions expiring on that day
        const expiringTxns = await walletTransactionService.findAll({
            status: WALLET_TRANSACTION_STATUS.CONFIRMED,
            expiryDate: { $gte: startOfDay, $lte: endOfDay }
        } as any);

        console.log(`CronJobService: Found ${expiringTxns.length} transactions expiring in ${warningDays} days`);

        // Group by User
        const userMap: { [key: string]: number } = {};
        for (const txn of expiringTxns) {
            const uid = (txn as any).userId.toString();
            // userMap[uid] = (userMap[uid] || 0) + txn.availableBalance; // Removed incorrect property access 
            // WalletTransaction doesn't track remaining balance per transaction in this simple model usually.
            // But if we want to warn, we warn about 'amount' or check wallet?
            // "Your ₹500 Wallet credits are expiring".
            // Since we implemented simple ledger, we don't strictly link consumption to transaction (FIFO/LIFO).
            // But 'processWalletExpiry' (Line 577) assumes `transaction.amount` is the expiry amount capped by wallet balance.
            // So we should warn about `txn.amount`.
            userMap[uid] = (userMap[uid] || 0) + txn.amount;
        }

        for (const userId of Object.keys(userMap)) {
            try {
                const user = await this.userService.findById(userId);
                if (user) {
                     await pulseService.triggerWalletExpiryWarning(user, userMap[userId], warningDays);
                }
            } catch (error) {
                console.error(`CronJobService: Error sending expiry warning to user ${userId}`, error);
            }
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

    // --- New Handlers Implementation ---

    async processOfferExpiry() {
        console.log('CronJobService: Running offer expiry check...');
        const now = new Date();
        
        // Expire Coupons
        const expiredCoupons = await CouponModel.updateMany(
            { 
                endDate: { $lt: now }, 
                status: COUPON_STATUS.ACTIVE 
            },
            { 
                status: COUPON_STATUS.EXPIRED,
                updatedBy: null // System update
            }
        ).exec();

        console.log(`CronJobService: Expired ${expiredCoupons.modifiedCount} coupons.`);
    }

    async processFlashDealCleanup() {
        console.log('CronJobService: Running flash deal cleanup...');
        const now = new Date();

        // Expire Flash Deals
        const expiredDeals = await FlashDealModel.updateMany(
            { 
                endTime: { $lt: now }, 
                status: FLASH_DEAL_STATUS.ACTIVE 
            },
            { 
                status: FLASH_DEAL_STATUS.EXPIRED 
            }
        ).exec();

        console.log(`CronJobService: Expired ${expiredDeals.modifiedCount} flash deals.`);
    }

    async processAbandonedCarts() {
        console.log('CronJobService: Running abandoned cart check...');
        const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
        const fortyEightHoursAgo = new Date(Date.now() - 48 * 60 * 60 * 1000);

        // Find active carts updated between 24 and 48 hours ago (so we don't spam indefinitely)
        // And ensure they haven't been abandoned yet (if we had a status for that)
        // For now, we'll just log them. Real implementation would send a notification and maybe mark as ABANDONED.
        
        const abandonedCarts = await CartModel.find({
            status: CART_STATUS.ACTIVE,
            updatedAt: { 
                $lt: twentyFourHoursAgo,
                $gt: fortyEightHoursAgo 
            },
            items: { $not: { $size: 0 } }
        }).limit(50); // limit to avoid overload

        for (const cart of abandonedCarts) {
             // Logic to trigger push notification would go here
             // e.g. await pushNotificationService.sendToUser(cart.userId, { ... })
             // For now we just log
             console.log(`CronJobService: Found abandoned cart for user ${cart.userId}`);
        }
        
        console.log(`CronJobService: Processed ${abandonedCarts.length} abandoned carts.`);
    }

    async processScheduledPushCampaigns() {
        console.log('CronJobService: Running push campaign scheduler...');
        const now = new Date();

        const scheduledCampaigns = await PushNotificationModel.find({
            status: PUSH_NOTIFICATION_STATUS.SCHEDULED,
            'scheduling.scheduledAt': { $lte: now }
        });

        for (const campaign of scheduledCampaigns) {
            try {
                // Update to PROCESSING
                await PushNotificationModel.updateOne(
                    { _id: campaign._id },
                    { status: PUSH_NOTIFICATION_STATUS.PROCESSING }
                );

                // Get Target Users
                let tokens: string[] = [];
                // Logic to fetch tokens based on campaign.target (ALL, SEGMENT, etc)
                // Simplified: Fetch ALL users with tokens for now if target is ALL
                if (campaign.target.type === 'ALL') {
                     const users = await this.userService.findAll({ fcmTokens: { $exists: true, $not: { $size: 0 } } } as any, { projection: { fcmTokens: 1 } });
                     tokens = users.flatMap(u => u.fcmTokens || []).filter((t): t is string => !!t);
                }
                
                // Trigger Send via Queue
                if (tokens.length > 0) {
                     // Adding to notification queue for professional retry and tracking
                     await notificationQueue.queue.add(BULL_QUEUES.NOTIFICATION.JOBS.SEND_PUSH_CAMPAIGN, {
                        campaignId: campaign._id.toString(),
                        tokens: tokens,
                        payload: {
                            title: campaign.title,
                            body: campaign.body,
                            imageUrl: campaign.imageUrl,
                            data: campaign.data
                        }
                     });
                     
                     // Update status to COMPLETED (meaning queued for delivery)
                     await PushNotificationModel.updateOne(
                        { _id: campaign._id },
                        { 
                            status: PUSH_NOTIFICATION_STATUS.COMPLETED,
                            'stats.sentCount': tokens.length
                        }
                     );
                } else {
                     await PushNotificationModel.updateOne(
                        { _id: campaign._id },
                        { status: PUSH_NOTIFICATION_STATUS.COMPLETED, 'stats.failureCount': 1 } // No tokens found
                     );
                }

            } catch (error) {
                console.error(`CronJobService: Error processing campaign ${campaign._id}:`, error);
                await PushNotificationModel.updateOne(
                    { _id: campaign._id },
                    { status: PUSH_NOTIFICATION_STATUS.FAILED }
                );
            }
        }

        console.log(`CronJobService: Processed ${scheduledCampaigns.length} scheduled campaigns.`);
    }

    async processLogisticsTrackingSync() {
        console.log('CronJobService: Running logistics tracking sync...');
        
        // Find shipments that are not delivered or cancelled
        const activeShipments = await ShipmentModel.find({
            status: { $in: [SHIPMENT_STATUS.CREATED, SHIPMENT_STATUS.PICKED_UP, SHIPMENT_STATUS.IN_TRANSIT, SHIPMENT_STATUS.OUT_FOR_DELIVERY] },
            awb: { $exists: true, $ne: null }
        }).limit(200);

        console.log(`CronJobService: Enqueueing sync for ${activeShipments.length} shipments`);

        for (const shipment of activeShipments) {
            await logisticsQueue.queue.add(BULL_QUEUES.LOGISTICS.JOBS.SYNC_TRACKING, {
                shipmentId: (shipment as any)._id.toString(),
                awb: (shipment as any).awb
            });
        }
        }


    async processWalletExpiry() {
        console.log('CronJobService: Running wallet expiry check...');
        const now = new Date();

        // 1. Find confirm transactions that have expired
        const expiredTransactions = await walletTransactionService.findAll({
            status: WALLET_TRANSACTION_STATUS.CONFIRMED,
            expiryDate: { $lte: now }
        } as any);

        console.log(`CronJobService: Found ${expiredTransactions.length} expired wallet transactions.`);

        for (const transaction of expiredTransactions) {
            try {
                // Check if the user still has balance to expire
                const wallet = await walletService.getOrCreateWallet((transaction as any).userId.toString());
                
                // We can only expire what's remaining in the wallet or the transaction amount, whichever is lower
                // However, in a simple ledger, we just debit the amount if available.
                // A more complex logic might check if this specific transaction was already spent (FIFO).
                // For this implementation, we assume if points are in the wallet, they can expire.
                
                let amountToExpire = transaction.amount;
                if (wallet.availableBalance < amountToExpire) {
                    amountToExpire = wallet.availableBalance;
                }

                if (amountToExpire > 0) {
                    await walletService.debitWallet(
                        (transaction as any).userId.toString(),
                        amountToExpire,
                        {
                            description: `Expiry of transaction #${(transaction as any)._id}`,
                            orderId: null,
                            createdByType: 'SYSTEM' as any
                        }
                    );

                     // Mark transaction as EXPIRED (or create a new DEBIT transaction with type EXPIRY)
                     // Here we create a new debit transaction for the expiry
                     await walletTransactionService.createTransaction({
                        walletId: (wallet as any)._id.toString(),
                        userId: (transaction as any).userId.toString(),
                        transactionType: 'DEBIT' as any, // Using string literal to avoid import cycle if needed, or import type
                        sourceType: 'EXPIRY' as any,
                        amount: amountToExpire,
                        balanceBefore: wallet.availableBalance,
                        balanceAfter: wallet.availableBalance - amountToExpire,
                        description: `Expired: ${(transaction as any).description}`,
                        sourceReferenceId: (transaction as any)._id.toString(),
                        // createdBy: 'SYSTEM'
                    } as any);
                }

                // Update the original transaction status to EXPIRED to prevent re-processing
                await walletTransactionService.updateOne(
                    { _id: (transaction as any)._id } as any,
                    { status: WALLET_TRANSACTION_STATUS.EXPIRED }
                );

            } catch (error) {
                console.error(`CronJobService: Error expiring transaction ${(transaction as any)._id}:`, error);
            }
        }
    }
}

export const cronJobService = new CronJobService();
