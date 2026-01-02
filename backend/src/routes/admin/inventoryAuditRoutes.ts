import { Router } from 'express';
import { inventoryAuditController } from '../../controllers/inventoryAuditController';
import { jwtAuth } from '../../middlewares';

const router = Router();

router.use(jwtAuth());

router.post('/getWithPagination', inventoryAuditController.getWithPagination);
router.get('/getOne/:id', inventoryAuditController.getOne);

export default router;
