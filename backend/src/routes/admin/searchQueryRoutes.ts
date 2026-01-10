import { Router } from 'express';
import { searchQueryController } from '../../controllers/searchQueryController';
import { searchQueryValidator } from '../../validators/searchQueryValidators';

const router = Router();

router.route('/getOne').get(searchQueryValidator.getOne, searchQueryController.getOne).post(searchQueryValidator.getOne, searchQueryController.getOne);
router.route('/getAll').get(searchQueryValidator.getAll, searchQueryController.getAll).post(searchQueryValidator.getAll, searchQueryController.getAll);
router.route('/getWithPagination').get(searchQueryValidator.getWithPagination, searchQueryController.getWithPagination).post(searchQueryValidator.getWithPagination, searchQueryController.getWithPagination);
router.put('/:id', searchQueryValidator.updateById, searchQueryController.updateById);
router.post('/', searchQueryValidator.create, searchQueryController.create);
router.delete('/deleteByFilter', searchQueryValidator.deleteByFilter, searchQueryController.deleteByFilter);

export default router;
