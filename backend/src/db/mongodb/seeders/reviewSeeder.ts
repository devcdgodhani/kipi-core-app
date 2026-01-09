import { REVIEW_STATUS } from '../../../constants/review';
import { reviewService } from '../../../services/concrete/reviewService';
import { orderService } from '../../../services/concrete/orderService';

export const seedReviews = async () => {
    console.log('🌱 Seeding reviews...');
    try {
        await reviewService.deleteMany({});
        
        const deliveredOrders = await orderService.findAll({ orderStatus: 'DELIVERED' }, { limit: 10 } as any);
        
        let reviewCount = 0;
        
        for (const order of deliveredOrders) {
            for (const item of (order as any).items) {
                try {
                     // 50% chance to review an item
                    if (Math.random() > 0.5) {
                       const existingReview = await reviewService.findOne({ 
                           userId: (order as any).userId, 
                           productId: (item as any).productId, 
                           orderId: (order as any)._id 
                       } as any);

                       if (!existingReview) {
                           await reviewService.create({
                               userId: (order as any).userId,
                               productId: (item as any).productId,
                               orderId: (order as any)._id,
                               rating: Math.floor(Math.random() * 2) + 4, // 4 or 5 stars
                               comment: 'Great product! Really loved the quality and fit.',
                               status: REVIEW_STATUS.APPROVED,
                               isVisible: true
                           } as any);
                           reviewCount++;
                       }
                    }
                } catch (err) {
                    console.warn(`⚠️ Skipped review for order ${(order as any).orderNumber}:`, err);
                }
            }
        }
        console.log(`✅ Review seeding completed. Created ${reviewCount} reviews.`);
    } catch (error) {
        console.error('❌ Error seeding reviews:', error);
    }
};
