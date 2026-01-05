import { ReturnModel } from '../models/returnModel';
import { OrderModel } from '../models/orderModel';
import { RETURN_STATUS, RETURN_REASON } from '../../../constants/return';

export const seedReturns = async () => {
    console.log('🌱 Seeding returns...');
    try {
        // Find some delivered orders to return (older than 1 day but recent enough)
        const eligibleOrders = await OrderModel.find({ orderStatus: 'DELIVERED' }).limit(5);

        let returnCount = 0;

        for (const order of eligibleOrders) {
            // Check if already returned
            const existingReturn = await ReturnModel.findOne({ orderId: order._id });
            if (existingReturn) continue;

            const itemToReturn = order.items[0]; // Just return first item
            const returnNumber = `RET-${order.orderNumber.split('-')[1]}`;

            await ReturnModel.create({
                orderId: order._id,
                userId: order.userId,
                returnNumber,
                items: [{
                    skuId: itemToReturn.skuId,
                    quantity: itemToReturn.quantity,
                    price: itemToReturn.price,
                    reason: RETURN_REASON.DEFECTIVE,
                    description: 'Item was damaged on arrival',
                }],
                status: RETURN_STATUS.PENDING,
                totalRefundAmount: itemToReturn.price * itemToReturn.quantity,
                refundStatus: 'PENDING',
                adminNotes: 'Auto-generated seed return'
            });
            returnCount++;
            console.log(`+ Created Return: ${returnNumber}`);
        }
        console.log(`✅ Return seeding completed. Created ${returnCount} returns.`);
    } catch (error) {
        console.error('❌ Error seeding returns:', error);
    }
};
