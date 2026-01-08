import { Router } from 'express';
import PaymentController from '../../controllers/paymentController';
import CustomerPaymentValidators from '../../validators/customerPaymentValidators';
import { jwtAuth } from '../../middlewares/jwtAuth';

const router = Router();
const paymentController = new PaymentController();
const validators = new CustomerPaymentValidators();

// All payment routes require authentication
router.use(jwtAuth());

// Initiate payment
router.post('/initiate', validators.initiatePayment, paymentController.initiatePayment);

// Verify payment
router.post('/verify', validators.verifyPayment, paymentController.verifyPayment);

// Get my payments
router.get('/my', validators.getMyPayments, paymentController.getMyPayments);

// Get payment by ID
router.get('/:id', validators.getPaymentById, paymentController.getPaymentById);

// Get payments for an order
router.get('/order/:orderId', validators.getPaymentsByOrder, paymentController.getPaymentsByOrder);

// Fetch payment status
router.get('/:id/status', validators.fetchPaymentStatus, paymentController.fetchPaymentStatus);

export default router;
