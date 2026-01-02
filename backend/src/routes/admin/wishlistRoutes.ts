import { Router } from 'express';
import { jwtAuth } from '../../middlewares/jwtAuth';
import WishlistController from '../../controllers/wishlistController';
import WishlistValidator from '../../validators/wishlistValidators';

const router = Router();
const wishlistController = new WishlistController();
const wishlistValidator = new WishlistValidator();

/***************** base crud structure*******************/
router.route('/getOne')
  .get(wishlistValidator.getOne, wishlistController.getOne)
  .post(wishlistValidator.getOne, wishlistController.getOne);

router.route('/getAll')
  .get(wishlistValidator.getAll, wishlistController.getAll)
  .post(wishlistValidator.getAll, wishlistController.getAll);

router.route('/getWithPagination')
  .get(wishlistValidator.getWithPagination, wishlistController.getWithPagination)
  .post(wishlistValidator.getWithPagination, wishlistController.getWithPagination);

router.put('/:id', wishlistValidator.updateById, wishlistController.updateById);

router.post('/', wishlistValidator.create, wishlistController.create);

router.delete('/deleteByFilter', wishlistValidator.deleteByFilter, wishlistController.deleteByFilter);

/****************************************************** */

export default router;
