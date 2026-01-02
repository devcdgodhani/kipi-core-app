import { Request, Response, NextFunction } from 'express';
import { HTTP_STATUS_CODE } from '../constants';
import { ReviewService } from '../services/concrete/reviewService';
import { IApiResponse, IPaginationData, IReviewAttributes } from '../interfaces';

const REVIEW_SUCCESS_MESSAGES = {
  GET_SUCCESS: 'Review retrieved successfully',
  CREATE_SUCCESS: 'Review created successfully',
  UPDATE_SUCCESS: 'Review updated successfully',
  DELETE_SUCCESS: 'Review deleted successfully',
};

export default class ReviewController {
  reviewService = new ReviewService();

  constructor() {}

  getOne = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const reqData = { ...req.query, ...req.body };
      const { filter, options } = this.reviewService.generateFilter({ filters: reqData });
      const review = await this.reviewService.findOne(filter, options);

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

  getAll = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const reqData = { ...req.query, ...req.body };
      const { filter, options } = this.reviewService.generateFilter({ filters: reqData });
      const reviewList = await this.reviewService.findAll(filter, options);

      const response: IApiResponse<IReviewAttributes[]> = {
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

  getWithPagination = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const reqData = { ...req.query, ...req.body };
      const { filter, options } = this.reviewService.generateFilter({ filters: reqData });
      const reviewList = await this.reviewService.findAllWithPagination(filter, options);

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

  create = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const reviewData = req.body;
      const newReview = await this.reviewService.create(reviewData, { userId: req.user?._id });

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

  updateById = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const updateData = req.body;
      await this.reviewService.updateOne({ _id: id }, updateData, { userId: req.user._id });

      const response: IApiResponse = {
        status: HTTP_STATUS_CODE.OK.STATUS,
        code: HTTP_STATUS_CODE.OK.CODE,
        message: REVIEW_SUCCESS_MESSAGES.UPDATE_SUCCESS,
      };
      return res.status(response.status).json(response);
    } catch (err) {
      return next(err);
    }
  };

  deleteByFilter = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const reqData = req.body;
      const { filter } = this.reviewService.generateFilter({ filters: reqData });
      await this.reviewService.softDelete(filter, { userId: req.user._id });

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
