import { Router } from 'express';

const router = Router();

import authRoute from '../common/authRoute';
import userRoutes from './userRoutes';
import whatsAppRoutes from './whatsAppRoutes';
import lotRoutes from './lotRoutes';
import categoryRoutes from './categoryRoutes';
import { jwtAuth } from '../../middlewares';

router.use('/auth', authRoute);
router.use('/user',jwtAuth(), userRoutes);
router.use('/whatsapp',jwtAuth(), whatsAppRoutes);
router.use('/lot', jwtAuth(), lotRoutes);
router.use('/category', jwtAuth(), categoryRoutes);

export default router;
