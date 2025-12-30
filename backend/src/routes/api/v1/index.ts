import { Router } from 'express';
import swaggerUi from 'swagger-ui-express';
import swaggerSpec from '../../../configs/swagger';

const router = Router();

import authRoute from './authRoute';
import adminIndex from './adminIndex';
import customerIndex from './customerIndex';

/**
 * @swagger
 * /healthCheck:
 *   get:
 *     summary: Health check endpoint
 *     tags: [Utility]
 *     responses:
 *       200:
 *         description: Server is healthy
 */
router.get('/healthCheck', (req, res) => {
  const now = new Date();
  res.status(200).json({
    status: 'OK',
    message: 'Server is healthy',
    timestamp: now.toTimeString().split(' ')[0],
    date: now.toISOString().split('T')[0],
  });
});

router.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

router.use('/auth', authRoute);

router.use('/admin', adminIndex);

router.use('/customer', customerIndex);

export default router;
