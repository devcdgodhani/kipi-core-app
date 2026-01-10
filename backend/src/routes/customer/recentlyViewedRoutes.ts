import { Router } from 'express';
import { jwtAuth } from '../../middlewares/jwtAuth';
import { recentlyViewedController } from '../../controllers/recentlyViewedController';
import { recentlyViewedValidator } from '../../validators/recentlyViewedValidators';

const router = Router();

// All routes require authentication
router.use(jwtAuth());

// Track product view
router.post('/trackView', recentlyViewedValidator.trackView, recentlyViewedController.trackView);

// Get user's recently viewed products
router.get('/getRecentlyViewed', recentlyViewedValidator.getRecentlyViewed, recentlyViewedController.getRecentlyViewed);

export default router;
