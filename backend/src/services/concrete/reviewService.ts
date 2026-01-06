import { ReviewModel, OrderModel } from '../../db/mongodb';
import { IReviewAttributes, IReviewDocument } from '../../interfaces/review';
import { MongooseCommonService } from './mongooseCommonService';
import { ApiError } from '../../helpers/apiError';
import { HTTP_STATUS_CODE } from '../../constants';
import { REVIEW_STATUS } from '../../constants/review';
import { FileStorageService } from './fileStorageService';

import { IReviewService } from '../contracts/reviewServiceInterface';

export class ReviewService extends MongooseCommonService<IReviewAttributes, IReviewDocument> implements IReviewService {
  private fileStorageService = new FileStorageService();

  constructor() {
    super(ReviewModel);
  }

  /**
   * Get reviews for a product with population and pre-signed URLs
   */
  async getProductReviews(productId: string, options: any = {}) {
    const filter = {
      productId,
      status: REVIEW_STATUS.APPROVED,
      isVisible: true
    };

    const populate = [
      { path: 'userId', select: 'firstName lastName email' },
      { path: 'images' }
    ];

    const result = await this.findAllWithPagination(filter, options, populate);

    // Enrich images with pre-signed URLs
    if (result.recordList) {
      for (const review of result.recordList) {
        if (review.images && review.images.length > 0) {
          for (let i = 0; i < review.images.length; i++) {
            const imageDoc = review.images[i] as any;
            if (imageDoc && imageDoc._id) {
               await this.fileStorageService.ensurePresignedUrl(imageDoc);
            }
          }
        }
      }
    }

    return result;
  }

  /**
   * Create a review with verified purchase check
   */
  async createReview(userId: string, data: any) {
    // 1. Check if user has purchased the product and order is DELIVERED
    const order = await OrderModel.findOne({
      userId,
      orderStatus: 'DELIVERED',
      'items.productId': data.productId,
      _id: data.orderId 
    });

    if (!order) {
      throw new ApiError(
        HTTP_STATUS_CODE.BAD_REQUEST.CODE,
        HTTP_STATUS_CODE.BAD_REQUEST.STATUS,
        'You can only review products from successfully delivered orders.'
      );
    }

    // 2. Check if user already reviewed this product for this order
    const existingReview = await ReviewModel.findOne({
      userId,
      productId: data.productId,
      orderId: data.orderId
    });

    if (existingReview) {
      throw new ApiError(
        HTTP_STATUS_CODE.BAD_REQUEST.CODE,
        HTTP_STATUS_CODE.BAD_REQUEST.STATUS,
        'You have already reviewed this product for this order.'
      );
    }

    // 3. Create review
    return this.create({
      ...data,
      userId,
      status: REVIEW_STATUS.PENDING // Force pending for moderation
    });
  }

  /**
   * Moderate review (Admin only)
   */
  async moderateReview(reviewId: string, status: REVIEW_STATUS, adminReply?: string) {
    const review = await this.findById(reviewId);
    if (!review) {
      throw new ApiError(HTTP_STATUS_CODE.NOTFOUND.CODE, HTTP_STATUS_CODE.NOTFOUND.STATUS, 'Review not found');
    }

    const updateData: any = { status };
    if (adminReply) updateData.adminReply = adminReply;

    return this.updateOne({ _id: reviewId }, updateData);
  }
}
