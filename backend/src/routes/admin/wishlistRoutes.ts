import { Router } from 'express';
import { jwtAuth } from '../../middlewares/jwtAuth';
import { wishlistController } from '../../controllers/wishlistController';
import { wishlistValidator } from '../../validators/wishlistValidators';

const router = Router();

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
