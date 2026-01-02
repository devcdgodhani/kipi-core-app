import { Router } from 'express';
import { jwtAuth } from '../../middlewares/jwtAuth';
import ReviewController from '../../controllers/reviewController';
import ReviewValidator from '../../validators/reviewValidators';

const router = Router();
const reviewController = new ReviewController();
const reviewValidator = new ReviewValidator();

router.route('/getAll')
  .get(reviewValidator.getAll, reviewController.getAll)
  .post(reviewValidator.getAll, reviewController.getAll);

router.route('/')
  .post(jwtAuth(), reviewValidator.create, reviewController.create);

router.route('/:id')
  .put(jwtAuth(), reviewValidator.updateById, reviewController.updateById);

router.delete('/deleteByFilter', jwtAuth(), reviewValidator.deleteByFilter, reviewController.deleteByFilter);

export default router;
