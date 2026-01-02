import { Router } from 'express';
import ReviewController from '../../controllers/reviewController';
// import ReviewValidator from '../../validators/reviewValidators'; // Assuming it exists or will be updated

const router = Router();
const reviewController = new ReviewController();

// Paginated reviews for Admin
router.post('/getAll', reviewController.getAdminReviews);

// Get details of a specific review
router.post('/getOne/:id', reviewController.getOne);

// Moderate review (Approve/Reject/Reply)
router.put('/moderate/:id', reviewController.moderateReview);

// Delete review
router.delete('/:id', reviewController.deleteById);

export default router;
