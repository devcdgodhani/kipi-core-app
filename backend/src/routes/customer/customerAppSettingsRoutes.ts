import { Router } from 'express';
import { customerAppSettingsController } from '../../controllers/customerAppSettingsController';

const router = Router();

// Public endpoint - no auth required
router.get('/active', customerAppSettingsController.getActiveSettings);

export default router;
