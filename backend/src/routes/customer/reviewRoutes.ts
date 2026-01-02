import { Router } from 'express';
import { jwtAuth } from '../../middlewares/jwtAuth';
import ReviewController from '../../controllers/reviewController';

const router = Router();
const reviewController = new ReviewController();

// Get approved reviews for a product (Public)
router.post('/product/:productId', reviewController.getProductReviews);

// Submit a review (Protected)
router.post('/submit', jwtAuth(), reviewController.submitProductReview);

export default router;
