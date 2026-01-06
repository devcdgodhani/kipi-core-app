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
  jwtAuth(),
  validate(calculateRtoScoreSchema),
  rtoScoreController.calculateScore
);

// Standard CRUD
router.get('/getOne', jwtAuth(), rtoScoreController.getOne);
router.get('/getOne/:id', jwtAuth(), rtoScoreController.getOne);
router.post('/getAll', jwtAuth(), rtoScoreController.getAll);
router.post('/getWithPagination', jwtAuth(), rtoScoreController.getWithPagination);
router.delete('/deleteByFilter', jwtAuth(), rtoScoreController.deleteByFilter);

export default router;
