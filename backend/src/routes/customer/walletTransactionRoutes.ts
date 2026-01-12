import { Router } from 'express';
import { walletTransactionController } from '../../controllers/walletTransactionController';
import { walletTransactionValidator } from '../../validators/walletTransactionValidators';
import { jwtAuth } from '../../middlewares/jwtAuth';

const router = Router();

// All customer transaction routes are protected
router.use(jwtAuth());

/**
 * @route   POST /api/customer/wallet-transaction/my-transactions
 * @desc    Get current user's transactions with pagination
 * @access  Private
 */
router.post('/getWithPagination', walletTransactionValidator.getMyTransactions, walletTransactionController.getMyTransactions);

/**
 * @route   POST /api/customer/wallet-transaction/pending
 * @desc    Get pending transactions
 * @access  Private
 */
router.post('/pending', walletTransactionValidator.getPending, walletTransactionController.getPending);

/**
 * @route   GET /api/customer/wallet-transaction/expiring
 * @desc    Get expiring transactions
 * @access  Private
 */
router.get('/expiring', walletTransactionValidator.getExpiring, walletTransactionController.getExpiring);

export default router;
