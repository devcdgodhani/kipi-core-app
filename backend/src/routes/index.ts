import { Router } from 'express';
import adminRoutes from './admin';
import customerRoutes from './customer';
import webhookRoutes from './webhookRoutes';

const router = Router();

router.use('/admin', adminRoutes);

router.use('/customer', customerRoutes);

router.use('/webhooks', webhookRoutes);

// Webhook Routes
// router.use('/webhooks', webhookRoutes); // Handled above

export default router;
