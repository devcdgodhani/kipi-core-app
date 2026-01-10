import { Router } from 'express';
import { jwtAuth } from '../../middlewares/jwtAuth';
import { cartController } from '../../controllers/cartController';
import { cartValidator } from '../../validators/cartValidators';

const router = Router();

router.route('/getOne')
  .get(jwtAuth(), cartValidator.getOne, cartController.getOne)
  .post(jwtAuth(), cartValidator.getOne, cartController.getOne);

router.route('/')
  .post(jwtAuth(), cartValidator.create, cartController.create);

router.route('/:id')
  .put(jwtAuth(), cartValidator.updateById, cartController.updateById);

router.delete('/deleteByFilter', jwtAuth(), cartValidator.deleteByFilter, cartController.deleteByFilter);

export default router;
