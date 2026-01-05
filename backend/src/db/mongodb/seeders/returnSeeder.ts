import { ReturnModel } from '../models/returnModel';
import { OrderModel } from '../models/orderModel';
import { UserModel } from '../models/userModel';
import { RETURN_STATUS, RETURN_REASON } from '../../../constants/return';

export const seedReturns = async () => {
    console.log('🌱 Seeding returns...');
    try {
        await ReturnModel.deleteMany({});
        
        // Find some delivered orders or create one if none exist
        let eligibleOrders = await OrderModel.find({ orderStatus: 'DELIVERED' }).limit(5);

        if (eligibleOrders.length === 0) {
             console.log('⚠️ No delivered orders found. Creating a fresh delivered order for return seeding...');
             // Create a dummy delivered order
             const user = await UserModel.findOne({ type: 'CUSTOMER' });
             if (user) {
                 const newOrder = await OrderModel.create({
                     userId: user._id,
                     orderNumber: `ORD-SEED-${Date.now()}`,
                     items: [{
                         name: 'Seeded Product',
                         quantity: 1,
                         price: 500,
                         total: 500
                     }],
                     shippingAddress: { name: 'Seed', mobile: '000', street: 'S', city: 'C', state: 'S', country: 'C', pincode: '000' },
                     billingAddress: { name: 'Seed', mobile: '000', street: 'S', city: 'C', state: 'S', country: 'C', pincode: '000' },
                     totalAmount: 550,
                     subTotal: 500,
                     orderStatus: 'DELIVERED',
                     paymentStatus: 'COMPLETED'
                 });
                 eligibleOrders = [newOrder as any];
             }
        }

        let returnCount = 0;

        for (const order of eligibleOrders) {
            // Check if already returned
            const existingReturn = await ReturnModel.findOne({ orderId: order._id });
            if (existingReturn) continue;

            const itemToReturn = order.items[0]; 
            const returnNumber = `RET-${order.orderNumber.split('-').pop()}`;

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
