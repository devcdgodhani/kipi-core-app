import { Router } from 'express';
import { EtaController } from '../../controllers/etaController';
import { validate } from '../../helpers/zodValidator';
import { calculateEtaSchema } from '../../validators/etaValidators';
import { jwtAuth } from '../../middlewares/jwtAuth';

const router = Router();
const etaController = new EtaController();

router.post(
  '/calculate',
  jwtAuth(),
  validate(calculateEtaSchema),
  etaController.calculateETA
);

export default router;
