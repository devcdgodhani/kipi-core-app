import { Router } from 'express';
import LotController from '../../controllers/lotController';
import LotValidator from '../../validators/lotValidators';

const router = Router();
const lotController = new LotController();
const lotValidator = new LotValidator();

/***************** base crud structure*******************/
router.route('/getOne')
  .get(lotValidator.getOne, lotController.getOne)
  .post(lotValidator.getOne, lotController.getOne);

router.route('/getAll')
  .get(lotValidator.getAll, lotController.getAll)
  .post(lotValidator.getAll, lotController.getAll);

router.route('/getWithPagination')
  .get(lotValidator.getWithPagination, lotController.getWithPagination)
  .post(lotValidator.getWithPagination, lotController.getWithPagination);

router.put('/:id', lotValidator.updateById, lotController.updateById);

router.post('/', lotValidator.create, lotController.create);

router.delete('/deleteByFilter', lotValidator.deleteByFilter, lotController.deleteByFilter);

export default router;
