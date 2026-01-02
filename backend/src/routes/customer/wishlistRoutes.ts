import { Router } from 'express';
import { jwtAuth } from '../../middlewares/jwtAuth';
import WishlistController from '../../controllers/wishlistController';
import WishlistValidator from '../../validators/wishlistValidators';

const router = Router();
const wishlistController = new WishlistController();
const wishlistValidator = new WishlistValidator();

router.route('/getOne')
  .get(jwtAuth(), wishlistValidator.getOne, wishlistController.getOne)
  .post(jwtAuth(), wishlistValidator.getOne, wishlistController.getOne);

router.route('/')
  .post(jwtAuth(), wishlistValidator.create, wishlistController.create);

router.route('/:id')
  .put(jwtAuth(), wishlistValidator.updateById, wishlistController.updateById);

router.delete('/deleteByFilter', jwtAuth(), wishlistValidator.deleteByFilter, wishlistController.deleteByFilter);

export default router;
