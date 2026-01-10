import { Router } from 'express';
import { paymentController } from '../../controllers/paymentController';
import { customerPaymentValidator } from '../../validators/customerPaymentValidators';
import { jwtAuth } from '../../middlewares/jwtAuth';

const router = Router();

// All payment routes require authentication
router.use(jwtAuth());

// Initiate payment
router.post('/initiate', customerPaymentValidator.initiatePayment, paymentController.initiatePayment);

// Verify payment
router.post('/verify', customerPaymentValidator.verifyPayment, paymentController.verifyPayment);

// Get my payments
router.get('/my', customerPaymentValidator.getMyPayments, paymentController.getMyPayments);

// Get payment by ID
router.get('/:id', customerPaymentValidator.getPaymentById, paymentController.getPaymentById);

// Get payments for an order
router.get('/order/:orderId', customerPaymentValidator.getPaymentsByOrder, paymentController.getPaymentsByOrder);

// Fetch payment status
router.get('/:id/status', customerPaymentValidator.fetchPaymentStatus, paymentController.fetchPaymentStatus);

export default router;
