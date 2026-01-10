import { Router } from 'express';
// import { jwtAuth } from '../../middlewares/jwtAuth'; // Assuming auth is handled or needs to be imported
import WhatsAppAccountController from '../../controllers/whatsAppAccountController';
import WhatsAppAccountValidator from '../../validators/whatsAppAccountValidator';

const router = Router();
const controller = new WhatsAppAccountController();
const validator = new WhatsAppAccountValidator();

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
router.post('/:id/initialize', validator.actionById, controller.initialize);
router.post('/:id/logout', validator.actionById, controller.logout);
router.post('/:id/terminate', validator.actionById, controller.terminate);
router.post('/:id/pause', validator.actionById, controller.pause);
router.post('/:id/resume', validator.actionById, controller.resume);
router.post('/:id/disable', validator.actionById, controller.disable);

// Messaging
router.post('/send', validator.sendLoadBalancedMessage, controller.sendLoadBalancedMessage);
router.post('/:id/send', validator.sendMessage, controller.sendMessage);
router.post('/send-bulk', validator.sendBulkMessage, controller.sendBulkMessage); // Note: No ID, uses load balancing logic if implied

// Generic GET One by ID
router.get('/:id', validator.getOne, controller.getOne);

export default router;
