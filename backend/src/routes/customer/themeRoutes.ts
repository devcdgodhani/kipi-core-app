import { Router } from 'express';
import { themeController } from '../../controllers/themeController';
import { themeValidator } from '../../validators/themeValidators';

const router = Router();

// Open Route: Get Theme by App Name
router.get('/:appName', themeValidator.getByAppName, themeController.getThemeByAppName);

export default router;
