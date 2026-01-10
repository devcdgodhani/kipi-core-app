import { Router } from 'express';
import { searchQueryController } from '../../controllers/searchQueryController';
import { searchQueryValidator } from '../../validators/searchQueryValidators';

const router = Router();

router.get('/trending', searchQueryController.getTrending);
router.get('/suggestions', searchQueryController.getSuggestions);
router.post('/track', searchQueryValidator.trackSearch, searchQueryController.trackSearch);

export default router;
