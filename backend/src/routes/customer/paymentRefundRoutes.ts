import { Router } from 'express';
import PaymentRefundController from '../../controllers/paymentRefundController';
import CustomerRefundValidators from '../../validators/customerRefundValidators';
import { jwtAuth } from '../../middlewares/jwtAuth';

const router = Router();
const refundController = new PaymentRefundController();
const validators = new CustomerRefundValidators();

// All refund routes require authentication
router.use(jwtAuth());

// Initiate refund
router.post('/initiate', validators.initiateRefund, refundController.initiateRefund);

// Get my refunds
router.get('/my', validators.getMyRefunds, refundController.getMyRefunds);

// Get refund by ID
router.get('/:id', validators.getRefundById, refundController.getRefundById);

// Get refunds for a payment
router.get('/payment/:paymentId', validators.getRefundsByPayment, refundController.getRefundsByPayment);

// Get refunds for an order
router.get('/order/:orderId', validators.getRefundsByOrder, refundController.getRefundsByOrder);

export default router;
