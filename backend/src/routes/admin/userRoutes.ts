import { Router } from 'express';
import { jwtAuth } from '../../middlewares/jwtAuth';
import UserController from '../../controllers/userController';
import UserValidator from '../../validators/userValidators';

const router = Router();
const userController = new UserController();
const userValidator = new UserValidator();

/***************** base crud structure*******************/
router.get('/getOne', userValidator.getOne, userController.getOne);

router.get('/getAll', userValidator.getAll, userController.getAll);

router.get('/getWithPagination', userValidator.getWithPagination, userController.getWithPagination);

router.put('/:id', userValidator.updateById, userController.updateById);

router.post('/', userValidator.create, userController.create);

router.delete('/deleteByFilter', userValidator.deleteByFilter, userController.deleteByFilter);

/****************************************************** */

export default router;
