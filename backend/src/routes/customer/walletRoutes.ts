import { Router } from 'express';
import { walletController } from '../../controllers/walletController';
import { walletValidator } from '../../validators/walletValidators';
import { jwtAuth } from '../../middlewares/jwtAuth';

const router = Router();

// All customer wallet routes are protected
router.use(jwtAuth());

/**
 * @route   POST /api/customer/wallet/my-wallet
 * @desc    Get current user's wallet
 * @access  Private
 */
router.post('/my-wallet', walletValidator.getMyWallet, walletController.getMyWallet);

/**
 * @route   POST /api/customer/wallet/balance
 * @desc    Get current user's wallet balance
 * @access  Private
 */
router.post('/balance', walletValidator.getMyBalance, walletController.getMyBalance);

export default router;
