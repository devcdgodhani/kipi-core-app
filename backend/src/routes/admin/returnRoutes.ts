import { Router } from 'express';
import { returnController } from '../../controllers/returnController';

const router = Router();

router.post('/', returnController.create);
router.get('/', returnController.getWithPagination);
router.get('/:id', returnController.getOne);
router.patch('/:id/status', returnController.updateStatus);

export default router;
