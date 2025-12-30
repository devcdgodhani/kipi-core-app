import { Router } from 'express';

const router = Router();

import authRoute from '../common/authRoute';
import userRoutes from './userRoutes';
import whatsAppRoutes from './whatsAppRoutes';
import { jwtAuth } from '../../middlewares';

router.use('/auth', authRoute);
router.use('/user',jwtAuth(), userRoutes);
router.use('/whatsapp',jwtAuth(), whatsAppRoutes);

export default router;
