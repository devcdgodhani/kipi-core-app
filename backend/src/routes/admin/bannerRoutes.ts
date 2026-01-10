import { Router } from 'express';
import { jwtAuth } from '../../middlewares/jwtAuth';
import { bannerController } from '../../controllers/bannerController';
import { bannerValidator } from '../../validators/bannerValidators';

const router = Router();

/***************** base crud structure*******************/
router.route('/getOne')
  .get(bannerValidator.getOne, bannerController.getOne)
  .post(bannerValidator.getOne, bannerController.getOne);

router.route('/getAll')
  .get(bannerValidator.getAll, bannerController.getAll)
  .post(bannerValidator.getAll, bannerController.getAll);

router.route('/getWithPagination')
  .get(bannerValidator.getWithPagination, bannerController.getWithPagination)
  .post(bannerValidator.getWithPagination, bannerController.getWithPagination);

router.put('/:id', bannerValidator.updateById, bannerController.updateById);

router.post('/', bannerValidator.create, bannerController.create);

router.delete('/deleteByFilter', bannerValidator.deleteByFilter, bannerController.deleteByFilter);

/****************************************************** */

export default router;
