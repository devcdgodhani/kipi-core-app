import { Router } from 'express';
import WhatsAppContactController from '../../controllers/whatsAppContactController';
import WhatsAppContactValidator from '../../validators/whatsAppContactValidator';

const router = Router();
const controller = new WhatsAppContactController();
const validator = new WhatsAppContactValidator();

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

// Specific Actions
router.put('/:id/consent', validator.updateConsent, controller.updateConsent);
router.post('/:id/dnd', validator.markAsDND, controller.markAsDND);

// Generic GET One by ID
router.get('/:id', validator.getOne, controller.getOne);

export default router;
