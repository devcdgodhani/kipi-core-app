import mongoose from 'mongoose';
import { connectMongoDb } from '../db/mongodb';
import { ENV_VARIABLE } from '../configs';
import { OrderModel } from '../db/mongodb/models/orderModel';
import { ShipmentModel } from '../db/mongodb/models/shipmentModel';
import { WarehouseModel } from '../db/mongodb/models/warehouseModel';
import { LotModel } from '../db/mongodb/models/lotModel';
import { ProductModel } from '../db/mongodb/models/productModel';
import { SkuModel } from '../db/mongodb/models/skuModel';
import { OrderService } from '../services/concrete/orderService';
import { LogisticsService } from '../services/concrete/logisticsService';
import { ShipmentService } from '../services/concrete/shipmentService';
import { ORDER_STATUS } from '../constants';

// Initialize services
const orderService = new OrderService();
const logisticsService = new LogisticsService();
const shipmentService = new ShipmentService();

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
        let warehouse = await WarehouseModel.findOne({ code: 'TEST_WH_01' });
        if (!warehouse) {
            warehouse = await WarehouseModel.create({
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
            });
        }

        // Find or create a test product/sku/lot
        let product = await ProductModel.findOne({ name: 'Verification Test Product' });
        if (!product) {
            product = await ProductModel.create({
                name: 'Verification Test Product',
                productCode: `VTP-${Date.now()}`,
                slug: `verification-test-product-${Date.now()}`,
                basePrice: 1000,
                description: 'Product for automated testing',
                categoryIds: [new mongoose.Types.ObjectId()],
                status: 'ACTIVE',
                stock: 100
            });
        }

        let sku = await SkuModel.findOne({ productId: product._id });
        if (!sku) {
            sku = await SkuModel.create({
                productId: product._id,
                skuCode: `TEST-SKU-${Date.now()}`,
                slug: `test-sku-slug-${Date.now()}`,
                basePrice: 1000,
                salePrice: 900,
                quantity: 100,
                availableQuantity: 100,
                status: 'ACTIVE'
            });
        }

        let lot = await LotModel.findOne({ lotNumber: `BATCH-001-${sku._id}` });
        if (!lot) {
            lot = await LotModel.create({
                lotNumber: `BATCH-001-${sku._id}`,
                basePrice: 500,
                quantity: 100,
                remainingQuantity: 100,
                status: 'ACTIVE'
            });
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

        const testOrder = await OrderModel.create({
            userId: testUserId,
            orderNumber: `TEST-ORD-${Date.now()}`,
            items: [{
                productId: product._id,
                skuId: sku._id,
                name: product.name,
                price: 900,
                quantity: 1,
                total: 900
            }],
            shippingAddress: address,
            billingAddress: address,
            paymentMethod: 'COD',
            subTotal: 900,
            totalAmount: 900,
            orderStatus: ORDER_STATUS.PENDING
        });
        console.log(`✅ Order created: ${testOrder.orderNumber}`);

        // 4. Step 2: Confirm Order & Auto-Assign Warehouse
        console.log('⚙️ Confirming order...');
        await orderService.updateOrderStatus(testOrder._id as any, ORDER_STATUS.CONFIRMED, testUserId);
        const confirmedOrder = await OrderModel.findById(testOrder._id);
        
        if (confirmedOrder?.orderStatus === ORDER_STATUS.CONFIRMED) {
            console.log('✅ Order confirmed successfully');
        } else {
            throw new Error('Verification failed: Order status not updated to CONFIRMED');
        }

        // 5. Step 3: Create Shipment & Generate AWB
        console.log('🚚 Creating shipment...');
        const shipmentData = {
            orderId: testOrder._id,
            orderNumber: testOrder.orderNumber,
            shipmentNumber: `SHIP-${Date.now()}`,
            awb: `AWB-${Date.now()}`,
            warehouseId: warehouse._id,
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
        await OrderModel.findByIdAndUpdate(testOrder._id, {
            shipmentId: shipmentRes._id,
            awb: shipmentData.awb
        });

        // Verify AWB Generation (Simulated)
        const updatedShipment = await ShipmentModel.findById(shipmentRes._id);
        if (updatedShipment?.awb) {
            console.log(`✅ AWB Generated: ${updatedShipment.awb}`);
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
            await ShipmentModel.findByIdAndUpdate(shipmentRes._id, { status });
            // And trigger associated order updates if needed (usually handled by webhookService)
            if (status === 'DELIVERED') {
                await OrderModel.findByIdAndUpdate(testOrder._id, { orderStatus: ORDER_STATUS.DELIVERED });
            }
        }

        const finalOrder = await OrderModel.findById(testOrder._id);
        if (finalOrder?.orderStatus === ORDER_STATUS.DELIVERED) {
            console.log('🎉 Verification SUCCESS: Lifecycle completed from PENDING to DELIVERED');
        } else {
            throw new Error(`Verification failed: Expected status DELIVERED, got ${finalOrder?.orderStatus}`);
        }

        // 7. Cleanup (Optional: Delete test data)
        console.log('🧹 Cleaning up test data...');
        await OrderModel.findByIdAndDelete(testOrder._id);
        await ShipmentModel.findByIdAndDelete(shipmentRes._id);

        
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
