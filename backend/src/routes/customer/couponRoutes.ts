import { Router } from 'express';
import { couponController } from '../../controllers/couponController';
import { couponValidator } from '../../validators/couponValidators';
import { jwtAuth } from '../../middlewares/jwtAuth';

const router = Router();

router.get('/', jwtAuth(), couponController.getAll);

// Apply coupon requires authentication
router.post(
  '/apply',
  jwtAuth(),
  couponValidator.apply,
  couponController.apply
);

export default router;
