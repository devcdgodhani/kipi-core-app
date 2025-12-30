import { Router } from 'express';

const router = Router();

import adminRoutes from './admin';
import customerRoutes from './customer'

router.use('/admin', adminRoutes);

router.use('/customer', customerRoutes);

export default router;
