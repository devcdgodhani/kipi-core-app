import { Router } from 'express';
import { jwtAuth } from '../../middlewares/jwtAuth';
import { notificationController } from '../../controllers/notificationController';
import { notificationValidator } from '../../validators/notificationValidators';

const router = Router();

/***************** base crud structure*******************/
router.route('/getOne')
  .get(notificationValidator.getOne, notificationController.getOne)
  .post(notificationValidator.getOne, notificationController.getOne);

router.route('/getAll')
  .get(notificationValidator.getAll, notificationController.getAll)
  .post(notificationValidator.getAll, notificationController.getAll);

router.route('/getWithPagination')
  .get(notificationValidator.getWithPagination, notificationController.getWithPagination)
  .post(notificationValidator.getWithPagination, notificationController.getWithPagination);

router.put('/:id', notificationValidator.updateById, notificationController.updateById);

router.post('/', notificationValidator.create, notificationController.create);

router.delete('/deleteByFilter', notificationValidator.deleteByFilter, notificationController.deleteByFilter);

/****************************************************** */

export default router;
