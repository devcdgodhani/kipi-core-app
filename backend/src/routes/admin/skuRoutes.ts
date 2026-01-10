import { Router } from 'express';
import { skuController } from '../../controllers/skuController';
import { skuValidator } from '../../validators/skuValidators';

const router = Router();

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
