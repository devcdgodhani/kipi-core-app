import { Router } from 'express';
import { themeController } from '../../controllers/themeController';
import { themeValidator } from '../../validators/themeValidators';
import { jwtAuth } from '../../middlewares';

const router = Router();

// Protect all routes with Admin Auth

// App Name specific routes (Primary usage)
router.get('/:appName', themeValidator.getByAppName, themeController.getThemeByAppName);
router.put('/:appName', themeValidator.updateByAppName, themeController.updateThemeByAppName);

// Standard CRUD (Distinct paths)
router.post('/create', themeValidator.create, themeController.create);
router.get('/:id', themeValidator.getOne, themeController.getOne);
router.put('/:id', themeValidator.updateById, themeController.updateById);
router.get('/getAll', themeValidator.getAll, themeController.getAll);
router.get('/getWithPagination', themeValidator.getWithPagination, themeController.getWithPagination);
router.delete('/filter/delete', themeValidator.deleteByFilter, themeController.deleteByFilter);



export default router;
