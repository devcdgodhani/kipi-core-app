import { Router } from 'express';
import { warehouseController } from '../../controllers/warehouseController';
import { warehouseValidator } from '../../validators/warehouseValidators';

const router = Router();

router.route('/getOne')
  .get(warehouseValidator.getOne, warehouseController.getOne)
  .post(warehouseValidator.getOne, warehouseController.getOne);

router.route('/getAll')
  .get(warehouseValidator.getAll, warehouseController.getAll)
  .post(warehouseValidator.getAll, warehouseController.getAll);

router.route('/getWithPagination')
  .get(warehouseValidator.getWithPagination, warehouseController.getWithPagination)
  .post(warehouseValidator.getWithPagination, warehouseController.getWithPagination);

router.put('/:id', warehouseValidator.updateById, warehouseController.updateById);

router.post('/', warehouseValidator.create, warehouseController.create);

router.get('/primary', warehouseController.getPrimary);

export default router;
