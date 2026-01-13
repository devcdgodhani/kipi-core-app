import { shipmentService } from '../../../services/concrete/shipmentService';
import { orderService } from '../../../services/concrete/orderService';
import { courierService } from '../../../services/concrete/courierService';
import { ORDER_STATUS } from '../../../constants';

export const seedShipments = async () => {
    console.log('🌱 Seeding shipments for benchmarking...');
    try {
        const orders = await orderService.findAll({ 
            orderStatus: { $in: [ORDER_STATUS.DELIVERED, ORDER_STATUS.SHIPPED, ORDER_STATUS.PROCESSING] } 
        });
        const couriers = await courierService.findAll({ isActive: true });

        if (orders.length === 0 || couriers.length === 0) {
            console.warn('⚠️ No Orders or active Couriers found. Skipping shipment seeding.');
            return;
        }

        let shipmentCount = 0;

        for (const order of orders) {
            // Check if shipment already exists
            const existing = await shipmentService.findOne({ orderId: (order as any)._id });
            if (existing) continue;

            const courier = couriers[Math.floor(Math.random() * couriers.length)];
            const baseDate = order.createdAt ? new Date(order.createdAt) : new Date();
            const shipmentDate = new Date(baseDate);
            shipmentDate.setHours(shipmentDate.getHours() + Math.floor(Math.random() * 24)); // Ship within 24h

            const pickupCompletedDate = new Date(shipmentDate);
            pickupCompletedDate.setHours(pickupCompletedDate.getHours() + 4);

            const estimatedDeliveryDate = new Date(pickupCompletedDate);
            estimatedDeliveryDate.setDate(estimatedDeliveryDate.getDate() + 4); // 4 days SLA

            const actualDeliveryDate = new Date(pickupCompletedDate);
            const deliveryDays = Math.floor(Math.random() * 5) + 2; // 2-6 days
            actualDeliveryDate.setDate(actualDeliveryDate.getDate() + deliveryDays);

            const isDelivered = (order as any).orderStatus === 'DELIVERED';
            const isRTO = Math.random() < 0.1; // 10% RTO rate
            const hasNDR = Math.random() < 0.2; // 20% NDR rate

            await shipmentService.create({
                orderId: (order as any)._id,
                orderNumber: (order as any).orderNumber,
                shipmentNumber: `SHP-${Date.now()}-${Math.floor(Math.random() * 10000)}`,
                awb: `AWB${Math.floor(Math.random() * 1000000000)}`,
                courierId: (courier as any)._id,
                courierName: courier.name,
                courierCode: courier.code,
                serviceType: courier.serviceTypes[0].type,
                weight: 0.5,
                dimensions: { length: 10, width: 10, height: 10 },
                pickupAddress: (order as any).shippingAddress,
                deliveryAddress: (order as any).shippingAddress,
                paymentMode: order.paymentMethod === 'COD' ? 'COD' : 'PREPAID',
                declaredValue: order.totalAmount,
                shippingCost: 50,
                status: isDelivered ? 'DELIVERED' : (order as any).orderStatus,
                pickupScheduledDate: shipmentDate,
                pickupCompletedDate,
                estimatedDeliveryDate,
                actualDeliveryDate: isDelivered ? actualDeliveryDate : undefined,
                isRTO,
                hasNDR,
                rtoReason: isRTO ? 'Customer not available' : undefined,
                createdAt: shipmentDate
            } as any);

            shipmentCount++;
        }

        console.log(`✅ Shipment seeding completed. Created ${shipmentCount} shipments.`);
    } catch (error) {
        console.error('❌ Error seeding shipments:', error);
    }
};
