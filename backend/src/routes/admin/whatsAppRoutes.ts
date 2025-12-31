import { Router } from 'express';
import WhatsAppController from '../../controllers/whatsAppController';
import WhatsAppValidator from '../../validators/whatsAppValidators';

const router = Router();
const whatsAppController = new WhatsAppController();
const whatsAppValidator = new WhatsAppValidator();

/***************** base crud structure*******************/
router.route('/getOne')
  .get(whatsAppValidator.getOne, whatsAppController.getOne)
  .post(whatsAppValidator.getOne, whatsAppController.getOne);

router.route('/getAll')
  .get(whatsAppValidator.getAll, whatsAppController.getAll)
  .post(whatsAppValidator.getAll, whatsAppController.getAll);

router.route('/getWithPagination')
  .get(whatsAppValidator.getWithPagination, whatsAppController.getWithPagination)
  .post(whatsAppValidator.getWithPagination, whatsAppController.getWithPagination);

router.put('/:id', whatsAppValidator.updateById, whatsAppController.updateById);

router.post('/', whatsAppValidator.create, whatsAppController.create);

router.delete('/deleteByFilter', whatsAppValidator.deleteByFilter, whatsAppController.deleteByFilter);

/***************** whatsapp specific *******************/
router.post('/initialize', whatsAppValidator.initializeSession, whatsAppController.initializeSession);
router.post('/logout', whatsAppValidator.logoutSession, whatsAppController.logoutSession);
router.post('/send-message', whatsAppValidator.sendMessage, whatsAppController.sendMessage);
router.post('/send-bulk-message', whatsAppValidator.sendBulkMessage, whatsAppController.sendBulkMessage);

export default router;
