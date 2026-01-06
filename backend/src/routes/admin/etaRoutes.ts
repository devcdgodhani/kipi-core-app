import { Router } from 'express';
import { EtaController } from '../../controllers/etaController';
import { validate } from '../../helpers/zodValidator';
import { calculateEtaSchema } from '../../validators/etaValidators';

const router = Router();
const etaController = new EtaController();

router.post(
  '/calculate',
  validate(calculateEtaSchema),
  etaController.calculateETA
);

export default router;
