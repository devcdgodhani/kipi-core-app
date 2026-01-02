import { Router } from 'express';
import { jwtAuth } from '../../middlewares/jwtAuth';
import AddressController from '../../controllers/addressController';
import AddressValidator from '../../validators/addressValidators';

const router = Router();
const addressController = new AddressController();
const addressValidator = new AddressValidator();

/***************** base crud structure*******************/
router.route('/getOne')
  .get(addressValidator.getOne, addressController.getOne)
  .post(addressValidator.getOne, addressController.getOne);

router.route('/getAll')
  .get(addressValidator.getAll, addressController.getAll)
  .post(addressValidator.getAll, addressController.getAll);

router.route('/getWithPagination')
  .get(addressValidator.getWithPagination, addressController.getWithPagination)
  .post(addressValidator.getWithPagination, addressController.getWithPagination);

router.put('/:id', addressValidator.updateById, addressController.updateById);

router.post('/', addressValidator.create, addressController.create);

router.delete('/deleteByFilter', addressValidator.deleteByFilter, addressController.deleteByFilter);

/****************************************************** */

export default router;
