import { Router } from 'express';
import { paymentRefundController } from '../../controllers/paymentRefundController';
import { customerRefundValidator } from '../../validators/customerRefundValidators';
import { jwtAuth } from '../../middlewares/jwtAuth';

const router = Router();

// All refund routes require authentication
router.use(jwtAuth());

// Initiate refund
router.post('/initiate', customerRefundValidator.initiateRefund, paymentRefundController.initiateRefund);

// Get my refunds
router.get('/my', customerRefundValidator.getMyRefunds, paymentRefundController.getMyRefunds);

// Get refund by ID
router.get('/:id', customerRefundValidator.getRefundById, paymentRefundController.getRefundById);

// Get refunds for a payment
router.get('/payment/:paymentId', customerRefundValidator.getRefundsByPayment, paymentRefundController.getRefundsByPayment);

// Get refunds for an order
router.get('/order/:orderId', customerRefundValidator.getRefundsByOrder, paymentRefundController.getRefundsByOrder);

export default router;
