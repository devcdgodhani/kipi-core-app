import { Router } from 'express';
import { RtoScoreController } from '../../controllers/rtoScoreController';
import { validate } from '../../helpers/zodValidator'; // Corrected Path
import { calculateRtoScoreSchema } from '../../validators/rtoValidators';

import { jwtAuth } from '../../middlewares';

const router = Router();
const rtoScoreController = new RtoScoreController();

router.post(
  '/calculate',
  validate(calculateRtoScoreSchema),
  rtoScoreController.calculateScore
);

router.get('/', jwtAuth(), rtoScoreController.getAllScores);
router.get('/order/:orderId', jwtAuth(), rtoScoreController.getScoreByOrderId);


export default router;
