import { USER_TYPE } from '../../../constants';
import { WISHLIST_STATUS } from '../../../constants/wishlist';
import { wishlistService } from '../../../services/concrete/wishlistService';
import { userService } from '../../../services/concrete/userService';
import { productService } from '../../../services/concrete/productService';

export const seedWishlist = async () => {
    console.log('🌱 Seeding wishlist...');
    try {
        const customers = await userService.findAll({ type: USER_TYPE.CUSTOMER });
        const products = await productService.findAll({});

        if (customers.length === 0 || products.length === 0) return;

        let count = 0;
        for (const user of customers) {
            // Find existing wishlist or create new one
            let wishlist = await wishlistService.findOne({ userId: (user as any)._id });
            if (!wishlist) {
                wishlist = await wishlistService.create({
                    userId: (user as any)._id,
                    products: [],
                    status: WISHLIST_STATUS.ACTIVE
                } as any);
            }

            // check not already populated
            if ((wishlist as any).products.length > 0) continue;

            // Add 1-3 random products to wishlist
            const numItems = Math.floor(Math.random() * 3) + 1;
            const chosenProducts = new Set();
            const wishlistItems = [];
            
            for (let i = 0; i < numItems; i++) {
                const product = products[Math.floor(Math.random() * products.length)];
                if (!chosenProducts.has((product as any)._id.toString())) {
                    wishlistItems.push({
                        productId: (product as any)._id,
                        addedAt: new Date()
                    });
                    chosenProducts.add((product as any)._id.toString());
                }
            }
            if (wishlistItems.length > 0) {
                await wishlistService.updateOne({ _id: (wishlist as any)._id } as any, { products: wishlistItems } as any);
                count++;
            }
        }
        console.log(`✅ Wishlist seeding completed. Populated for ${count} users.`);
    } catch (error) {
        console.error('❌ Error seeding wishlist:', error);
    }
};
