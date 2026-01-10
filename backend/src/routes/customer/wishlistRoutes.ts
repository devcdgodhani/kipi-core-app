import { Router } from 'express';
import { jwtAuth } from '../../middlewares/jwtAuth';
import { wishlistController } from '../../controllers/wishlistController';
import { wishlistValidator } from '../../validators/wishlistValidators';

const router = Router();

router.route('/getOne')
  .get(jwtAuth(), wishlistValidator.getOne, wishlistController.getOne)
  .post(jwtAuth(), wishlistValidator.getOne, wishlistController.getOne);

router.route('/')
  .post(jwtAuth(), wishlistValidator.create, wishlistController.create);

router.route('/:id')
  .put(jwtAuth(), wishlistValidator.updateById, wishlistController.updateById);

router.delete('/deleteByFilter', jwtAuth(), wishlistValidator.deleteByFilter, wishlistController.deleteByFilter);

export default router;
