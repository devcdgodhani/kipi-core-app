import { ReviewModel } from '../models/reviewModel';
import { OrderModel } from '../models/orderModel';
import { REVIEW_STATUS } from '../../../constants/review';

export const seedReviews = async () => {
    console.log('🌱 Seeding reviews...');
    try {
        await ReviewModel.deleteMany({});
        
        // Drop indexes to remove potential old conflicts
        try {
            await ReviewModel.collection.dropIndexes();
        } catch (e) {
            // ignore if no indexes
        }

        const deliveredOrders = await OrderModel.find({ orderStatus: 'DELIVERED' }).limit(10);
        
        let reviewCount = 0;
        
        for (const order of deliveredOrders) {
            for (const item of order.items) {
                try {
                     // 50% chance to review an item
                    if (Math.random() > 0.5) {
                       const existingReview = await ReviewModel.findOne({ 
                           userId: order.userId, 
                           productId: item.productId, 
                           orderId: order._id 
                       });

                       if (!existingReview) {
                           await ReviewModel.create({
                               userId: order.userId,
                               productId: item.productId,
                               orderId: order._id,
                               rating: Math.floor(Math.random() * 2) + 4, // 4 or 5 stars
                               comment: 'Great product! Really loved the quality and fit.',
                               status: REVIEW_STATUS.APPROVED,
                               isVisible: true
                           });
                           reviewCount++;
                       }
                    }
                } catch (err) {
                    console.warn(`⚠️ Skipped review for order ${order.orderNumber}:`, err);
                }
            }
        }
        console.log(`✅ Review seeding completed. Created ${reviewCount} reviews.`);
    } catch (error) {
        console.error('❌ Error seeding reviews:', error);
    }
};
