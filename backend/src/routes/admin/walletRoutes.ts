import { Router } from 'express';
import { walletController } from '../../controllers/walletController';
import { walletValidator } from '../../validators/walletValidators';

const router = Router();

// Standard CRUD Endpoints
router.route('/getOne')
  .get(walletValidator.getOne, walletController.getOne)
  .post(walletValidator.getOne, walletController.getOne);

router.route('/getOne/:id')
  .get(walletValidator.getOne, walletController.getOne);

router.route('/getAll')
  .get(walletValidator.getAll, walletController.getAll)
  .post(walletValidator.getAll, walletController.getAll);

router.route('/getWithPagination')
  .get(walletValidator.getWithPagination, walletController.getWithPagination)
  .post(walletValidator.getWithPagination, walletController.getWithPagination);

router.post('/', walletValidator.create, walletController.create);

router.put('/:id', walletValidator.updateById, walletController.updateById);

router.delete('/deleteByFilter', walletValidator.deleteByFilter, walletController.deleteByFilter);

// Custom Wallet Endpoints
router.get('/user/:userId', walletValidator.getWalletByUserId, walletController.getWalletByUserId);

router.post('/manual-credit', walletValidator.manualCredit, walletController.manualCredit);

router.post('/manual-debit', walletValidator.manualDebit, walletController.manualDebit);

router.post('/recalculate/:walletId', walletValidator.recalculateBalance, walletController.recalculateBalance);

router.patch('/block/:walletId', walletValidator.blockWallet, walletController.blockWallet);

router.patch('/unblock/:walletId', walletValidator.unblockWallet, walletController.unblockWallet);

export default router;
