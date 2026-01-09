import { USER_TYPE } from '../../../constants';
import { CART_STATUS } from '../../../constants/cart';
import { cartService } from '../../../services/concrete/cartService';
import { skuService } from '../../../services/concrete/skuService';
import { userService } from '../../../services/concrete/userService';

export const seedCart = async () => {
    console.log('🌱 Seeding carts...');
    try {
        const customers = await userService.findAll({ type: USER_TYPE.CUSTOMER });
        const skus = await skuService.findAll({}, {}, 'productId' as any);

        if (customers.length === 0 || skus.length === 0) return;

        let count = 0;
        for (const user of customers) {
            // 50% chance to have items in cart
            if (Math.random() > 0.5) {
                let cart = await cartService.findOne({ userId: (user as any)._id, status: CART_STATUS.ACTIVE });
                if (!cart) {
                    cart = await cartService.create({
                        userId: (user as any)._id,
                        items: [],
                        status: CART_STATUS.ACTIVE
                    } as any);
                }
                
                // If cart is empty, add items
                if ((cart as any).items.length === 0) {
                    const numItems = Math.floor(Math.random() * 2) + 1;
                    const items: any[] = [];
                    
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
                         const existingItem = items.find((item: any) => item.skuId.toString() === sku._id.toString());
                         if (!existingItem) {
                             items.push({
                                 skuId: sku._id,
                                 productId: sku.productId?._id,
                                 quantity: 1,
                                 price,
                                 salePrice: sku.salePrice || price,
                                 offerPrice: sku.salePrice || price, 
                             });
                         }
                    }
                    if (items.length > 0) {
                        await cartService.updateOne({ _id: (cart as any)._id } as any, { items } as any);
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
