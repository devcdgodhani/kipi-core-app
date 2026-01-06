import cron from 'node-cron';
import { UserModel } from '../../db/mongodb/models/userModel';
import { pulseService } from './pulseService';

import { IEngagementCronService } from '../contracts/engagementCronServiceInterface';

export class EngagementCronService implements IEngagementCronService {
    /**
     * Initialize all engagement crons
     */
    init() {
        console.log('Pulse Engagement: Initializing Crons...');

        // 1. Birthday Rewards (Every day at 9:00 AM)
        cron.schedule('0 9 * * *', () => {
            this.processBirthdayRewards();
        });

        // 2. Points Expiry Warnings (Every day at 10:00 AM)
        cron.schedule('0 10 * * *', () => {
            this.processPointsExpiryWarnings();
        });
    }

    /**
     * Check for users whose points expire in 30 days
     */
    async processPointsExpiryWarnings() {
        console.log('EngagementCron: Processing Points Expiry Warnings...');
        try {
            const thirtyDaysFromNow = new Date();
            thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);
            
            // Set range for exact match on that day
            const startOfDay = new Date(thirtyDaysFromNow.setHours(0, 0, 0, 0));
            const endOfDay = new Date(thirtyDaysFromNow.setHours(23, 59, 59, 999));

            const users = await UserModel.find({
                pointsExpiryDate: { $gte: startOfDay, $lte: endOfDay },
                loyaltyPoints: { $gt: 0 }
            });

            console.log(`EngagementCron: Found ${users.length} users with points expiring in 30 days.`);

            for (const user of users) {
                await pulseService.triggerPointsExpiryWarning(user, user.loyaltyPoints, 30);
            }
        } catch (err) {
            console.error('EngagementCron: Error processing points expiry', err);
        }
    }

    /**
     * Check for users whose birthday is today and trigger rewards
     */
    async processBirthdayRewards() {
        console.log('EngagementCron: Processing Birthday Rewards...');
        try {
            const today = new Date();
            const day = today.getDate();
            const month = today.getMonth() + 1; // getMonth is 0-indexed

            // MongoDB aggregation to find users whose DOB matches today (ignoring year)
            const users = await UserModel.aggregate([
                {
                    $project: {
                        firstName: 1,
                        mobile: 1,
                        loyaltyPoints: 1,
                        day: { $dayOfMonth: '$dob' },
                        month: { $month: '$dob' }
                    }
                },
                {
                    $match: {
                        day: day,
                        month: month
                    }
                }
            ]);

            console.log(`EngagementCron: Found ${users.length} birthdays today.`);

            for (const user of users) {
                await pulseService.triggerBirthdayReward(user);
            }
        } catch (err) {
            console.error('EngagementCron: Error processing birthday rewards', err);
        }
    }
}

export const engagementCronService = new EngagementCronService();
