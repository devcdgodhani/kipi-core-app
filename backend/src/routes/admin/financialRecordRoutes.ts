import { Router } from 'express';
import FinancialRecordController from '../../controllers/financialRecordController';
import FinancialRecordValidator from '../../validators/financialRecordValidators';

const router = Router();
const financialRecordController = new FinancialRecordController();
const financialRecordValidator = new FinancialRecordValidator();

/***************** base crud structure*******************/
router.route('/getOne')
  .get(financialRecordValidator.getOne, financialRecordController.getOne)
  .post(financialRecordValidator.getOne, financialRecordController.getOne);

router.route('/getAll')
  .get(financialRecordValidator.getAll, financialRecordController.getAll)
  .post(financialRecordValidator.getAll, financialRecordController.getAll);

router.route('/getWithPagination')
  .get(financialRecordValidator.getWithPagination, financialRecordController.getWithPagination)
  .post(financialRecordValidator.getWithPagination, financialRecordController.getWithPagination);

router.put('/:id', financialRecordValidator.updateById, financialRecordController.updateById);

router.post('/', financialRecordValidator.create, financialRecordController.create);

router.delete('/deleteByFilter', financialRecordValidator.deleteByFilter, financialRecordController.deleteByFilter);

/***************** custom routes *******************/
router.get(
  '/analytics',
  financialRecordValidator.getAnalytics,
  financialRecordController.getAnalytics
);

router.get(
  '/reports',
  financialRecordValidator.getReports,
  financialRecordController.getReports
);

export default router;
