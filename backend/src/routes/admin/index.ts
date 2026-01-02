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
import couponRoutes from './couponRoutes';
import orderRoutes from './orderRoutes';
import returnRoutes from './returnRoutes';

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


export default router;
