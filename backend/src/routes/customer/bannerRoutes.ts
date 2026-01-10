import { Router } from 'express';
import { bannerController } from '../../controllers/bannerController';
import { bannerValidator } from '../../validators/bannerValidators';

const router = Router();

// Customer can only view active banners
router.route('/getActive')
  .get(bannerController.getAll)
  .post(bannerController.getAll);

router.route('/getAll')
  .get(bannerValidator.getAll, bannerController.getAll)
  .post(bannerValidator.getAll, bannerController.getAll);

router.route('/getOne')
  .get(bannerValidator.getOne, bannerController.getOne)
  .post(bannerValidator.getOne, bannerController.getOne);

export default router;
