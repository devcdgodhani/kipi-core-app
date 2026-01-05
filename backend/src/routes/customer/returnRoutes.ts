import { Router } from 'express';
import { returnController } from '../../controllers/returnController';
import { jwtAuth } from '../../middlewares/jwtAuth';
import ReturnValidator from '../../validators/returnValidators';

const router = Router();
const returnValidator = new ReturnValidator();

// Protected routes
router.post('/request', jwtAuth(), returnValidator.create, returnController.create);
router.post('/getMyReturns', jwtAuth(), returnValidator.getWithPagination, returnController.getWithPagination);
router.get('/getOne/:id', jwtAuth(), returnValidator.getOne, returnController.getOne);
router.post('/cancel/:id', jwtAuth(), returnController.cancel);

export default router;
