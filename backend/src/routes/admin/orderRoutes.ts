import { Router } from 'express';
import OrderController from '../../controllers/orderController';
import { jwtAuth } from '../../middlewares';

const router = Router();
const orderController = new OrderController();

/***************** base crud structure*******************/
router.route('/getOne')
  .get(orderController.getOne)
  .post(orderController.getOne);

router.route('/getAll')
  .get(orderController.getAll)
  .post(orderController.getAll);

router.route('/getWithPagination')
  .get(orderController.getWithPagination)
  .post(orderController.getWithPagination);

router.put('/:id', orderController.updateById);
router.post('/', orderController.create);
router.delete('/deleteByFilter', orderController.deleteByFilter);

/***************** specialized routes *******************/
router.put('/updateStatus/:id', orderController.updateStatus);
router.post('/simulate-logistics/:id', orderController.simulateLogistics);
router.get('/:id/sync-payment', orderController.syncPaymentStatus);
router.get('/:id/payments', orderController.getPaymentsByOrder);
router.get('/:id', orderController.getOne); // Alias for convenience

export default router;
