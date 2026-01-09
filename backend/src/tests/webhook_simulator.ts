import mongoose from 'mongoose';
import { connectMongoDb } from '../db/mongodb';
import { ENV_VARIABLE } from '../configs';
import { webhookService } from '../services/concrete/webhookService';
import { shipmentService } from '../services/concrete/shipmentService';
import { ndrService } from '../services/concrete/ndrService';
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
        const shipment = await shipmentService.findOne({}, { sort: { createdAt: -1 } });
        if (!shipment) {
            console.error('❌ No shipments found. Run logistics_lifecycle_verification.ts first to seed data.');
            process.exit(1);
        }
        console.log(`📦 Using Shipment AWB: ${(shipment as any).awb}`);
 
        // 3. Define Mock Normalized Events
        const mockNdrEvent = {
            eventId: `SIM-NDR-${Date.now()}`,
            eventType: 'NDR',
            shipmentId: (shipment as any).providerShipmentId, // Correct field
            awb: (shipment as any).awb,
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
            shipmentId: (shipment as any).providerShipmentId, // Correct field
            awb: (shipment as any).awb,
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
        
        const ndrRecord = await ndrService.findOne({ awb: (shipment as any).awb }, { sort: { createdAt: -1 } });
        if (ndrRecord) {
            console.log('✅ NDR Record successfully created in database');
            console.log(`   Reason: ${(ndrRecord as any).ndrReasonText}`);
        } else {
            throw new Error('Simulation failed: NDR record not found');
        }
 
        // 5. Simulate RTO Processing
        console.log('↩️ Simulating RTO Event...');
        await webhookService.processEvent(mockRtoEvent);
        
        const updatedShipment = await shipmentService.findOne({ awb: (shipment as any).awb });
        if ((updatedShipment as any)?.isRTO && (updatedShipment as any).status === SHIPMENT_STATUS.RTO_INITIATED) {
            console.log('✅ Shipment status successfully updated to RTO_INITIATED');
            console.log(`   RTO Reason: ${(updatedShipment as any).rtoReason}`);
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
