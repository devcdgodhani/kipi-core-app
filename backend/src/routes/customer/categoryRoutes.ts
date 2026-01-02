import { Router } from 'express';
import CategoryController from '../../controllers/categoryController';
import CategoryValidator from '../../validators/categoryValidators';

const router = Router();
const categoryController = new CategoryController();
const categoryValidator = new CategoryValidator();

router.route('/getAll')
  .get(categoryValidator.getAll, categoryController.getAll)
  .post(categoryValidator.getAll, categoryController.getAll);

router.route('/getOne')
  .get(categoryValidator.getOne, categoryController.getOne)
  .post(categoryValidator.getOne, categoryController.getOne);

export default router;
