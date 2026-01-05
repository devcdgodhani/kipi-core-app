import { WishlistModel } from '../models/wishlistModel';
import { ProductModel } from '../models/productModel';
import { UserModel } from '../models/userModel';
import { USER_TYPE } from '../../../constants';
import { WISHLIST_STATUS } from '../../../constants/wishlist';

export const seedWishlist = async () => {
    console.log('🌱 Seeding wishlist...');
    try {
        const customers = await UserModel.find({ type: USER_TYPE.CUSTOMER });
        const products = await ProductModel.find({});

        if (customers.length === 0 || products.length === 0) return;

        let count = 0;
        for (const user of customers) {
            // Find existing wishlist or create new one
            let wishlist = await WishlistModel.findOne({ userId: user._id });
            if (!wishlist) {
                wishlist = new WishlistModel({
                    userId: user._id,
                    products: [],
                    status: WISHLIST_STATUS.ACTIVE
                });
            }

            // check not already populated
            if (wishlist.products.length > 0) continue;

            // Add 1-3 random products to wishlist
            const numItems = Math.floor(Math.random() * 3) + 1;
            const chosenProducts = new Set();
            
            for (let i = 0; i < numItems; i++) {
                const product = products[Math.floor(Math.random() * products.length)];
                if (!chosenProducts.has(product._id.toString())) {
                    wishlist.products.push({
                        productId: product._id as any,
                        addedAt: new Date()
                    });
                    chosenProducts.add(product._id.toString());
                }
            }
            await wishlist.save();
            count++;
        }
        console.log(`✅ Wishlist seeding completed. Populated for ${count} users.`);
    } catch (error) {
        console.error('❌ Error seeding wishlist:', error);
    }
};
