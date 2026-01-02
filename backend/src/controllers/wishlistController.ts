import { Request, Response, NextFunction } from 'express';
import { HTTP_STATUS_CODE } from '../constants';
import { WishlistService } from '../services/concrete/wishlistService';
import { IApiResponse, IPaginationData, IWishlistAttributes } from '../interfaces';

const WISHLIST_SUCCESS_MESSAGES = {
  GET_SUCCESS: 'Wishlist retrieved successfully',
  CREATE_SUCCESS: 'Wishlist created successfully',
  UPDATE_SUCCESS: 'Wishlist updated successfully',
  DELETE_SUCCESS: 'Wishlist deleted successfully',
};

export default class WishlistController {
  wishlistService = new WishlistService();

  constructor() {}

  getOne = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const reqData = { ...req.query, ...req.body };
      const { filter, options } = this.wishlistService.generateFilter({ filters: reqData });
      // Add default population
      if (!options.populate) {
        options.populate = [
          { path: 'products.productId', select: 'name mainImage slug basePrice salePrice offerPrice status' }
        ];
      }
      
      const wishlist = await this.wishlistService.findOne(filter, options);

      const response: IApiResponse<IWishlistAttributes | null> = {
        status: HTTP_STATUS_CODE.OK.STATUS,
        code: HTTP_STATUS_CODE.OK.CODE,
        message: WISHLIST_SUCCESS_MESSAGES.GET_SUCCESS,
        data: wishlist,
      };
      return res.status(response.status).json(response);
    } catch (err) {
      return next(err);
    }
  };

  getAll = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const reqData = { ...req.query, ...req.body };
      const { filter, options } = this.wishlistService.generateFilter({ filters: reqData });
      const wishlistList = await this.wishlistService.findAll(filter, options);

      const response: IApiResponse<IWishlistAttributes[]> = {
        status: HTTP_STATUS_CODE.OK.STATUS,
        code: HTTP_STATUS_CODE.OK.CODE,
        message: WISHLIST_SUCCESS_MESSAGES.GET_SUCCESS,
        data: wishlistList,
      };
      return res.status(response.status).json(response);
    } catch (err) {
      return next(err);
    }
  };

  getWithPagination = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const reqData = { ...req.query, ...req.body };
      const { filter, options } = this.wishlistService.generateFilter({ filters: reqData });
      const wishlistList = await this.wishlistService.findAllWithPagination(filter, options);

      const response: IApiResponse<IPaginationData<IWishlistAttributes>> = {
        status: HTTP_STATUS_CODE.OK.STATUS,
        code: HTTP_STATUS_CODE.OK.CODE,
        message: WISHLIST_SUCCESS_MESSAGES.GET_SUCCESS,
        data: wishlistList,
      };
      return res.status(response.status).json(response);
    } catch (err) {
      return next(err);
    }
  };

  create = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const wishlistData = req.body;
      const newWishlist = await this.wishlistService.create(wishlistData, { userId: req.user?._id });

      const response: IApiResponse<IWishlistAttributes> = {
        status: HTTP_STATUS_CODE.CREATED.STATUS,
        code: HTTP_STATUS_CODE.CREATED.CODE,
        message: WISHLIST_SUCCESS_MESSAGES.CREATE_SUCCESS,
        data: newWishlist,
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
      await this.wishlistService.updateOne({ _id: id }, updateData, { userId: req.user._id });

      const response: IApiResponse = {
        status: HTTP_STATUS_CODE.OK.STATUS,
        code: HTTP_STATUS_CODE.OK.CODE,
        message: WISHLIST_SUCCESS_MESSAGES.UPDATE_SUCCESS,
      };
      return res.status(response.status).json(response);
    } catch (err) {
      return next(err);
    }
  };

  deleteByFilter = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const reqData = req.body;
      const { filter } = this.wishlistService.generateFilter({ filters: reqData });
      await this.wishlistService.softDelete(filter, { userId: req.user._id });

      const response: IApiResponse = {
        status: HTTP_STATUS_CODE.OK.STATUS,
        code: HTTP_STATUS_CODE.OK.CODE,
        message: WISHLIST_SUCCESS_MESSAGES.DELETE_SUCCESS,
      };
      return res.status(response.status).json(response);
    } catch (err) {
      return next(err);
    }
  };
}
