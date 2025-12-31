import { Router } from 'express';
import ProductController from '../../controllers/productController';
import ProductValidator from '../../validators/productValidators';

const router = Router();
const productController = new ProductController();
const productValidator = new ProductValidator();

router.route('/getOne')
  .get(productValidator.getOne, productController.getOne)
  .post(productValidator.getOne, productController.getOne);

router.route('/getAll')
  .get(productValidator.getAll, productController.getAll)
  .post(productValidator.getAll, productController.getAll);

router.route('/getWithPagination')
  .get(productValidator.getWithPagination, productController.getWithPagination)
  .post(productValidator.getWithPagination, productController.getWithPagination);

router.put('/:id', productValidator.updateById, productController.updateById);

router.post('/', productValidator.create, productController.create);

router.delete('/deleteByFilter', productValidator.deleteByFilter, productController.deleteByFilter);

export default router;
