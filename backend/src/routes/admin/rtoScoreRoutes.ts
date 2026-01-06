import { Router } from 'express';
import { RtoScoreController } from '../../controllers/rtoScoreController';
import { validate } from '../../helpers/zodValidator';
import { calculateRtoScoreSchema } from '../../validators/rtoValidators';
import { jwtAuth } from '../../middlewares';

const router = Router();
const rtoScoreController = new RtoScoreController();

// Specialized Scoring logic
router.post(
  '/calculate',
  validate(calculateRtoScoreSchema),
  rtoScoreController.calculateScore
);

// Standard CRUD
router.get('/getOne', rtoScoreController.getOne);
router.get('/getOne/:id', rtoScoreController.getOne);
router.post('/getAll', rtoScoreController.getAll);
router.post('/getWithPagination', rtoScoreController.getWithPagination);
router.delete('/deleteByFilter', rtoScoreController.deleteByFilter);

export default router;
