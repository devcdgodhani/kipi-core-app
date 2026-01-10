import { Router } from 'express';
import { jwtAuth } from '../../middlewares/jwtAuth';
import { notificationController } from '../../controllers/notificationController';
import { notificationValidator } from '../../validators/notificationValidators';

const router = Router();

// All customer notification routes require authentication
router.use(jwtAuth());

// Get user's notifications with pagination
router.route('/getMyNotifications')
  .get(notificationController.getMyNotifications)
  .post(notificationController.getMyNotifications);

// Get unread notification count
router.get('/getUnreadCount', notificationController.getUnreadCount);

// Mark notifications as read
router.put('/markAsRead', notificationValidator.markAsRead, notificationController.markAsRead);

// Mark all notifications as read
router.put('/markAllAsRead', notificationController.markAllAsRead);

export default router;
