import { Router } from 'express';
import LoyaltyController from '../../controllers/loyaltyController';
import { jwtAuth } from '../../middlewares/jwtAuth';

const router = Router();
const controller = new LoyaltyController();

// Admin routes
router.use(jwtAuth);

/**
 * @route   POST /api/loyalty/admin/ledger
 * @desc    Get global point transactions with filters
 * @access  Admin
 */
router.post('/ledger', controller.getAdminLedger);

export default router;
