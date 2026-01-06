import { IReviewAttributes, IReviewDocument } from '../../interfaces/review';
import { IMongooseCommonService } from './mongooseCommonServiceInterface';

import { REVIEW_STATUS } from '../../constants/review';

export interface IReviewService extends IMongooseCommonService<IReviewAttributes, IReviewDocument> {
  getProductReviews(productId: string, options?: any): Promise<any>;
  createReview(userId: string, data: any): Promise<IReviewAttributes>;
  moderateReview(reviewId: string, status: REVIEW_STATUS, adminReply?: string): Promise<any>;
}

