import { Router } from 'express';
import CategoryController from '../../controllers/categoryController';
import CategoryValidator from '../../validators/categoryValidators';

const router = Router();
const categoryController = new CategoryController();
const categoryValidator = new CategoryValidator();

/***************** base crud structure*******************/
router.route('/getOne')
  .get(categoryValidator.getOne, categoryController.getOne)
  .post(categoryValidator.getOne, categoryController.getOne);

router.route('/getAll')
  .get(categoryValidator.getAll, categoryController.getAll)
  .post(categoryValidator.getAll, categoryController.getAll);

router.route('/getWithPagination')
  .get(categoryValidator.getWithPagination, categoryController.getWithPagination)
  .post(categoryValidator.getWithPagination, categoryController.getWithPagination);

router.put('/:id', categoryValidator.updateById, categoryController.updateById);

router.post('/', categoryValidator.create, categoryController.create);

router.delete('/deleteByFilter', categoryValidator.deleteByFilter, categoryController.deleteByFilter);

export default router;
