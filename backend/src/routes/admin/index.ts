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


export default router;
