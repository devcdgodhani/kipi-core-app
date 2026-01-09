import dotenv from 'dotenv';
dotenv.config();
 
import mongoose from 'mongoose';
import { shipmentService } from '../services/concrete/shipmentService';
import { webhookLogService } from '../services/concrete/webhookLogService';
import { logisticsQueues } from '../jobs/queues/logisticsQueues';
import { initWorkers } from '../jobs';
import { JOB_NAMES } from '../jobs/types';
 
const RUN_TEST = async () => {
  try {
    console.log('🚀 Starting Logistics Test Flow...');
 
    // 1. Connect DB
    await mongoose.connect(process.env.MONGO_DB_CONNECTION_URL as string, {
      dbName: process.env.MONGO_DB_NAME,
    });
    console.log('✅ MongoDB Connected');
 
    // 2. Initialize Workers
    initWorkers();
    console.log('✅ Workers Initialized');
 
    // 3. Clear existing queues for clean test
    await logisticsQueues.webhookQueue.drain();
    // await logisticsQueues.trackingQueue.drain();
    console.log('🧹 Queues Drained');
 
    // ==========================================
    // TEST 1: Simulate Webhook Job
    // ==========================================
    console.log('\n🧪 TEST 1: Simulating Webhook Job...');
    
    // We manually add a job to the queue, similar to what the controller would do.
    // We skip the controller validation part for this script and test the Worker directly.
    
    const timestamp = Date.now();
    const TEST_AWB = `TEST-AWB-${timestamp}`;
    const TEST_EVENT_ID = `TEST-EVENT-${timestamp}`;
 
    const mockWebhookPayload = {
      eventId: TEST_EVENT_ID,
      eventType: 'PICKED_UP',
      awb: TEST_AWB,
      timestamp: new Date().toISOString(),
      location: 'Warehouse Mumbai',
      message: 'Shipment picked up',
      shipmentId: '12345',
      status: 'PICKED UP'
    };
 
    // First create a Dummy Courier or find one
    // We need a valid courierId validation usually, but let's see schema
    const dummyShipment = await shipmentService.create({
      orderId: new mongoose.Types.ObjectId() as any, // Fake
      orderNumber: `TEST-ORDER-${timestamp}`,
      shipmentNumber: `SHP-TEST-${timestamp}`,
      awb: TEST_AWB,
      status: 'CREATED',
      courierCode: 'SHIPROCKET',
      courierName: 'BlueDart',
      courierId: new mongoose.Types.ObjectId() as any,
      serviceType: 'Surface',
      weight: 0.5,
      providerShipmentId: '12345',
      providerOrderId: '54321',
      // REQUIRED FIELDS FIX
      shippingCost: 100,
      declaredValue: 500,
      paymentMode: 'PREPAID',
      deliveryAddress: {
        name: 'Test User',
        street: '123 Test St',
        city: 'Mumbai',
        state: 'Maharashtra',
        country: 'India',
        pincode: '400001',
        mobile: '9999999999'
      },
      pickupAddress: {
        name: 'Warehouse',
        street: 'Warehouse St',
        city: 'Delhi',
        state: 'Delhi',
        country: 'India',
        pincode: '110001',
        mobile: '8888888888'
      },
      dimensions: {
        length: 10,
        width: 10,
        height: 10
      }
    } as any);
    console.log(`   Detailed Shipment Created: ${(dummyShipment as any)._id}`);
 
    // Create a WebhookLog entry (as Controller would)
    await webhookLogService.create({
      eventId: mockWebhookPayload.eventId,
      provider: 'SHIPROCKET',
      eventType: mockWebhookPayload.eventType,
      payload: mockWebhookPayload,
      headers: { 'content-type': 'application/json' } as any, // FIXED: Added headers
      status: 'PENDING'
    } as any);
 
    // Add Job
    await logisticsQueues.webhookQueue.add(JOB_NAMES.PROCESS_WEBHOOK, {
      provider: 'SHIPROCKET',
      headers: {},
      body: mockWebhookPayload,
      receivedAt: new Date().toISOString()
    });
    console.log('   📩 Webhook Job Added to Queue');
 
    // Wait for worker to process
    console.log('   ⏳ Waiting for worker...');
    await new Promise(r => setTimeout(r, 5000));
 
    // Verify
    const updatedShipment = await shipmentService.findOne({ awb: TEST_AWB });
    const webhookLog = await webhookLogService.findOne({ eventId: TEST_EVENT_ID });
 
    if ((updatedShipment as any)?.status === 'PICKED_UP' && (webhookLog as any)?.status === 'PROCESSED') {
      console.log('   ✅ TEST 1 PASSED: Shipment Status Updated to PICKED_UP & Log Processed');
    } else {
      console.error('   ❌ TEST 1 FAILED:', {
        shipmentStatus: (updatedShipment as any)?.status,
        logStatus: (webhookLog as any)?.status
      });
    }
 
    // Cleanup
    await shipmentService.delete({ _id: (dummyShipment as any)._id } as any);
    await webhookLogService.delete({ _id: (webhookLog as any)?._id } as any);
    
    console.log('\n✨ Test Run Complete');
    process.exit(0);
 
  } catch (error) {
    console.error('💥 Test Failed:', error);
    process.exit(1);
  }
};
 
RUN_TEST();
