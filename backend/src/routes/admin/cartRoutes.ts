import { Router } from 'express';
import { jwtAuth } from '../../middlewares/jwtAuth';
import { cartController } from '../../controllers/cartController';
import { cartValidator } from '../../validators/cartValidators';

const router = Router();

/***************** base crud structure*******************/
router.route('/getOne')
  .get(cartValidator.getOne, cartController.getOne)
  .post(cartValidator.getOne, cartController.getOne);

router.route('/getAll')
  .get(cartValidator.getAll, cartController.getAll)
  .post(cartValidator.getAll, cartController.getAll);

router.route('/getWithPagination')
  .get(cartValidator.getWithPagination, cartController.getWithPagination)
  .post(cartValidator.getWithPagination, cartController.getWithPagination);

router.put('/:id', cartValidator.updateById, cartController.updateById);

router.post('/', cartValidator.create, cartController.create);

router.delete('/deleteByFilter', cartValidator.deleteByFilter, cartController.deleteByFilter);

/****************************************************** */

export default router;
