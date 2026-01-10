import { Router } from 'express';
import { categoryController } from '../../controllers/categoryController';
import { categoryValidator } from '../../validators/categoryValidators';

const router = Router();

router.route('/getAll')
  .get(categoryValidator.getAll, categoryController.getAll)
  .post(categoryValidator.getAll, categoryController.getAll);

router.route('/getOne')
  .get(categoryValidator.getOne, categoryController.getOne)
  .post(categoryValidator.getOne, categoryController.getOne);

export default router;
