import { CartModel } from '../models/cartModel';
import { SkuModel } from '../models/skuModel';
import { UserModel } from '../models/userModel';
import { USER_TYPE } from '../../../constants';
import { CART_STATUS } from '../../../constants/cart';

export const seedCart = async () => {
    console.log('🌱 Seeding carts...');
    try {
        const customers = await UserModel.find({ type: USER_TYPE.CUSTOMER });
        const skus = await SkuModel.find({}).populate('productId');

        if (customers.length === 0 || skus.length === 0) return;

        let count = 0;
        for (const user of customers) {
            // 50% chance to have items in cart
            if (Math.random() > 0.5) {
                let cart = await CartModel.findOne({ userId: user._id, status: CART_STATUS.ACTIVE });
                if (!cart) {
                    cart = new CartModel({
                        userId: user._id,
                        items: [],
                        status: CART_STATUS.ACTIVE
                    });
                }
                
                // If cart is empty, add items
                if (cart.items.length === 0) {
                    const numItems = Math.floor(Math.random() * 2) + 1;
                    
                    for (let i=0; i<numItems; i++) {
                         const sku: any = skus[Math.floor(Math.random() * skus.length)];
                         
                         let price = 0;
                         if (sku.salePrice && !isNaN(sku.salePrice)) {
                             price = Number(sku.salePrice);
                         } else if (sku.basePrice && !isNaN(sku.basePrice)) {
                             price = Number(sku.basePrice);
                         } else {
                             price = 1000;
                         }
                         
                         // Check duplications in cart
                         const existingItem = cart.items.find((item: any) => item.skuId.toString() === sku._id.toString());
                         if (!existingItem) {
                             cart.items.push({
                                 skuId: sku._id,
                                 productId: sku.productId?._id,
                                 quantity: 1,
                                 price,
                                 salePrice: sku.salePrice || price,
                                 offerPrice: sku.salePrice || price, 
                             });
                         }
                    }
                    if (cart.items.length > 0) {
                        await cart.save();
                        count++;
                    }
                }
            }
        }
        console.log(`✅ Cart seeding completed. Populated for ${count} users.`);
    } catch (error) {
        console.error('❌ Error seeding cart:', error);
    }
};
