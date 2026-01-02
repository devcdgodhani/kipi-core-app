import { Request, Response, NextFunction } from 'express';
import { HTTP_STATUS_CODE } from '../constants';
import { ReviewService } from '../services/concrete/reviewService';
import { IApiResponse, IPaginationData, IReviewAttributes } from '../interfaces';

const REVIEW_SUCCESS_MESSAGES = {
  GET_SUCCESS: 'Review retrieved successfully',
  CREATE_SUCCESS: 'Review submitted successfully. It will be visible after moderation.',
  UPDATE_SUCCESS: 'Review updated successfully',
  DELETE_SUCCESS: 'Review deleted successfully',
  MODERATION_SUCCESS: 'Review status updated successfully'
};

export default class ReviewController {
  reviewService = new ReviewService();

  constructor() {}

  /**
   * Submit a review (Customer)
   */
  submitProductReview = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const reviewData = req.body;
      const userId = req.user?._id;
      
      const newReview = await this.reviewService.createReview(userId.toString(), reviewData);

      const response: IApiResponse<IReviewAttributes> = {
        status: HTTP_STATUS_CODE.CREATED.STATUS,
        code: HTTP_STATUS_CODE.CREATED.CODE,
        message: REVIEW_SUCCESS_MESSAGES.CREATE_SUCCESS,
        data: newReview,
      };
      return res.status(response.status).json(response);
    } catch (err) {
      return next(err);
    }
  };

  /**
   * Get approved reviews for a product (Public)
   */
  getProductReviews = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { productId } = req.params;
      const reqData = { ...req.query, ...req.body };
      const { options } = this.reviewService.generateFilter({ filters: reqData });
      
      const reviewList = await this.reviewService.getProductReviews(productId, options);

      const response: IApiResponse<IPaginationData<IReviewAttributes>> = {
        status: HTTP_STATUS_CODE.OK.STATUS,
        code: HTTP_STATUS_CODE.OK.CODE,
        message: REVIEW_SUCCESS_MESSAGES.GET_SUCCESS,
        data: reviewList,
      };
      return res.status(response.status).json(response);
    } catch (err) {
      return next(err);
    }
  };

  /**
   * Moderate review (Admin)
   */
  moderateReview = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const { status, adminReply } = req.body;
      
      await this.reviewService.moderateReview(id, status, adminReply);

      const response: IApiResponse = {
        status: HTTP_STATUS_CODE.OK.STATUS,
        code: HTTP_STATUS_CODE.OK.CODE,
        message: REVIEW_SUCCESS_MESSAGES.MODERATION_SUCCESS,
      };
      return res.status(response.status).json(response);
    } catch (err) {
      return next(err);
    }
  };

  /**
   * Admin: Get all reviews with pagination
   */
  getAdminReviews = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const reqData = { ...req.query, ...req.body };
      const { filter, options } = this.reviewService.generateFilter({ filters: reqData });
      
      const populate = [
        { path: 'userId', select: 'firstName lastName email' },
        { path: 'productId', select: 'name' },
        { path: 'images' }
      ];

      const reviewList = await this.reviewService.findAllWithPagination(filter, options, populate);

      const response: IApiResponse<IPaginationData<IReviewAttributes>> = {
        status: HTTP_STATUS_CODE.OK.STATUS,
        code: HTTP_STATUS_CODE.OK.CODE,
        message: REVIEW_SUCCESS_MESSAGES.GET_SUCCESS,
        data: reviewList,
      };
      return res.status(response.status).json(response);
    } catch (err) {
      return next(err);
    }
  };

  getOne = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const review = await this.reviewService.findById(id, [
        { path: 'userId', select: 'firstName lastName email' },
        { path: 'productId', select: 'name' },
        { path: 'images' }
      ]);

      const response: IApiResponse<IReviewAttributes | null> = {
        status: HTTP_STATUS_CODE.OK.STATUS,
        code: HTTP_STATUS_CODE.OK.CODE,
        message: REVIEW_SUCCESS_MESSAGES.GET_SUCCESS,
        data: review,
      };
      return res.status(response.status).json(response);
    } catch (err) {
      return next(err);
    }
  };

  deleteById = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      await this.reviewService.softDelete({ _id: id }, { userId: req.user._id });

      const response: IApiResponse = {
        status: HTTP_STATUS_CODE.OK.STATUS,
        code: HTTP_STATUS_CODE.OK.CODE,
        message: REVIEW_SUCCESS_MESSAGES.DELETE_SUCCESS,
      };
      return res.status(response.status).json(response);
    } catch (err) {
      return next(err);
    }
  };
}
