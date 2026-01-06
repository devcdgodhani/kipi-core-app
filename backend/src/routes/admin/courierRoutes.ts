import { Router } from 'express';
import CourierController from '../../controllers/courierController';
import { jwtAuth } from '../../middlewares';

const router = Router();
const courierController = new CourierController();

/***************** base crud structure*******************/
router.route('/getOne')
  .get(courierController.getOne)
  .post(courierController.getOne);

router.route('/getAll')
  .get(courierController.getAll)
  .post(courierController.getAll);

router.route('/getWithPagination')
  .get(courierController.getWithPagination)
  .post(courierController.getWithPagination);

router.put('/:id', courierController.updateById);
router.post('/', courierController.create);
router.delete('/deleteByFilter', courierController.deleteByFilter);

/***************** specialized routes *******************/
router.patch('/:id/status', courierController.toggleActive);
router.get('/:id', courierController.getOne); // Alias for convenience

export default router;
