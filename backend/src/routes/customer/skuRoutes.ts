import { Router } from 'express';
import { jwtAuth } from '../../middlewares/jwtAuth';
import { skuController } from '../../controllers/skuController';
import { skuValidator } from '../../validators/skuValidators';

const router = Router();

router.route('/getAll')
  .get(skuValidator.getAll, skuController.getAll)
  .post(skuValidator.getAll, skuController.getAll);

router.route('/getOne')
  .get(skuValidator.getOne, skuController.getOne)
  .post(skuValidator.getOne, skuController.getOne);

export default router;
