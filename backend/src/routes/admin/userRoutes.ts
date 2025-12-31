import { Router } from 'express';
import { jwtAuth } from '../../middlewares/jwtAuth';
import UserController from '../../controllers/userController';
import UserValidator from '../../validators/userValidators';

const router = Router();
const userController = new UserController();
const userValidator = new UserValidator();

/***************** base crud structure*******************/
router.route('/getOne')
  .get(userValidator.getOne, userController.getOne)
  .post(userValidator.getOne, userController.getOne);

router.route('/getAll')
  .get(userValidator.getAll, userController.getAll)
  .post(userValidator.getAll, userController.getAll);

router.route('/getWithPagination')
  .get(userValidator.getWithPagination, userController.getWithPagination)
  .post(userValidator.getWithPagination, userController.getWithPagination);

router.put('/:id', userValidator.updateById, userController.updateById);

router.post('/', userValidator.create, userController.create);

router.delete('/deleteByFilter', userValidator.deleteByFilter, userController.deleteByFilter);

/****************************************************** */

export default router;
