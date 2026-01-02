import { Router } from 'express';
import LoyaltyController from '../../controllers/loyaltyController';
import { jwtAuth } from '../../middlewares/jwtAuth';

const router = Router();
const controller = new LoyaltyController();

/**
 * @route   POST /api/loyalty/ledger
 * @desc    Get global point transactions with filters
 * @access  Admin
 */
router.post('/ledger', controller.getAdminLedger);

export default router;
