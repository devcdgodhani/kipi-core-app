import dotenv from 'dotenv';
dotenv.config();
 
import mongoose from 'mongoose';
import { rtoScoreService } from '../services/concrete/rtoScoreService';
import { etaService } from '../services/concrete/etaService';
import { orderService } from '../services/concrete/orderService';
import { courierService } from '../services/concrete/courierService';
 
const RUN_TEST = async () => {
  try {
    console.log('🚀 Starting RTO & ETA Engine Test...');
 
    // 1. Connect DB
    await mongoose.connect(process.env.MONGO_DB_CONNECTION_URL as string, {
      dbName: process.env.MONGO_DB_NAME,
    });
    console.log('✅ MongoDB Connected');
 
    // ==========================================
    // TEST 1: RTO Scoring
    // ==========================================
    console.log('\n🧪 TEST 1: RTO Scoring Engine...');
 
    // Create Dummy User & Order
    const userId = new mongoose.Types.ObjectId().toString();
    const orderId = new mongoose.Types.ObjectId().toString();
    const mockPincode = '400001';
 
    // Mock Order Data (we don't save to DB for service test, but service queries DB)
    // Actually service queries DB, so we must insert mock data
    await orderService.create({
      _id: orderId,
      userId: userId,
      orderNumber: `RTO-TEST-${Date.now()}`,
      status: 'PENDING',
      paymentMethod: 'COD',
      totalAmount: 6000,
      subTotal: 5800, // Added subTotal
      isRTO: true,
      items: [],
      shippingAddress: {
         name: 'Test', street: 'Street', city: 'City', state: 'State', country: 'India', pincode: mockPincode, mobile: '1234567890'
      },
      billingAddress: { // Added billingAddress
         name: 'Test', street: 'Street', city: 'City', state: 'State', country: 'India', pincode: mockPincode, mobile: '1234567890'
      }
    } as any);
    
    // Simulate past bad order
    await orderService.create({
      userId: userId,
      orderNumber: `PAST-BAD-${Date.now()}`,
      status: 'CANCELLED',
      paymentMethod: 'COD',
      totalAmount: 4000, // Added totalAmount
      subTotal: 3800, // Added subTotal
      isRTO: true,
      items: [],
      shippingAddress: {
         name: 'Test', street: 'Street', city: 'City', state: 'State', country: 'India', pincode: mockPincode, mobile: '1234567890'
      },
      billingAddress: { // Added billingAddress
         name: 'Test', street: 'Street', city: 'City', state: 'State', country: 'India', pincode: mockPincode, mobile: '1234567890'
      }
    } as any);
 
    console.log('   Data seeded. Calculating score...');
    const riskResult = await rtoScoreService.calculateRiskScore(userId, mockPincode, 6000, 'COD');
    
    console.log('   📊 RTO Result:', JSON.stringify(riskResult, null, 2));
 
    if (riskResult.totalScore > 0) {
       console.log('   ✅ TEST 1 PASSED: Risk Score Calculated');
    } else {
       console.error('   ❌ TEST 1 FAILED: Score is 0 (unexpected for high risk inputs)');
    }
 
    // ==========================================
    // TEST 2: ETA Calculation
    // ==========================================
    console.log('\n🧪 TEST 2: ETA Calculation Engine...');
 
    // Create Dummy Courier
    const courier = await courierService.create({
        name: 'FastExpress',
        code: 'FASTEX',
        type: 'Surface',
        provider: 'SHIPROCKET', // Added missing field
        isActive: true,
        slaMin: 2,
        slaMax: 4
    } as any);
 
    const etaResult = await etaService.calculateETA('400001', (courier as any)._id.toString(), '110001');
    console.log('   ⏱️  ETA Result:', JSON.stringify(etaResult, null, 2));
 
    if (!Array.isArray(etaResult) && etaResult.estimatedDays >= 3) {
        console.log('   ✅ TEST 2 PASSED: ETA Calculated correctly');
    } else {
        console.error('   ❌ TEST 2 FAILED: Invalid ETA result');
    }
 
    // Cleanup
    await orderService.deleteMany({ userId } as any);
    await courierService.delete({ _id: (courier as any)._id } as any);
    
    console.log('\n✨ Test Run Complete');
    process.exit(0);
 
  } catch (error) {
    console.error('💥 Test Failed:', error);
    process.exit(1);
  }
};
 
RUN_TEST();
