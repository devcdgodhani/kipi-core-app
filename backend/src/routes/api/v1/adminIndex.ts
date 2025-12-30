import { Router } from 'express';
import { jwtAuth } from '../../../middlewares';
import { TOKEN_TYPE, USER_TYPE } from '../../../constants';
import userRoutes from './userRoutes';
import attributeRoute from './attributeRoute';
import categoryRoute from './categoryRoute';
import productRoute from './productRoute';
import skuRoute from './skuRoute';
import lotRoute from './lotRoute';
import inventoryRoute from './inventoryRoute';
import paymentConfigRoute from './paymentConfigRoute';
import couponRoute from './couponRoute';
import uploadRoute from './uploadRoute';

const router = Router();

router.use('/user', jwtAuth(TOKEN_TYPE.ACCESS_TOKEN, USER_TYPE.ADMIN, USER_TYPE.MASTER_ADMIN), userRoutes);
router.use('/attributes', attributeRoute);
router.use('/categories', categoryRoute);
router.use('/products', productRoute);
router.use('/skus', skuRoute);
router.use('/lots', lotRoute);
router.use('/inventory', inventoryRoute);
router.use('/payment-config', paymentConfigRoute);
router.use('/coupons', couponRoute);
router.use('/upload', uploadRoute);

export default router;
