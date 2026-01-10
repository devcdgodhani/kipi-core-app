import { Router } from 'express';
import { jwtAuth } from '../../middlewares/jwtAuth';
import { cronJobController } from '../../controllers/cronJobController';

const router = Router();

/***************** base crud structure*******************/
router.route('/getOne')
  .get(cronJobController.getOne)
  .post(cronJobController.getOne);

router.route('/getAll')
  .get(cronJobController.getAll)
  .post(cronJobController.getAll);

router.route('/getWithPagination')
  .get(cronJobController.getWithPagination)
  .post(cronJobController.getWithPagination);

router.put('/:id', cronJobController.updateById);

router.post('/', cronJobController.create);

router.delete('/deleteByFilter', cronJobController.deleteByFilter);

/***************** specialized routes *******************/
router.post('/run', cronJobController.runJob);
router.get('/history/:id', cronJobController.getHistory);

export default router;
