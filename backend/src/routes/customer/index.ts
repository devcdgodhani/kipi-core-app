import { Router } from 'express';

const router = Router();

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


export default router;
