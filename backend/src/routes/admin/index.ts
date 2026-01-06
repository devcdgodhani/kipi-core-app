import { Router } from 'express';

const router = Router();

import authRoute from '../common/authRoute';
import userRoutes from './userRoutes';
import whatsAppRoutes from './whatsAppRoutes';
import lotRoutes from './lotRoutes';
import categoryRoutes from './categoryRoutes';
import attributeRoutes from './attributeRoutes';
import productRoutes from './productRoutes';
import skuRoutes from './skuRoutes';
import fileStorageRoutes from './fileStorageRoutes';
import cartRoutes from './cartRoutes';
import wishlistRoutes from './wishlistRoutes';
import reviewRoutes from './reviewRoutes';
import addressRoutes from './addressRoutes';
import shipmentRoutes from './shipmentRoutes';
import rtoScoreRoutes from './rtoScoreRoutes';
import etaRoutes from './etaRoutes';
import orderRoutes from './orderRoutes';
import returnRoutes from './returnRoutes';
import exchangeRoutes from './exchangeRoutes';
import stockLedgerRoutes from './stockLedgerRoutes';
import loyaltyRoutes from './loyaltyRoutes';
import { analyticsRoutes } from './analyticsRoutes';
import couponRoutes from './couponRoutes';
import courierRoutes from './courierRoutes'; // NEW: Courier Routes
import warehouseRoutes from './warehouseRoutes';
import cronJobRoutes from './cronJobRoutes';
import ndrRoutes from './ndrRoutes';

import { jwtAuth } from '../../middlewares';

router.use('/auth', authRoute);
router.use('/user',jwtAuth(), userRoutes);
router.use('/whatsapp',jwtAuth(), whatsAppRoutes);
router.use('/lot', jwtAuth(), lotRoutes);
router.use('/category', jwtAuth(), categoryRoutes);
router.use('/attribute', jwtAuth(), attributeRoutes);
router.use('/product', jwtAuth(), productRoutes);
router.use('/sku', jwtAuth(), skuRoutes);
router.use('/file-storage', jwtAuth(), fileStorageRoutes);
router.use('/cart', jwtAuth(), cartRoutes);
router.use('/wishlist', jwtAuth(), wishlistRoutes);
router.use('/review', jwtAuth(), reviewRoutes);
router.use('/address', jwtAuth(), addressRoutes);
router.use('/coupon', jwtAuth(), couponRoutes);
router.use('/order', jwtAuth(), orderRoutes);
router.use('/return', jwtAuth(), returnRoutes);
router.use('/exchange', jwtAuth(), exchangeRoutes);
router.use('/stock-ledger', jwtAuth(), stockLedgerRoutes);
router.use('/loyalty', jwtAuth(), loyaltyRoutes);
router.use('/shipment', jwtAuth(), shipmentRoutes); // Mount Shipment Routes
router.use('/rto', rtoScoreRoutes); // NEW: RTO Routes
router.use('/eta', etaRoutes); // NEW: ETA Routes
router.use('/courier', jwtAuth(), courierRoutes); // NEW: Courier Routes
router.use('/warehouse', jwtAuth(), warehouseRoutes);
router.use('/ndr', jwtAuth(), ndrRoutes);
router.use('/cron-job', jwtAuth(), cronJobRoutes); // Cron Job Management
router.use('/analytics', jwtAuth(), analyticsRoutes);


export default router;
