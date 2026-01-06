import { Router } from 'express';
import { NdrController } from '../../controllers/ndrController';
import { validate } from '../../helpers/zodValidator';
import { resolveNdrSchema, getNdrSchema } from '../../validators/ndrValidators';
import { jwtAuth } from '../../middlewares';

const router = Router();
const ndrController = new NdrController();

router.post(
  '/getWithPagination',
  jwtAuth(),
  ndrController.getAll
);

router.post(
  '/resolve/:ndrId',
  jwtAuth(),
  validate(resolveNdrSchema),
  ndrController.resolve
);

router.get(
  '/:id',
  jwtAuth(),
  validate(getNdrSchema),
  ndrController.getOne
);

export default router;
