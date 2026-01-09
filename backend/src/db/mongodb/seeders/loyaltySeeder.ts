import { USER_TYPE } from '../../../constants';
import { LOYALTY_TRANSACTION_TYPE } from '../../../constants/loyalty';
import { loyaltyService } from '../../../services/concrete/loyaltyService';
import { userService } from '../../../services/concrete/userService';
import { orderService } from '../../../services/concrete/orderService';

export const seedLoyalty = async () => {
    console.log('🌱 Seeding loyalty transactions...');
    try {
        const customers = await userService.findAll({ type: USER_TYPE.CUSTOMER });

        let count = 0;
        for (const user of customers) {
            // Find orders for this user
            const orders = await orderService.findAll({ userId: (user as any)._id, orderStatus: 'DELIVERED' });
            
            // 1. Sign up bonus
            const bonusExists = await loyaltyService.findOne({ userId: (user as any)._id, message: 'Welcome Bonus' });
            if (!bonusExists) {
                await loyaltyService.updateBalance(
                    (user as any)._id.toString(),
                    100,
                    LOYALTY_TRANSACTION_TYPE.EARNED,
                    'Welcome Bonus'
                );
                count++;
            }

            // 2. Points for orders
            for (const order of orders) {
                const orderPointsExists = await loyaltyService.findOne({ userId: (user as any)._id, orderId: (order as any)._id });
                if (!orderPointsExists) {
                    const points = Math.floor((order as any).totalAmount / 100); // 1 point per 100
                    if (points > 0) {
                        await loyaltyService.updateBalance(
                            (user as any)._id.toString(),
                            points,
                            LOYALTY_TRANSACTION_TYPE.EARNED,
                            `Order Earning #${(order as any).orderNumber}`,
                            (order as any)._id
                        );
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
