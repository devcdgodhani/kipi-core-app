import { Router } from 'express';
import LoyaltyController from '../../controllers/loyaltyController';
import { jwtAuth } from '../../middlewares/jwtAuth';

const router = Router();
const controller = new LoyaltyController();

// All loyalty routes are protected
router.use(jwtAuth());

/**
 * @route   POST /api/loyalty/status
 * @desc    Get user points balance and transaction ledger
 * @access  Private
 */
router.post('/status', controller.getUserLoyalty);

export default router;
