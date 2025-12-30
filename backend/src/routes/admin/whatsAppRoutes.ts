import { Router } from 'express';
import WhatsAppController from '../../controllers/whatsAppController';
import WhatsAppValidator from '../../validators/whatsAppValidators';

const router = Router();
const whatsAppController = new WhatsAppController();
const whatsAppValidator = new WhatsAppValidator();

/***************** base crud structure*******************/
router.get('/getOne', whatsAppValidator.getOne, whatsAppController.getOne);
router.post('/getAll', whatsAppValidator.getAll, whatsAppController.getAll);
router.post('/getWithPagination', whatsAppValidator.getWithPagination, whatsAppController.getWithPagination);
router.put('/:id', whatsAppValidator.updateById, whatsAppController.updateById);
router.post('/', whatsAppValidator.create, whatsAppController.create);
router.delete('/deleteByFilter', whatsAppValidator.deleteByFilter, whatsAppController.deleteByFilter);

/***************** whatsapp specific *******************/
router.post('/initialize', whatsAppController.initializeSession);
router.post('/logout', whatsAppController.logoutSession);
router.post('/send-message', whatsAppValidator.sendMessage, whatsAppController.sendMessage);
router.post('/send-bulk-message', whatsAppValidator.sendBulkMessage, whatsAppController.sendBulkMessage);

export default router;
