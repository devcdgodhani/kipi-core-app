import { Router } from 'express';
import { paymentGatewayController } from '../../controllers/paymentGatewayController';
import { commonPaymentValidator } from '../../validators/commonPaymentValidators';
import { jwtAuth } from '../../middlewares/jwtAuth';

const router = Router();

// Use JWT auth for enabled gateways check
router.use(jwtAuth());

// Get enabled payment gateways
router.get('/enabled', commonPaymentValidator.getEnabledGateways, paymentGatewayController.getEnabledGateways);

export default router;
