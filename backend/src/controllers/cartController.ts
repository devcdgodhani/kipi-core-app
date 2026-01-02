import { Request, Response, NextFunction } from 'express';
import { HTTP_STATUS_CODE } from '../constants';
import { CartService } from '../services/concrete/cartService';
import { IApiResponse, IPaginationData, ICartAttributes } from '../interfaces';

const CART_SUCCESS_MESSAGES = {
  GET_SUCCESS: 'Cart retrieved successfully',
  CREATE_SUCCESS: 'Cart created successfully',
  UPDATE_SUCCESS: 'Cart updated successfully',
  DELETE_SUCCESS: 'Cart deleted successfully',
};

export default class CartController {
  cartService = new CartService();

  constructor() {}

  /*********** Fetch carts ***********/
  getOne = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const reqData = { ...req.query, ...req.body };
      if (req.user?._id) reqData.userId = req.user._id;

      const { filter, options } = this.cartService.generateFilter({
        filters: reqData,
      });

      
      // Add default population for cart items
      if (!options.populate) {
        options.populate = [
          { path: 'items.productId', select: 'name mainImage slug' },
          { path: 'items.skuId', select: 'skuCode basePrice salePrice offerPrice media' }
        ];
      }

      const cart = await this.cartService.findOne(filter, options);

      const response: IApiResponse<ICartAttributes | null> = {
        status: HTTP_STATUS_CODE.OK.STATUS,
        code: HTTP_STATUS_CODE.OK.CODE,
        message: CART_SUCCESS_MESSAGES.GET_SUCCESS,
        data: cart,
      };

      return res.status(response.status).json(response);
    } catch (err) {
      return next(err);
    }
  };

  getAll = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const reqData = { ...req.query, ...req.body };
      const { filter, options } = this.cartService.generateFilter({
        filters: reqData,
      });

      const cartList = await this.cartService.findAll(filter, options);

      const response: IApiResponse<ICartAttributes[]> = {
        status: HTTP_STATUS_CODE.OK.STATUS,
        code: HTTP_STATUS_CODE.OK.CODE,
        message: CART_SUCCESS_MESSAGES.GET_SUCCESS,
        data: cartList,
      };
      return res.status(response.status).json(response);
    } catch (err) {
      return next(err);
    }
  };

  getWithPagination = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const reqData = { ...req.query, ...req.body };
      const { filter, options } = this.cartService.generateFilter({
        filters: reqData,
      });

      const cartList = await this.cartService.findAllWithPagination(filter, options);

      const response: IApiResponse<IPaginationData<ICartAttributes>> = {
        status: HTTP_STATUS_CODE.OK.STATUS,
        code: HTTP_STATUS_CODE.OK.CODE,
        message: CART_SUCCESS_MESSAGES.GET_SUCCESS,
        data: cartList,
      };

      return res.status(response.status).json(response);
    } catch (err) {
      return next(err);
    }
  };

  /*********** Create cart ***********/
  create = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const cartData = { ...req.body, userId: req.user?._id };
      const newCart = await this.cartService.create(cartData, { userId: req.user?._id });

      const response: IApiResponse<ICartAttributes> = {
        status: HTTP_STATUS_CODE.CREATED.STATUS,
        code: HTTP_STATUS_CODE.CREATED.CODE,
        message: CART_SUCCESS_MESSAGES.CREATE_SUCCESS,
        data: newCart,
      };
      return res.status(response.status).json(response);
    } catch (err) {
      return next(err);
    }
  };

  /*********** Update cart ***********/
  updateById = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const updateData = req.body;

      await this.cartService.updateOne({ _id: id }, updateData, { userId: req.user._id });

      const response: IApiResponse = {
        status: HTTP_STATUS_CODE.OK.STATUS,
        code: HTTP_STATUS_CODE.OK.CODE,
        message: CART_SUCCESS_MESSAGES.UPDATE_SUCCESS,
      };
      return res.status(response.status).json(response);
    } catch (err) {
      return next(err);
    }
  };

  /*********** Delete cart ***********/
  deleteByFilter = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const reqData = req.body;
      const { filter } = this.cartService.generateFilter({
        filters: reqData,
      });

      await this.cartService.softDelete(filter, { userId: req.user._id });

      const response: IApiResponse = {
        status: HTTP_STATUS_CODE.OK.STATUS,
        code: HTTP_STATUS_CODE.OK.CODE,
        message: CART_SUCCESS_MESSAGES.DELETE_SUCCESS,
      };
      return res.status(response.status).json(response);
    } catch (err) {
      return next(err);
    }
  };
}
