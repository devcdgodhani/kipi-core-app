import mongoose from 'mongoose';
import { connectMongoDb } from '../db/mongodb';
import { ENV_VARIABLE } from '../configs';
import { OrderModel } from '../db/mongodb/models/orderModel';
import { ShipmentModel } from '../db/mongodb/models/shipmentModel';
import { NDRModel } from '../db/mongodb/models/ndrModel';
import { ORDER_STATUS } from '../constants';

async function runAudit() {
    console.log('🔍 Starting Logistics Consistency Audit...');

    try {
        await connectMongoDb({
            connectionUrl: ENV_VARIABLE.MONGO_DB_CONNECTION_URL as string,
            dbName: ENV_VARIABLE.MONGO_DB_NAME as string,
        });

        // 1. Check for CONFIRMED orders without shipments
        console.log('--- Checking for Confirmed Orders without Shipments ---');
        const orphanOrders = await OrderModel.find({
            orderStatus: { $in: ['CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED'] },
            shipmentId: { $exists: false }
        });
        
        if (orphanOrders.length > 0) {
            console.warn(`⚠️ Found ${orphanOrders.length} orders in advanced states without shipment records.`);
            orphanOrders.forEach(o => console.warn(`   Order: ${o.orderNumber} Status: ${o.orderStatus}`));
        } else {
            console.log('✅ No orphan confirmed orders found.');
        }

        // 2. Check for Shipments without corresponding Orders
        console.log('--- Checking for Orphan Shipments ---');
        const shipments = await ShipmentModel.find().lean();
        let shipmentOrphans = 0;
        for (const shipment of shipments) {
            const order = await OrderModel.findById(shipment.orderId);
            if (!order) {
                shipmentOrphans++;
                console.warn(`⚠️ Shipment ID ${shipment._id} has no corresponding order.`);
            }
        }
        if (shipmentOrphans === 0) {
            console.log('✅ No orphan shipments found.');
        }

        // 3. Check for NDRs without Shipments
        console.log('--- Checking for Orphan NDRs ---');
        const ndrs = await NDRModel.find().lean();
        let ndrOrphans = 0;
        for (const ndr of ndrs) {
            const shipment = await ShipmentModel.findById(ndr.shipmentId);
            if (!shipment) {
                ndrOrphans++;
                console.warn(`⚠️ NDR ID ${ndr._id} has no corresponding shipment.`);
            }
        }
        if (ndrOrphans === 0) {
            console.log('✅ No orphan NDRs found.');
        }

        console.log('🏁 Consistency Audit Finished');

    } catch (error) {
        console.error('❌ Audit FAILED');
        console.error(error);
        process.exit(1);
    } finally {
        await mongoose.disconnect();
    }
}

runAudit();
