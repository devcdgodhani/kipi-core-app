import { Router } from 'express';
import { loyaltyController } from '../../controllers/loyaltyController';
import { jwtAuth } from '../../middlewares/jwtAuth';

const router = Router();

// Customer Endpoints
router.post('/my-balance', jwtAuth(), loyaltyController.getUserLoyalty);

// Admin Endpoints (Standardized)
router.route('/getOne')
  .get(loyaltyController.getOne)
  .post(loyaltyController.getOne);

router.route('/getOne/:id')
  .get(loyaltyController.getOne);

router.route('/getAll')
  .get(loyaltyController.getAll)
  .post(loyaltyController.getAll);

router.route('/getWithPagination')
  .get(loyaltyController.getWithPagination)
  .post(loyaltyController.getWithPagination);

router.delete('/deleteByFilter', loyaltyController.deleteByFilter);

export default router;
