import { Router } from 'express';
import authRoute from '../common/authRoute';
import productRoutes from './productRoutes';
import categoryRoutes from './categoryRoutes';
import cartRoutes from './cartRoutes';
import wishlistRoutes from './wishlistRoutes';
import reviewRoutes from './reviewRoutes';
import addressRoutes from './addressRoutes';
import couponRoutes from './couponRoutes';
import skuRoutes from './skuRoutes';
import orderRoutes from './orderRoutes';
import loyaltyRoutes from './loyaltyRoutes';
import returnRoutes from './returnRoutes';
import attributeRoutes from './attributeRoutes';
import etaRoutes from './etaRoutes';
import paymentRoutes from './paymentRoutes';
import paymentRefundRoutes from './paymentRefundRoutes';
import paymentGatewayRoutes from './paymentGatewayRoutes';
import bannerRoutes from './bannerRoutes';
import notificationRoutes from './notificationRoutes';
import flashDealRoutes from './flashDealRoutes';
import searchQueryRoutes from './searchQueryRoutes';
import recentlyViewedRoutes from './recentlyViewedRoutes';
import pushNotificationRoutes from './pushNotificationRoutes';


const router = Router();

router.use('/auth', authRoute);
router.use('/product', productRoutes);
router.use('/category', categoryRoutes);
router.use('/cart', cartRoutes);
router.use('/wishlist', wishlistRoutes);
router.use('/review', reviewRoutes);
router.use('/address', addressRoutes);
router.use('/coupon', couponRoutes);
router.use('/sku', skuRoutes);
router.use('/order', orderRoutes);
router.use('/loyalty', loyaltyRoutes);
router.use('/return', returnRoutes);
router.use('/attribute', attributeRoutes);
router.use('/eta', etaRoutes);
router.use('/payment', paymentRoutes);
router.use('/refund', paymentRefundRoutes);
router.use('/payment-gateways', paymentGatewayRoutes);
router.use('/banner', bannerRoutes);
router.use('/notification', notificationRoutes);
router.use('/flash-deal', flashDealRoutes);
router.use('/search', searchQueryRoutes);
router.use('/recently-viewed', recentlyViewedRoutes);
router.use('/push-notification', pushNotificationRoutes);



export default router;
