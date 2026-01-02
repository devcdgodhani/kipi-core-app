import { Router } from 'express';
import OrderController from '../../controllers/orderController';
import OrderValidator from '../../validators/orderValidators';
import { jwtAuth } from '../../middlewares/jwtAuth';

const router = Router();
const orderController = new OrderController();
const orderValidator = new OrderValidator();

// All order routes require authentication
router.use(jwtAuth());

router.route('/create')
  .post(orderValidator.create, orderController.create);

router.route('/getMyOrders')
  .post(orderValidator.getMyOrders, orderController.getMyOrders)
  .get(orderValidator.getMyOrders, orderController.getMyOrders);

router.route('/getOne/:id')
    .get(orderValidator.getOne, orderController.getOne);

export default router;
