import { Router } from 'express';
import { flashDealController } from '../../controllers/flashDealController';

const router = Router();

router.get('/getActive', flashDealController.getActive);
router.post('/getActive', flashDealController.getActive);

export default router;
