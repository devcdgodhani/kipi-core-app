import { NextFunction, Request, Response } from 'express';
import { recentlyViewedService } from '../services/concrete/recentlyViewedService';
import { HTTP_STATUS_CODE, RECENTLY_VIEWED_SUCCESS_MESSAGES } from '../constants';
import { IApiResponse } from '../interfaces';
import { TRecentlyViewedProductsRes } from '../types/recentlyViewed';

export class RecentlyViewedController {
  private get recentlyViewedService() { return recentlyViewedService; }

  trackView = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { productId } = req.body;
      const userId = req.user?._id?.toString();

      if (!userId) {
        throw new Error('User not authenticated');
      }

      await this.recentlyViewedService.trackView(userId, productId);

      const apiResponse: IApiResponse = {
        status: HTTP_STATUS_CODE.CREATED.STATUS,
        code: HTTP_STATUS_CODE.CREATED.CODE,
        message: RECENTLY_VIEWED_SUCCESS_MESSAGES.TRACK_SUCCESS,
      };

      res.status(apiResponse.status).json(apiResponse);
    } catch (err) {
      next(err);
    }
  };

  getRecentlyViewed = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.user?._id?.toString();
      const limit = req.query.limit ? parseInt(req.query.limit as string) : undefined;

      if (!userId) {
        throw new Error('User not authenticated');
      }

      const products = await this.recentlyViewedService.getRecentlyViewed(userId, limit);

      const apiResponse: TRecentlyViewedProductsRes = {
        status: HTTP_STATUS_CODE.OK.STATUS,
        code: HTTP_STATUS_CODE.OK.CODE,
        message: RECENTLY_VIEWED_SUCCESS_MESSAGES.GET_SUCCESS,
        data: products,
      };

      res.status(apiResponse.status).json(apiResponse);
    } catch (err) {
      next(err);
    }
  };
}

export const recentlyViewedController = new RecentlyViewedController();
