import { LoyaltyTransactionModel } from '../models/loyaltyTransactionModel';
import { UserModel } from '../models/userModel';
import { OrderModel } from '../models/orderModel';
import { USER_TYPE } from '../../../constants';
import { LOYALTY_TRANSACTION_TYPE } from '../../../constants/loyalty';

export const seedLoyalty = async () => {
    console.log('🌱 Seeding loyalty transactions...');
    try {
        const customers = await UserModel.find({ type: USER_TYPE.CUSTOMER });

        let count = 0;
        for (const user of customers) {
            // Find orders for this user
            const orders = await OrderModel.find({ userId: user._id, orderStatus: 'DELIVERED' });
            
            // Initial balance logic simulation
            let currentBalance = 0;

            // 1. Sign up bonus
            const bonusExists = await LoyaltyTransactionModel.findOne({ userId: user._id, type: LOYALTY_TRANSACTION_TYPE.EARNED, message: 'Welcome Bonus' });
            if (!bonusExists) {
                currentBalance += 100;
                await LoyaltyTransactionModel.create({
                    userId: user._id,
                    type: LOYALTY_TRANSACTION_TYPE.EARNED,
                    points: 100,
                    balanceAfter: currentBalance,
                    message: 'Welcome Bonus'
                });
                count++;
            } else {
                currentBalance = bonusExists.balanceAfter; // rudimentary resume
            }

            // 2. Points for orders
            for (const order of orders) {
                const orderPointsExists = await LoyaltyTransactionModel.findOne({ userId: user._id, orderId: order._id });
                if (!orderPointsExists) {
                    const points = Math.floor(order.totalAmount / 100); // 1 point per 100
                    if (points > 0) {
                        currentBalance += points;
                        await LoyaltyTransactionModel.create({
                            userId: user._id,
                            orderId: order._id,
                            type: LOYALTY_TRANSACTION_TYPE.EARNED,
                            points: points,
                            balanceAfter: currentBalance,
                            message: `Order Earning #${order.orderNumber}`
                        });
                        count++;
                    }
                }
            }
        }
        console.log(`✅ Loyalty seeding completed. Created ${count} transactions.`);
    } catch (error) {
        console.error('❌ Error seeding loyalty:', error);
    }
};
