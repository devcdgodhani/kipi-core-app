import { Router } from 'express';
import { loyaltyController } from '../../controllers/loyaltyController';
import { jwtAuth } from '../../middlewares/jwtAuth';

const router = Router();

// All loyalty routes are protected
router.use(jwtAuth());

/**
 * @route   POST /api/loyalty/status
 * @desc    Get user points balance and transaction ledger
 * @access  Private
 */
router.post('/status', loyaltyController.getUserLoyalty);

export default router;
