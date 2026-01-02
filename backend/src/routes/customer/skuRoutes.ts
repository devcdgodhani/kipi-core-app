import { Router } from 'express';
import { jwtAuth } from '../../middlewares/jwtAuth';
import SkuController from '../../controllers/skuController';
import SkuValidator from '../../validators/skuValidators';

const router = Router();
const skuController = new SkuController();
const skuValidator = new SkuValidator();

router.route('/getAll')
  .get(skuValidator.getAll, skuController.getAll)
  .post(skuValidator.getAll, skuController.getAll);

router.route('/getOne')
  .get(skuValidator.getOne, skuController.getOne)
  .post(skuValidator.getOne, skuController.getOne);

export default router;
