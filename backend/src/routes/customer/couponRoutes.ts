import { Router } from 'express';
import CouponController from '../../controllers/couponController';
import CouponValidator from '../../validators/couponValidators';
import { jwtAuth } from '../../middlewares/jwtAuth';

const router = Router();
const controller = new CouponController();
const validator = new CouponValidator();

router.get('/', jwtAuth(), controller.getAll);

// Apply coupon requires authentication
router.post(
  '/apply',
  jwtAuth(),
  validator.apply,
  controller.apply
);

export default router;
