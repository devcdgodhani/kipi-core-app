import express from 'express';
import { pushNotificationController } from '../../controllers/pushNotificationController';
import { pushNotificationValidator } from '../../validators/pushNotificationValidators';

const router = express.Router();

// CRUD Endpoints
router.post('/', pushNotificationValidator.create, pushNotificationController.create);
router.get('/getAll', pushNotificationValidator.getAll, pushNotificationController.getAll);
router.post('/getOne', pushNotificationValidator.getOne, pushNotificationController.getOne);
router.post('/getWithPagination', pushNotificationValidator.getWithPagination, pushNotificationController.getWithPagination);

// ID-based operations
router.route('/:id')
  .put(pushNotificationValidator.updateById, pushNotificationController.updateById)
  // .get(pushNotificationController.getById); // If generic getOne covers it, usually by filter

router.delete('/deleteByFilter', pushNotificationValidator.deleteByFilter, pushNotificationController.deleteByFilter);

// Custom
router.post('/:id/send', pushNotificationController.sendNow);

export default router;
