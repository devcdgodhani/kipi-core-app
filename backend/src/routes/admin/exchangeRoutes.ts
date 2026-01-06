import { Router } from 'express';
import ExchangeController from '../../controllers/exchangeController';
import { jwtAuth } from '../../middlewares/jwtAuth';

const router = Router();
const exchangeController = new ExchangeController();

router.use(jwtAuth());

// Admin / Shared Endpoints
router.route('/getOne')
  .get(exchangeController.getOne)
  .post(exchangeController.getOne);

router.route('/getOne/:id')
  .get(exchangeController.getOne);

router.route('/getAll')
  .get(exchangeController.getAll)
  .post(exchangeController.getAll);

router.route('/getWithPagination')
  .get(exchangeController.getWithPagination)
  .post(exchangeController.getWithPagination);

router.post('/', exchangeController.create);
router.patch('/:id/status', exchangeController.updateStatus);
router.post('/:id/cancel', exchangeController.cancel);

router.delete('/deleteByFilter', exchangeController.deleteByFilter);

export default router;
