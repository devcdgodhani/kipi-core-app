import { Router } from 'express';
import { customerAppSettingsController } from '../../controllers/customerAppSettingsController';
import { customerAppSettingsValidator } from '../../validators/customerAppSettingsValidators';
import { jwtAuth } from '../../middlewares';

const router = Router();

// Apply auth middleware to all routes
router.use(jwtAuth());

// Standard CRUD endpoints as per blueprint
// Custom endpoints
router.get('/active', customerAppSettingsController.getActiveSettings);
router.put('/update', customerAppSettingsValidator.updateSettings, customerAppSettingsController.updateSettings);

// Standard CRUD endpoints
router.post('/', customerAppSettingsValidator.create, customerAppSettingsController.create);
router.get('/getAll', customerAppSettingsValidator.getAll, customerAppSettingsController.getAll);
router.get('/getOne', customerAppSettingsValidator.getOne, customerAppSettingsController.getOne);
router.get('/getWithPagination', customerAppSettingsValidator.getWithPagination, customerAppSettingsController.getWithPagination);
router.put('/:id', customerAppSettingsValidator.updateById, customerAppSettingsController.updateById);
router.delete('/deleteByFilter', customerAppSettingsValidator.deleteByFilter, customerAppSettingsController.deleteByFilter);

export default router;
