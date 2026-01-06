import mongoose from 'mongoose';
import { connectMongoDb } from '../db/mongodb';
import { ENV_VARIABLE } from '../configs';
import { webhookService } from '../services/concrete/webhookService';
import { ShipmentModel } from '../db/mongodb/models/shipmentModel';
import { OrderModel } from '../db/mongodb/models/orderModel';
import { NDRModel } from '../db/mongodb/models/ndrModel';
import { SHIPMENT_STATUS } from '../constants/shipment';

async function runSimulation() {
    console.log('📡 Starting Webhook Simulation...');

    try {
        // 1. Setup Database Connection
        await connectMongoDb({
            connectionUrl: ENV_VARIABLE.MONGO_DB_CONNECTION_URL as string,
            dbName: ENV_VARIABLE.MONGO_DB_NAME as string,
        });
        console.log('✅ Connected to MongoDB');

        // 2. Find a shipment to test with
        console.log('🔍 Looking for a testable shipment...');
        const shipment = await ShipmentModel.findOne().sort({ createdAt: -1 });
        if (!shipment) {
            console.error('❌ No shipments found. Run logistics_lifecycle_verification.ts first to seed data.');
            process.exit(1);
        }
        console.log(`📦 Using Shipment AWB: ${shipment.awb}`);

        // 3. Define Mock Normalized Events
        const mockNdrEvent = {
            eventId: `SIM-NDR-${Date.now()}`,
            eventType: 'NDR',
            shipmentId: shipment.providerShipmentId, // Correct field
            awb: shipment.awb,
            status: 'NDR - Customer Refused',
            statusCode: '17',
            timestamp: new Date(),
            location: 'Mumbai Hub',
            message: 'Customer refused to accept the package',
            provider: 'SHIPROCKET',
            rawPayload: { simulated: true }
        };

        const mockRtoEvent = {
            eventId: `SIM-RTO-${Date.now()}`,
            eventType: 'RTO',
            shipmentId: shipment.providerShipmentId, // Correct field
            awb: shipment.awb,
            status: 'RTO Initiated',
            statusCode: '11',
            timestamp: new Date(),
            location: 'Origin Warehouse',
            message: 'RTO initiated due to multiple delivery failures',
            provider: 'SHIPROCKET',
            rawPayload: { simulated: true }
        };

        // 4. Simulate NDR Processing
        console.log('🚨 Simulating NDR Event...');
        await webhookService.processEvent(mockNdrEvent);
        
        const ndrRecord = await NDRModel.findOne({ awb: shipment.awb }).sort({ createdAt: -1 });
        if (ndrRecord) {
            console.log('✅ NDR Record successfully created in database');
            console.log(`   Reason: ${ndrRecord.ndrReasonText}`);
        } else {
            throw new Error('Simulation failed: NDR record not found');
        }

        // 5. Simulate RTO Processing
        console.log('↩️ Simulating RTO Event...');
        await webhookService.processEvent(mockRtoEvent);
        
        const updatedShipment = await ShipmentModel.findOne({ awb: shipment.awb });
        if (updatedShipment?.isRTO && updatedShipment.status === SHIPMENT_STATUS.RTO_INITIATED) {
            console.log('✅ Shipment status successfully updated to RTO_INITIATED');
            console.log(`   RTO Reason: ${updatedShipment.rtoReason}`);
        } else {
            throw new Error('Simulation failed: Shipment RTO status not updated');
        }

        console.log('🏁 Webhook Simulation Finished Successfully');

    } catch (error) {
        console.error('❌ Simulation FAILED');
        console.error(error);
        process.exit(1);
    } finally {
        await mongoose.disconnect();
    }
}

runSimulation();
