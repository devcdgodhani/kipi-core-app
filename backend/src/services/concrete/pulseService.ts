import { APP_DETAILS } from '../../constants';
import { IPulseService } from '../contracts/pulseServiceInterface';
import { UserService } from './userService';
import { BULL_QUEUES } from '../../constants/bullQueue';
import { notificationQueue } from '../../jobs/notification/queue';
import { walletService } from './walletService';
import { walletTransactionService } from './walletTransactionService';
import { WALLET_TRANSACTION_TYPE, WALLET_SOURCE_TYPE, WALLET_CREATED_BY } from '../../constants/walletTransaction';

export class PulseService implements IPulseService {
    private userService = new UserService();

    /**
     * Trigger a feedback request message to the customer when an order is delivered
     */
    async triggerFeedbackRequest(order: any) {
        try {
            const user = await this.userService.findById(order.userId);
            if (!user || !user.mobile) return;

            const message = `Hi ${user.firstName || 'there'}! 👋\n\nYour order #${order.orderNumber} from ${APP_DETAILS.APP_NAME} has been delivered! 📦\n\nWe'd love to hear your thoughts. Could you take a moment to leave a review?\n\nRate here: ${APP_DETAILS.CUSTOMER_URL}/orders/${order._id}\n\nThank you for shopping with us! ✨`;
            
            await notificationQueue.queue.add(BULL_QUEUES.NOTIFICATION.JOBS.SEND_WHATSAPP, {
                recipient: user.mobile,
                message: message,
                templateId: 'FEEDBACK_REQUEST'
            });
        } catch (err) {
            console.error('PulseService: Error triggering feedback request', err);
        }
    }

    /**
     * Notify customer about earned loyalty points
     */
    async triggerWalletCreditPulse(userId: string, amount: number, orderNumber: string) {
        try {
            const user = await this.userService.findById(userId);
            if (!user || !user.mobile) return;

            const message = `Woohoo! 🥳\n\nYou've received ₹${amount} Cashback in your Wallet from order #${orderNumber}!\n\nCheck your balance to save on your next order! 🛍️\n\nShop here: ${APP_DETAILS.CUSTOMER_URL}`;
            
            await notificationQueue.queue.add(BULL_QUEUES.NOTIFICATION.JOBS.SEND_WHATSAPP, {
                recipient: user.mobile,
                message: message,
                templateId: 'LOYALTY_POINTS_EARNED'
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
            const rewardAmount = 500; // Gift ₹500
            
            // Credit Wallet
            const wallet = await walletService.creditWallet(
                user._id.toString(),
                rewardAmount,
                { description: `Birthday Reward` }
            );

            // Create Transaction
            await walletTransactionService.createTransaction({
                walletId: (wallet as any)._id.toString(),
                userId: user._id.toString(),
                transactionType: WALLET_TRANSACTION_TYPE.CREDIT,
                sourceType: WALLET_SOURCE_TYPE.BIRTHDAY_REWARD,
                amount: rewardAmount,
                balanceBefore: wallet.availableBalance - rewardAmount,
                balanceAfter: wallet.availableBalance,
                description: `Happy Birthday! 🎂 Gift from ${APP_DETAILS.APP_NAME}`,
                createdBy: WALLET_CREATED_BY.SYSTEM
            });
            
            const message = `Happy Birthday, ${user.firstName}! 🎂🥳\n\nWe have a special gift for you! We've added ₹500 to your Wallet as a birthday reward. ✨\n\nTreat yourself today! 🛍️\n\nShop now: ${APP_DETAILS.CUSTOMER_URL}`;
            await notificationQueue.queue.add(BULL_QUEUES.NOTIFICATION.JOBS.SEND_WHATSAPP, {
                recipient: user.mobile,
                message: message,
                templateId: 'BIRTHDAY_REWARD'
            });
            console.log(`Birthday pulse offloaded to queue for user: ${user.firstName}`);
        } catch (err) {
            console.error('PulseService: Error triggering birthday reward', err);
        }
    }

    /**
     * Warning for points about to expire
     */
    async triggerWalletExpiryWarning(user: any, amount: number, daysRemaining: number) {
        try {
            if (!user.mobile) return;

            const message = `Don't let your rewards go to waste! ⏳\n\nYour ₹${amount} Wallet credits are expiring in ${daysRemaining} days. 😱\n\nUse them now to save on your favorite products! 🛍️\n\nShop here: ${APP_DETAILS.CUSTOMER_URL}/cart`;
            
            await notificationQueue.queue.add(BULL_QUEUES.NOTIFICATION.JOBS.SEND_WHATSAPP, {
                recipient: user.mobile,
                message: message,
                templateId: 'POINTS_EXPIRY_WARNING' // Consider renaming template too if possible, but keeping id for compatibility
            });
        } catch (err) {
            console.error('PulseService: Error triggering expiry warning', err);
        }
    }
}

export const pulseService = new PulseService();
