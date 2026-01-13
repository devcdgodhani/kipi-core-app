import { RTOModel } from '../models/rtoModel';
import { ShipmentModel } from '../models/shipmentModel';

export const seedRTOs = async () => {
    console.log('🌱 Seeding RTOs...');
    try {
        const rtoShipments = await ShipmentModel.find({ isRTO: true });

        if (rtoShipments.length === 0) {
            console.warn('⚠️ No RTO Shipments found. Skipping RTO seeding.');
            return;
        }

        let rtoCount = 0;

        for (const shipment of rtoShipments) {
            const existing = await RTOModel.findOne({ shipmentId: shipment._id });
            if (existing) continue;

            const reasons = ['Customer Not Available', 'Address Incomplete', 'Customer Refused', 'Door Locked'];
            const reason = reasons[Math.floor(Math.random() * reasons.length)];

            const initiatedDate = shipment.updatedAt ? new Date(shipment.updatedAt) : new Date();
            const deliveredDate = new Date(initiatedDate);
            deliveredDate.setDate(deliveredDate.getDate() + Math.floor(Math.random() * 5) + 2); // 2-7 days for RTO return

            await RTOModel.create({
                shipmentId: shipment._id,
                orderId: shipment.orderId,
                awb: shipment.awb,
                rtoInitiatedDate: initiatedDate,
                rtoDeliveredDate: deliveredDate,
                rtoReason: reason,
                rtoReasonText: `Courier marked as ${reason}`,
                status: 'DELIVERED', // RTO Delivered back to warehouse
                rtoCost: 50,
                codRecovery: 0,
                qcStatus: 'PENDING',
                restockStatus: 'PENDING',
                disposition: 'RESTOCK',
                createdAt: initiatedDate
            });

            rtoCount++;
        }

        console.log(`✅ RTO seeding completed. Created ${rtoCount} RTO records.`);
    } catch (error) {
        console.error('❌ Error seeding RTOs:', error);
    }
};
