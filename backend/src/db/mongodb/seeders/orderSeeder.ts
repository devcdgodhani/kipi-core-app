import { USER_TYPE } from '../../../constants';
import { orderService } from '../../../services/concrete/orderService';
import { userService } from '../../../services/concrete/userService';
import { skuService } from '../../../services/concrete/skuService';
import { addressService } from '../../../services/concrete/addressService';

export const seedOrders = async () => {
    console.log('🌱 Seeding orders...');
    try {
        const customers = await userService.findAll({ type: USER_TYPE.CUSTOMER });
        const skus = await skuService.findAll({}, {}, 'productId' as any);

        if (customers.length === 0 || skus.length === 0) {
            console.warn('⚠️ No Customers or SKUs found. Skipping order seeding.');
            return;
        }

        let orderCount = 0;

        for (const customer of customers) {
            const address = await addressService.findOne({ userId: (customer as any)._id });
            if (!address) continue; // Skip if no address

            // Create 2-3 orders per customer
            const numOrders = Math.floor(Math.random() * 2) + 2;

            for (let i = 0; i < numOrders; i++) {
                const orderNumber = `ORD-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

                // Pick random SKUs
                const orderItems = [];
                let subTotal = 0;
                const numItems = Math.floor(Math.random() * 3) + 1; // 1-3 items

                for (let j = 0; j < numItems; j++) {
                    const sku: any = skus[Math.floor(Math.random() * skus.length)];
                    const quantity = Math.floor(Math.random() * 2) + 1;
                    
                    // Robust price check
                    let price = 0;
                    if (sku.salePrice && !isNaN(sku.salePrice)) {
                        price = Number(sku.salePrice);
                    } else if (sku.basePrice && !isNaN(sku.basePrice)) {
                        price = Number(sku.basePrice);
                    } else {
                        price = 1000; // Fallback default
                    }

                    const total = price * quantity;

                    orderItems.push({
                        productId: sku.productId ? sku.productId._id : null,
                        skuId: sku._id,
                        name: sku.productId ? (sku.productId as any).name : 'Unknown Product', // basic fallback
                        skuCode: sku.skuCode,
                        quantity,
                        price,
                        total: total || 0
                    });
                    subTotal += total;
                }

                if (orderItems.length === 0) continue;

                // Status Logic (Randomize dates and status)
                const dateOffset = Math.floor(Math.random() * 90); // Past 90 days
                const orderDate = new Date();
                orderDate.setDate(orderDate.getDate() - dateOffset);

                const status = dateOffset > 10 ? 'DELIVERED' : 'PROCESSING';
                const paymentStatus = 'COMPLETED';

                // Check duplicate
                const existingOrder = await orderService.findOne({ orderNumber });
                if (!existingOrder) {
                    await orderService.create({
                        userId: (customer as any)._id,
                        orderNumber,
                        items: orderItems,
                        shippingAddress: {
                            name: address.name,
                            mobile: address.mobile,
                            street: address.street,
                            city: address.city,
                            state: address.state,
                            country: address.country,
                            pincode: address.pincode,
                            landmark: address.landmark
                        },
                        billingAddress: {
                            name: address.name,
                            mobile: address.mobile,
                            street: address.street,
                            city: address.city,
                            state: address.state,
                            country: address.country,
                            pincode: address.pincode,
                            landmark: address.landmark
                        },
                        paymentMethod: 'ONLINE',
                        paymentStatus,
                        orderStatus: status,
                        subTotal,
                        tax: subTotal * 0.18, // 18% GST approx
                        shippingCost: 50,
                        totalAmount: subTotal * 1.18 + 50,
                        createdAt: orderDate,
                        updatedAt: orderDate,
                        timeline: [
                            { status: 'PENDING', timestamp: orderDate, message: 'Order Placed' },
                            { status: 'CONFIRMED', timestamp: orderDate, message: 'Order Confirmed' }
                        ]
                    } as any);
                    orderCount++;
                }
            }
        }
        console.log(`✅ Order seeding completed. Created ${orderCount} orders.`);
    } catch (error) {
        console.error('❌ Error seeding orders:', error);
    }
};
