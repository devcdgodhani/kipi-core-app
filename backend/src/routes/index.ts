import { Router } from 'express';

const router = Router();

import adminRoutes from './admin';
import customerRoutes from './customer';
import webhookRoutes from './webhookRoutes';

router.use('/admin', adminRoutes);

router.use('/customer', customerRoutes);

router.use('/webhooks', webhookRoutes);

// Webhook Routes
// router.use('/webhooks', webhookRoutes); // Handled above

export default router;
