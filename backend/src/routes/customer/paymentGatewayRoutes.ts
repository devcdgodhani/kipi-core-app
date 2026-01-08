import { Router } from 'express';
import PaymentGatewayController from '../../controllers/paymentGatewayController';
import { jwtAuth } from '../../middlewares/jwtAuth';

const router = Router();
const controller = new PaymentGatewayController();

// Use JWT auth for enabled gateways check
router.use(jwtAuth());

// Get enabled payment gateways
router.get('/enabled', controller.getEnabledGateways);

export default router;
