import { Router } from 'express';
import PaymentGatewayController from '../../controllers/paymentGatewayController';
import CommonPaymentValidators from '../../validators/commonPaymentValidators';

const router = Router();
const gatewayController = new PaymentGatewayController();
const validators = new CommonPaymentValidators();

// Public route - get enabled gateways (no auth required)
router.get('/enabled', validators.getEnabledGateways, gatewayController.getEnabledGateways);

export default router;
