import { Router } from 'express';
import CouponController from '../../controllers/couponController';
import CouponValidator from '../../validators/couponValidators';

const router = Router();
const controller = new CouponController();
const validator = new CouponValidator();

/***************** base crud structure*******************/
router.route('/getOne')
  .get(validator.getOne, controller.getOne)
  .post(validator.getOne, controller.getOne);

router.route('/getAll')
  .get(validator.getAll, controller.getAll)
  .post(validator.getAll, controller.getAll);

router.route('/getWithPagination')
  .get(validator.getWithPagination, controller.getWithPagination)
  .post(validator.getWithPagination, controller.getWithPagination);

router.put('/:id', validator.updateById, controller.updateById);

router.post('/', validator.create, controller.create);

router.delete('/deleteByFilter', validator.deleteByFilter, controller.deleteByFilter);

/****************************************************** */

export default router;
