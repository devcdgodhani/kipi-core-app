import { Router } from 'express';
import { jwtAuth } from '../../middlewares/jwtAuth';
import AddressController from '../../controllers/addressController';
import AddressValidator from '../../validators/addressValidators';

const router = Router();
const addressController = new AddressController();
const addressValidator = new AddressValidator();

router.route('/getAll')
  .get(jwtAuth(), addressValidator.getAll, addressController.getAll)
  .post(jwtAuth(), addressValidator.getAll, addressController.getAll);

router.route('/getOne')
  .get(jwtAuth(), addressValidator.getOne, addressController.getOne)
  .post(jwtAuth(), addressValidator.getOne, addressController.getOne);

router.route('/')
  .post(jwtAuth(), addressValidator.create, addressController.create);

router.route('/:id')
  .put(jwtAuth(), addressValidator.updateById, addressController.updateById);

router.delete('/deleteByFilter', jwtAuth(), addressValidator.deleteByFilter, addressController.deleteByFilter);

export default router;
