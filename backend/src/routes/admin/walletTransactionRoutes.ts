import { Router } from 'express';
import { walletTransactionController } from '../../controllers/walletTransactionController';
import { walletTransactionValidator } from '../../validators/walletTransactionValidators';

const router = Router();

// Standard CRUD Endpoints
router.route('/getOne')
  .get(walletTransactionValidator.getOne, walletTransactionController.getOne)
  .post(walletTransactionValidator.getOne, walletTransactionController.getOne);

router.route('/getOne/:id')
  .get(walletTransactionValidator.getOne, walletTransactionController.getOne);

router.route('/getAll')
  .get(walletTransactionValidator.getAll, walletTransactionController.getAll)
  .post(walletTransactionValidator.getAll, walletTransactionController.getAll);

router.route('/getWithPagination')
  .get(walletTransactionValidator.getWithPagination, walletTransactionController.getWithPagination)
  .post(walletTransactionValidator.getWithPagination, walletTransactionController.getWithPagination);

router.post('/', walletTransactionValidator.create, walletTransactionController.create);

router.put('/:id', walletTransactionValidator.updateById, walletTransactionController.updateById);

router.delete('/deleteByFilter', walletTransactionValidator.deleteByFilter, walletTransactionController.deleteByFilter);

// Custom Transaction Endpoints
router.post('/confirm/:transactionId', walletTransactionValidator.confirmTransaction, walletTransactionController.confirmTransaction);

router.post('/reverse/:transactionId', walletTransactionValidator.reverseTransaction, walletTransactionController.reverseTransaction);

router.post('/expire/:transactionId', walletTransactionValidator.expireTransaction, walletTransactionController.expireTransaction);

export default router;
