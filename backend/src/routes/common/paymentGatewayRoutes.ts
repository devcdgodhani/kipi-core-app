import { Router } from 'express';
import { paymentGatewayController } from '../../controllers/paymentGatewayController';
import { commonPaymentValidator } from '../../validators/commonPaymentValidators';

const router = Router();

// Public route - get enabled gateways (no auth required)
router.get('/enabled', commonPaymentValidator.getEnabledGateways, paymentGatewayController.getEnabledGateways);

export default router;
