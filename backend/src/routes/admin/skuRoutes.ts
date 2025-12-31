import { Router } from 'express';
import SkuController from '../../controllers/skuController';
import SkuValidator from '../../validators/skuValidators';

const router = Router();
const skuController = new SkuController();
const skuValidator = new SkuValidator();

router.route('/getOne')
  .get(skuValidator.getOne, skuController.getOne)
  .post(skuValidator.getOne, skuController.getOne);

router.route('/getAll')
  .get(skuValidator.getAll, skuController.getAll)
  .post(skuValidator.getAll, skuController.getAll);

router.route('/getWithPagination')
  .get(skuValidator.getWithPagination, skuController.getWithPagination)
  .post(skuValidator.getWithPagination, skuController.getWithPagination);

router.put('/:id', skuValidator.updateById, skuController.updateById);

router.post('/', skuValidator.create, skuController.create);

router.delete('/deleteByFilter', skuValidator.deleteByFilter, skuController.deleteByFilter);

export default router;
