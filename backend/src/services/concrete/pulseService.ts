import { APP_DETAILS } from '../../constants';
import { IPulseService } from '../contracts/pulseServiceInterface';
import { UserModel } from '../../db/mongodb/models/userModel';
import { logisticsQueues } from '../../jobs/queues/logisticsQueues';
import { JOB_NAMES } from '../../jobs/types';
import { loyaltyService } from './loyaltyService';
import { LOYALTY_TRANSACTION_TYPE } from '../../constants/loyalty';

export class PulseService implements IPulseService {

    /**
     * Trigger a feedback request message to the customer when an order is delivered
     */
    async triggerFeedbackRequest(order: any) {
        try {
            const user = await UserModel.findById(order.userId);
            if (!user || !user.mobile) return;

            const message = `Hi ${user.firstName || 'there'}! 👋\n\nYour order #${order.orderNumber} from ${APP_DETAILS.APP_NAME} has been delivered! 📦\n\nWe'd love to hear your thoughts. Could you take a moment to leave a review?\n\nRate here: ${APP_DETAILS.CUSTOMER_URL}/orders/${order._id}\n\nThank you for shopping with us! ✨`;
            
            await logisticsQueues.notificationQueue.add(JOB_NAMES.SEND_NOTIFICATION, {
                type: 'WHATSAPP',
                recipient: user.mobile,
                template: 'FEEDBACK_REQUEST',
                data: { body: message }
            });
        } catch (err) {
            console.error('PulseService: Error triggering feedback request', err);
        }
    }

    /**
     * Notify customer about earned loyalty points
     */
    async triggerLoyaltyAccretionPulse(userId: string, points: number, orderNumber: string) {
        try {
            const user = await UserModel.findById(userId);
            if (!user || !user.mobile) return;

            const message = `Woohoo! 🥳\n\nYou've earned ${points} Kipi Points from your order #${orderNumber}!\n\nYour new loyalty balance is ${user.loyaltyPoints} points. ✨\n\nKeep shopping and save more on your next order! 🛍️`;
            
            await logisticsQueues.notificationQueue.add(JOB_NAMES.SEND_NOTIFICATION, {
                type: 'WHATSAPP',
                recipient: user.mobile,
                template: 'LOYALTY_POINTS_EARNED',
                data: { body: message }
            });
        } catch (err) {
            console.error('PulseService: Error triggering loyalty pulse', err);
        }
    }

    /**
     * Specific protocol for Birthday Rewards
     */
    async triggerBirthdayReward(user: any) {
        try {
            const rewardPoints = 500; // Gift 500 points
            await loyaltyService.updateBalance(
                user._id.toString(),
                rewardPoints,
                LOYALTY_TRANSACTION_TYPE.EARNED,
                `Happy Birthday! 🎂 Gift from ${APP_DETAILS.APP_NAME}`
            );
            
            const message = `Happy Birthday, ${user.firstName}! 🎂🥳\n\nWe have a special gift for you! We've added 500 Kipi Points to your account as a birthday reward. ✨\n\nTreat yourself today! 🛍️\n\nShop now: ${APP_DETAILS.CUSTOMER_URL}`;
            await logisticsQueues.notificationQueue.add(JOB_NAMES.SEND_NOTIFICATION, {
                type: 'WHATSAPP',
                recipient: user.mobile,
                template: 'BIRTHDAY_REWARD',
                data: { body: message }
            });
            console.log(`Birthday pulse offloaded to queue for user: ${user.firstName}`);
        } catch (err) {
            console.error('PulseService: Error triggering birthday reward', err);
        }
    }

    /**
     * Warning for points about to expire
     */
    async triggerPointsExpiryWarning(user: any, points: number, daysRemaining: number) {
        try {
            if (!user.mobile) return;

            const message = `Don't let your rewards go to waste! ⏳\n\nYour ${points} Kipi Points are expiring in ${daysRemaining} days. 😱\n\nUse them now to save on your favorite products! 🛍️\n\nShop here: ${APP_DETAILS.CUSTOMER_URL}/cart`;
            
            await logisticsQueues.notificationQueue.add(JOB_NAMES.SEND_NOTIFICATION, {
                type: 'WHATSAPP',
                recipient: user.mobile,
                template: 'POINTS_EXPIRY_WARNING',
                data: { body: message }
            });
        } catch (err) {
            console.error('PulseService: Error triggering expiry warning', err);
        }
    }
}

export const pulseService = new PulseService();
