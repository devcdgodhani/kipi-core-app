import { RETURN_STATUS, RETURN_REASON } from '../../../constants/return';
import { returnService } from '../../../services/concrete/returnService';
import { orderService } from '../../../services/concrete/orderService';
import { userService } from '../../../services/concrete/userService';

export const seedReturns = async () => {
    console.log('🌱 Seeding returns...');
    try {
        await returnService.deleteMany({});
        
        // Find some delivered orders or create one if none exist
        let eligibleOrders = await orderService.findAll({ orderStatus: 'DELIVERED' }, { limit: 5 } as any);

        if (eligibleOrders.length === 0) {
             console.log('⚠️ No delivered orders found. Creating a fresh delivered order for return seeding...');
             // Create a dummy delivered order
             const user = await userService.findOne({ type: 'CUSTOMER' });
             if (user) {
                 const newOrder = await orderService.create({
                     userId: (user as any)._id,
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
                 } as any);
                 eligibleOrders = [newOrder as any];
             }
        }

        let returnCount = 0;

        for (const order of eligibleOrders) {
            // Check if already returned
            const existingReturn = await returnService.findOne({ orderId: (order as any)._id });
            if (existingReturn) continue;

            const itemToReturn = (order as any).items[0]; 
            const returnNumber = `RET-${(order as any).orderNumber.split('-').pop()}`;

            await returnService.create({
                orderId: (order as any)._id,
                userId: (order as any).userId,
                returnNumber,
                items: [{
                    skuId: (itemToReturn as any).skuId,
                    quantity: (itemToReturn as any).quantity,
                    price: (itemToReturn as any).price,
                    reason: RETURN_REASON.DEFECTIVE,
                    description: 'Item was damaged on arrival',
                }],
                status: RETURN_STATUS.PENDING,
                totalRefundAmount: (itemToReturn as any).price * (itemToReturn as any).quantity,
                refundStatus: 'PENDING',
                adminNotes: 'Auto-generated seed return'
            } as any);
            returnCount++;
            console.log(`+ Created Return: ${returnNumber}`);
        }
        console.log(`✅ Return seeding completed. Created ${returnCount} returns.`);
    } catch (error) {
        console.error('❌ Error seeding returns:', error);
    }
};
