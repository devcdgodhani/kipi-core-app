import { Router } from 'express';
import { flashDealController } from '../../controllers/flashDealController';
import { flashDealValidator } from '../../validators/flashDealValidators';

const router = Router();

router.route('/getOne').get(flashDealValidator.getOne, flashDealController.getOne).post(flashDealValidator.getOne, flashDealController.getOne);
router.route('/getAll').get(flashDealValidator.getAll, flashDealController.getAll).post(flashDealValidator.getAll, flashDealController.getAll);
router.route('/getWithPagination').get(flashDealValidator.getWithPagination, flashDealController.getWithPagination).post(flashDealValidator.getWithPagination, flashDealController.getWithPagination);
router.put('/:id', flashDealValidator.updateById, flashDealController.updateById);
router.post('/', flashDealValidator.create, flashDealController.create);
router.delete('/deleteByFilter', flashDealValidator.deleteByFilter, flashDealController.deleteByFilter);

export default router;
