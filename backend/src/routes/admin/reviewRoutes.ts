import { Router } from 'express';
import ReviewController from '../../controllers/reviewController';
// import ReviewValidator from '../../validators/reviewValidators'; // Assuming it exists or will be updated

const router = Router();
const reviewController = new ReviewController();

/***************** base crud structure*******************/
router.route('/getOne')
  .get(reviewController.getOne)
  .post(reviewController.getOne);

router.route('/getWithPagination')
  .get(reviewController.getAdminReviews)
  .post(reviewController.getAdminReviews);

// Legacy route for backward compatibility
router.post('/getAll', reviewController.getAdminReviews);

/***************** specialized routes *******************/
// Get details of a specific review
router.post('/getOne/:id', reviewController.getOne);

// Moderate review (Approve/Reject/Reply)
router.put('/moderate/:id', reviewController.moderateReview);

// Delete review
router.delete('/:id', reviewController.deleteById);
router.get('/:id', reviewController.getOne); // Alias for convenience

export default router;
