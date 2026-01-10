import { Router } from 'express';
import WhatsAppMessageController from '../../controllers/whatsAppMessageController';
import WhatsAppMessageValidator from '../../validators/whatsAppMessageValidator';

const router = Router();
const controller = new WhatsAppMessageController();
const validator = new WhatsAppMessageValidator();

// CRUD
router.route('/getOne')
  .get(validator.getOne, controller.getOne)
  .post(validator.getOne, controller.getOne);

router.route('/getAll')
  .get(validator.getAll, controller.getAll)
  .post(validator.getAll, controller.getAll);

router.route('/getWithPagination')
  .get(validator.getWithPagination, controller.getWithPagination)
  .post(validator.getWithPagination, controller.getWithPagination);

router.post('/', validator.create, controller.create);
router.put('/:id', validator.updateById, controller.updateById);
router.delete('/deleteByFilter', validator.deleteByFilter, controller.deleteByFilter);

// Generic GET One by ID
router.get('/:id', validator.getOne, controller.getOne);

export default router;
