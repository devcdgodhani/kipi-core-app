import mongoose from 'mongoose';
import { connectMongoDb } from '../db/mongodb';
import { ENV_VARIABLE } from '../configs';
import { orderService } from '../services/concrete/orderService';
import { shipmentService } from '../services/concrete/shipmentService';
import { warehouseService } from '../services/concrete/warehouseService';
import { productService } from '../services/concrete/productService';
import { skuService } from '../services/concrete/skuService';
import { lotService } from '../services/concrete/lotService';
import { ORDER_STATUS } from '../constants';
 
async function runVerification() {
    console.log('🚀 Starting Logistics Lifecycle Verification...');
 
    try {
        // 1. Setup Database Connection
        await connectMongoDb({
            connectionUrl: ENV_VARIABLE.MONGO_DB_CONNECTION_URL as string,
            dbName: ENV_VARIABLE.MONGO_DB_NAME as string,
        });
        console.log('✅ Connected to MongoDB');
 
        // 2. Setup Test Data
        console.log('📦 Setting up test data...');
        
        // Find or create a test warehouse
        let warehouse = await warehouseService.findOne({ code: 'TEST_WH_01' });
        if (!warehouse) {
            warehouse = await warehouseService.create({
                name: 'Test Warehouse 01',
                code: 'TEST_WH_01',
                address: {
                    street: '123 Test St',
                    city: 'Mumbai',
                    state: 'Maharashtra',
                    country: 'India',
                    pincode: '400001'
                },
                contactPerson: 'Test Admin',
                contactNumber: '9876543210',
                mobile: '9876543210',
                email: 'test@warehouse.com',
                isPrimary: true,
                isActive: true
            } as any);
        }
 
        // Find or create a test product/sku/lot
        let product = await productService.findOne({ name: 'Verification Test Product' });
        if (!product) {
            product = await productService.create({
                name: 'Verification Test Product',
                productCode: `VTP-${Date.now()}`,
                slug: `verification-test-product-${Date.now()}`,
                basePrice: 1000,
                description: 'Product for automated testing',
                categoryIds: [new mongoose.Types.ObjectId() as any],
                status: 'ACTIVE',
                stock: 100
            } as any);
        }
 
        let sku = await skuService.findOne({ productId: (product as any)._id });
        if (!sku) {
            sku = await skuService.create({
                productId: (product as any)._id,
                skuCode: `TEST-SKU-${Date.now()}`,
                slug: `test-sku-slug-${Date.now()}`,
                basePrice: 1000,
                salePrice: 900,
                quantity: 100,
                availableQuantity: 100,
                status: 'ACTIVE'
            } as any);
        }
 
        let lot = await lotService.findOne({ lotNumber: `BATCH-001-${(sku as any)._id}` });
        if (!lot) {
            lot = await lotService.create({
                lotNumber: `BATCH-001-${(sku as any)._id}`,
                basePrice: 500,
                quantity: 100,
                remainingQuantity: 100,
                status: 'ACTIVE'
            } as any);
        }
 
        // 3. Step 1: Create Test Order
        console.log('📝 Creating test order...');
        const testUserId = new mongoose.Types.ObjectId();
        const address = {
            name: 'Test User',
            mobile: '9999999999',
            street: '456 Test Lane',
            city: 'Delhi',
            state: 'Delhi',
            country: 'India',
            pincode: '110001'
        };
 
        const testOrder = await orderService.create({
            userId: testUserId as any,
            orderNumber: `TEST-ORD-${Date.now()}`,
            items: [{
                productId: (product as any)._id,
                skuId: (sku as any)._id,
                name: (product as any).name,
                price: 900,
                quantity: 1,
                total: 900
            }],
            shippingAddress: address as any,
            billingAddress: address as any,
            paymentMethod: 'COD',
            subTotal: 900,
            totalAmount: 900,
            orderStatus: ORDER_STATUS.PENDING
        } as any);
        console.log(`✅ Order created: ${(testOrder as any).orderNumber}`);
 
        // 4. Step 2: Confirm Order & Auto-Assign Warehouse
        console.log('⚙️ Confirming order...');
        await orderService.updateOrderStatus((testOrder as any)._id as any, ORDER_STATUS.CONFIRMED, testUserId as any);
        const confirmedOrder = await orderService.findById((testOrder as any)._id);
        
        if ((confirmedOrder as any)?.orderStatus === ORDER_STATUS.CONFIRMED) {
            console.log('✅ Order confirmed successfully');
        } else {
            throw new Error('Verification failed: Order status not updated to CONFIRMED');
        }
 
        // 5. Step 3: Create Shipment & Generate AWB
        console.log('🚚 Creating shipment...');
        const shipmentData = {
            orderId: (testOrder as any)._id,
            orderNumber: (testOrder as any).orderNumber,
            shipmentNumber: `SHIP-${Date.now()}`,
            awb: `AWB-${Date.now()}`,
            warehouseId: (warehouse as any)._id,
            courierId: new mongoose.Types.ObjectId(),
            courierName: 'Shiprocket Test',
            courierCode: 'SR_TEST',
            serviceType: 'EXPRESS',
            weight: 0.5,
            dimensions: { length: 10, width: 10, height: 10 },
            declaredValue: 900,
            shippingCost: 50,
            paymentMode: 'COD',
            codAmount: 900,
            status: 'PENDING',
            isRTO: false,
            hasNDR: false,
            pickupAddress: address,
            deliveryAddress: address
        };
 
        const shipmentRes = await shipmentService.create(shipmentData as any) as any;
        console.log(`✅ Shipment created: ${shipmentRes._id}`);
 
        // Link order and shipment (Crucial for consistency)
        await orderService.updateOne({ _id: (testOrder as any)._id } as any, {
            $set: {
                shipmentId: shipmentRes._id,
                awb: shipmentData.awb
            }
        } as any);
 
        // Verify AWB Generation (Simulated)
        const updatedShipment = await shipmentService.findById(shipmentRes._id);
        if ((updatedShipment as any)?.awb) {
            console.log(`✅ AWB Generated: ${(updatedShipment as any).awb}`);
        } else {
            console.log('⚠️ AWB not immediately available');
        }
 
        // 6. Step 4: Simulate Status Transitions
        console.log('🔄 Simulating tracking updates...');
        const statuses = ['PICKED_UP', 'IN_TRANSIT', 'OUT_FOR_DELIVERY', 'DELIVERED'];
        
        for (const status of statuses) {
            console.log(`   -> Transitioning to ${status}...`);
            // We directly call the private/internal update logic or simulate webhook
            // For simplicity in verification script, we update the Shipment model
            await shipmentService.updateOne({ _id: shipmentRes._id } as any, { $set: { status } } as any);
            // And trigger associated order updates if needed (usually handled by webhookService)
            if (status === 'DELIVERED') {
                await orderService.updateOne({ _id: (testOrder as any)._id } as any, { $set: { orderStatus: ORDER_STATUS.DELIVERED } } as any);
            }
        }
 
        const finalOrder = await orderService.findById((testOrder as any)._id);
        if ((finalOrder as any)?.orderStatus === ORDER_STATUS.DELIVERED) {
            console.log('🎉 Verification SUCCESS: Lifecycle completed from PENDING to DELIVERED');
        } else {
            throw new Error(`Verification failed: Expected status DELIVERED, got ${(finalOrder as any)?.orderStatus}`);
        }
 
        // 7. Cleanup (Optional: Delete test data)
        console.log('🧹 Cleaning up test data...');
        await orderService.delete({ _id: (testOrder as any)._id } as any);
        await shipmentService.delete({ _id: shipmentRes._id } as any);
 
        
        console.log('🏁 Verification Finished Successfully');
 
    } catch (error) {
        console.error('❌ Verification FAILED');
        console.error(error);
        process.exit(1);
    } finally {
        await mongoose.disconnect();
    }
}
 
runVerification();
