import express from 'express';
import { pushNotificationController } from '../../controllers/pushNotificationController';
import { pushNotificationValidator } from '../../validators/pushNotificationValidators';
import { jwtAuth } from '../../middlewares';

const router = express.Router();

router.use(jwtAuth());

router.post('/register-device', pushNotificationValidator.registerDevice, pushNotificationController.registerDevice);
router.post('/unregister-device', pushNotificationValidator.unregisterDevice, pushNotificationController.unregisterDevice);

export default router;
