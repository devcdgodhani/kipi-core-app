import { Router } from 'express';
import { jwtAuth } from '../../middlewares/jwtAuth';
import AttributeController from '../../controllers/attributeController';
import AttributeValidator from '../../validators/attributeValidators';

const router = Router();
const attributeController = new AttributeController();
const attributeValidator = new AttributeValidator();

/***************** base crud structure*******************/
router.route('/getOne')
  .get(attributeValidator.getOne, attributeController.getOne)
  .post(attributeValidator.getOne, attributeController.getOne);

router.route('/getAll')
  .get(attributeValidator.getAll, attributeController.getAll)
  .post(attributeValidator.getAll, attributeController.getAll);

router.route('/getWithPagination')
  .get(attributeValidator.getWithPagination, attributeController.getWithPagination)
  .post(attributeValidator.getWithPagination, attributeController.getWithPagination);

router.put('/:id', attributeValidator.updateById, attributeController.updateById);

router.post('/', attributeValidator.create, attributeController.create);

router.delete('/deleteByFilter', attributeValidator.deleteByFilter, attributeController.deleteByFilter);

/****************************************************** */

export default router;
