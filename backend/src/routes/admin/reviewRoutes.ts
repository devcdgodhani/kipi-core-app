import { Router } from 'express';
import { jwtAuth } from '../../middlewares/jwtAuth';
import ReviewController from '../../controllers/reviewController';
import ReviewValidator from '../../validators/reviewValidators';

const router = Router();
const reviewController = new ReviewController();
const reviewValidator = new ReviewValidator();

/***************** base crud structure*******************/
router.route('/getOne')
  .get(reviewValidator.getOne, reviewController.getOne)
  .post(reviewValidator.getOne, reviewController.getOne);

router.route('/getAll')
  .get(reviewValidator.getAll, reviewController.getAll)
  .post(reviewValidator.getAll, reviewController.getAll);

router.route('/getWithPagination')
  .get(reviewValidator.getWithPagination, reviewController.getWithPagination)
  .post(reviewValidator.getWithPagination, reviewController.getWithPagination);

router.put('/:id', reviewValidator.updateById, reviewController.updateById);

router.post('/', reviewValidator.create, reviewController.create);

router.delete('/deleteByFilter', reviewValidator.deleteByFilter, reviewController.deleteByFilter);

/****************************************************** */

export default router;
