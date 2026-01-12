import { Router } from 'express';
import { walletRuleController } from '../../controllers/walletRuleController';
import { walletRuleValidator } from '../../validators/walletRuleValidators';

const router = Router();

// Standard CRUD Endpoints
router.route('/getOne')
  .get(walletRuleValidator.getOne, walletRuleController.getOne)
  .post(walletRuleValidator.getOne, walletRuleController.getOne);

router.route('/getOne/:id')
  .get(walletRuleValidator.getOne, walletRuleController.getOne);

router.route('/getAll')
  .get(walletRuleValidator.getAll, walletRuleController.getAll)
  .post(walletRuleValidator.getAll, walletRuleController.getAll);

router.route('/getWithPagination')
  .get(walletRuleValidator.getWithPagination, walletRuleController.getWithPagination)
  .post(walletRuleValidator.getWithPagination, walletRuleController.getWithPagination);

router.post('/', walletRuleValidator.create, walletRuleController.create);

router.put('/:id', walletRuleValidator.updateById, walletRuleController.updateById);

router.delete('/deleteByFilter', walletRuleValidator.deleteByFilter, walletRuleController.deleteByFilter);

// Custom Wallet Rule Endpoints
router.patch('/activate/:ruleId', walletRuleValidator.activateRule, walletRuleController.activateRule);

router.patch('/deactivate/:ruleId', walletRuleValidator.deactivateRule, walletRuleController.deactivateRule);

router.post('/calculate-cashback', walletRuleValidator.calculateCashback, walletRuleController.calculateCashback);

export default router;
