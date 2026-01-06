import { Router } from 'express';
import { stockLedgerController } from '../../controllers/stockLedgerController';
import { jwtAuth } from '../../middlewares';

const router = Router();

router.get('/getOne/:id', jwtAuth(), stockLedgerController.getOne);
router.get('/getWithPagination', jwtAuth(), stockLedgerController.getWithPagination);
router.post('/getWithPagination', jwtAuth(), stockLedgerController.getWithPagination);

export default router;
