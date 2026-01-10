import { Router } from 'express';
import { jwtAuth } from '../../middlewares/jwtAuth';
import { addressController } from '../../controllers/addressController';
import { addressValidator } from '../../validators/addressValidators';

const router = Router();

router.route('/getAll')
  .get(jwtAuth(), addressValidator.getAll, addressController.getMyAddresses)
  .post(jwtAuth(), addressValidator.getAll, addressController.getMyAddresses);

router.route('/getOne')
  .get(jwtAuth(), addressValidator.getOne, addressController.getOne)
  .post(jwtAuth(), addressValidator.getOne, addressController.getOne);

router.route('/')
  .post(jwtAuth(), addressValidator.create, addressController.create);

router.route('/:id')
  .put(jwtAuth(), addressValidator.updateById, addressController.updateById);

router.delete('/deleteByFilter', jwtAuth(), addressValidator.deleteByFilter, addressController.deleteByFilter);

export default router;
