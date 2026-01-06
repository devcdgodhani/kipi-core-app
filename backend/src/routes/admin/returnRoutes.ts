import { Router } from 'express';
import ReturnController from '../../controllers/returnController';
import { jwtAuth } from '../../middlewares/jwtAuth';

const router = Router();
const returnController = new ReturnController();

// Admin / Shared Endpoints
router.route('/getOne')
  .get(returnController.getOne)
  .post(returnController.getOne);

router.route('/getOne/:id')
  .get(returnController.getOne);

router.route('/getAll')
  .get(returnController.getAll)
  .post(returnController.getAll);

router.route('/getWithPagination')
  .get(returnController.getWithPagination)
  .post(returnController.getWithPagination);

router.post('/', returnController.create);
router.patch('/:id/status', returnController.updateStatus);
router.post('/:id/cancel', returnController.cancel);

router.delete('/deleteByFilter', returnController.deleteByFilter);
router.get('/:id', returnController.getOne); // Alias for convenience

export default router;
