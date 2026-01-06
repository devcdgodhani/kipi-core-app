import { Router } from 'express';
import { CourierController } from '../../controllers/admin/courierController';

const router = Router();

router.post('/list', CourierController.getAll);
router.patch('/:id/status', CourierController.toggleActive);

export default router;
