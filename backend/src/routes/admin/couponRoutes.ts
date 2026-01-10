import { Router } from 'express';
import { couponController } from '../../controllers/couponController';
import { couponValidator } from '../../validators/couponValidators';

const router = Router();

/***************** base crud structure*******************/
router.route('/getOne')
  .get(couponValidator.getOne, couponController.getOne)
  .post(couponValidator.getOne, couponController.getOne);

router.route('/getAll')
  .get(couponValidator.getAll, couponController.getAll)
  .post(couponValidator.getAll, couponController.getAll);

router.route('/getWithPagination')
  .get(couponValidator.getWithPagination, couponController.getWithPagination)
  .post(couponValidator.getWithPagination, couponController.getWithPagination);

router.put('/:id', couponValidator.updateById, couponController.updateById);

router.post('/', couponValidator.create, couponController.create);

router.delete('/deleteByFilter', couponValidator.deleteByFilter, couponController.deleteByFilter);

/****************************************************** */

export default router;
