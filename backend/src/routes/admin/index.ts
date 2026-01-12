import { Router } from 'express';
import authRoute from '../common/authRoute';
import userRoutes from './userRoutes';

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
// loyaltyRoutes removed
import walletRoutes from './walletRoutes';
import walletTransactionRoutes from './walletTransactionRoutes';
import walletRuleRoutes from './walletRuleRoutes';
import { analyticsRoutes } from './analyticsRoutes';
import couponRoutes from './couponRoutes';
import courierRoutes from './courierRoutes';
import warehouseRoutes from './warehouseRoutes';
import cronJobRoutes from './cronJobRoutes';
import ndrRoutes from './ndrRoutes';
import { jwtAuth } from '../../middlewares';
import paymentRoutes from './paymentAdminRoutes';

import whatsAppAccountRoutes from './whatsAppAccountRoutes';
import whatsAppContactRoutes from './whatsAppContactRoutes';
import whatsAppMessageRoutes from './whatsAppMessageRoutes';
import whatsAppRiskRoutes from './whatsAppRiskRoutes';
import whatsAppSystemRoutes from './whatsAppSystemRoutes';
import bullBoardRoutes from './bullBoardRoutes';
import bannerRoutes from './bannerRoutes';
import notificationRoutes from './notificationRoutes';
import flashDealRoutes from './flashDealRoutes';
import searchQueryRoutes from './searchQueryRoutes';

const router = Router();

router.use('/auth', authRoute);
router.use('/user',jwtAuth(), userRoutes);
router.use('/whatsapp/accounts', jwtAuth(), whatsAppAccountRoutes);
router.use('/whatsapp/contacts', jwtAuth(), whatsAppContactRoutes);
router.use('/whatsapp/messages', jwtAuth(), whatsAppMessageRoutes);
router.use('/whatsapp/risk', jwtAuth(), whatsAppRiskRoutes);
router.use('/whatsapp/system', jwtAuth(), whatsAppSystemRoutes);
router.use('/queues-dashboard', (req, res, next) => {
    if (req.query.token) {
        res.cookie('admin_token', req.query.token as string, {
            path: '/',
            httpOnly: true,
            maxAge: 3600000 * 24 // 24 hours
        });
    }
    next();
}, jwtAuth(), bullBoardRoutes);

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
// loyaltyRoutes removed
router.use('/wallet', jwtAuth(), walletRoutes);
router.use('/wallet-transaction', jwtAuth(), walletTransactionRoutes);
router.use('/wallet-rule', jwtAuth(), walletRuleRoutes);
router.use('/shipment', jwtAuth(), shipmentRoutes); // Mount Shipment Routes
router.use('/rto', rtoScoreRoutes); // NEW: RTO Routes
router.use('/eta', etaRoutes); // NEW: ETA Routes
router.use('/courier', jwtAuth(), courierRoutes); // NEW: Courier Routes
router.use('/warehouse', jwtAuth(), warehouseRoutes);
router.use('/ndr', jwtAuth(), ndrRoutes);
router.use('/cron-job', jwtAuth(), cronJobRoutes); // Cron Job Management
router.use('/analytics', jwtAuth(), analyticsRoutes);
router.use('/banner', jwtAuth(), bannerRoutes);
router.use('/notification', jwtAuth(), notificationRoutes);
router.use('/flash-deal', jwtAuth(), flashDealRoutes);
router.use('/search-query', jwtAuth(), searchQueryRoutes);

router.use('/', paymentRoutes);

export default router;
