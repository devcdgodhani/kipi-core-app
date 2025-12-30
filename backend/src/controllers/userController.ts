import { Request, Response, NextFunction } from 'express';
import { HTTP_STATUS_CODE, USER_SUCCESS_MESSAGES } from '../constants';
import { UserService } from '../services';
import { IApiResponse, IPaginationData, IUserAttributes } from '../interfaces';

export default class UserController {
  userService = new UserService();

  constructor() {}

  /*********** Fetch users ***********/
  getOne = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const reqData = req.body;
      const { filter, options } = this.userService.generateFilter({
        filters: reqData,
        // searchFields: ['email'],
      });

      const user = await this.userService.findOne(filter, options);

      const response: IApiResponse<IUserAttributes | null> = {
        status: HTTP_STATUS_CODE.OK.STATUS,
        code: HTTP_STATUS_CODE.OK.CODE,
        message: USER_SUCCESS_MESSAGES.GET_SUCCESS,
        data: user,
      };

      return res.status(response.status).json(response);
    } catch (err) {
      return next(err);
    }
  };

  getAll = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const reqData = req.body;
      const { filter, options } = this.userService.generateFilter({
        filters: reqData,
        // searchFields: ['email'],
      });

      const userList = await this.userService.findAll(filter, options);

      const response: IApiResponse<IUserAttributes[]> = {
        status: HTTP_STATUS_CODE.OK.STATUS,
        code: HTTP_STATUS_CODE.OK.CODE,
        message: USER_SUCCESS_MESSAGES.GET_SUCCESS,
        data: userList,
      };
      return res.status(response.status).json(response);
    } catch (err) {
      return next(err);
    }
  };

  getWithPagination = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const reqData = req.body;
      const { filter, options } = this.userService.generateFilter({
        filters: reqData,
        // searchFields: ['email'],
      });

      const userList = await this.userService.findAllWithPagination(filter, options);

      const response: IApiResponse<IPaginationData<IUserAttributes>> = {
        status: HTTP_STATUS_CODE.OK.STATUS,
        code: HTTP_STATUS_CODE.OK.CODE,
        message: USER_SUCCESS_MESSAGES.GET_SUCCESS,
        data: userList,
      };

      return res.status(response.status).json(response);
    } catch (err) {
      return next(err);
    }
  };

  /*********** Create users ***********/
  create = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const response = {
        status: HTTP_STATUS_CODE.CREATED.STATUS,
        code: HTTP_STATUS_CODE.CREATED.CODE,
        message: USER_SUCCESS_MESSAGES.CREATE_SUCCESS,
      };
      return res.status(response.status).json(response);
    } catch (err) {
      return next(err);
    }
  };

  /*********** Update users ***********/
  updateManyByFilter = async (req: Request, res: Response, next: NextFunction) => {
    try {
      let reqData = req.body;
      if (!Array.isArray(reqData)) reqData = [reqData];
      for (const updateData of reqData) {
        const { filter } = this.userService.generateFilter({
          filters: updateData.filter,
        });
        await this.userService.update(filter, updateData.update, { userId: req.user._id });
      }
      const response: IApiResponse = {
        status: HTTP_STATUS_CODE.OK.STATUS,
        code: HTTP_STATUS_CODE.OK.CODE,
        message: USER_SUCCESS_MESSAGES.UPDATE_SUCCESS,
      };
      return res.status(response.status).json(response);
    } catch (err) {
      return next(err);
    }
  };

  updateOneByFilter = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const reqData = req.body;
      const { filter } = this.userService.generateFilter({
        filters: reqData.filter,
      });
      await this.userService.updateOne(filter, reqData.update, { userId: req.user._id });

      const response: IApiResponse = {
        status: HTTP_STATUS_CODE.OK.STATUS,
        code: HTTP_STATUS_CODE.OK.CODE,
        message: USER_SUCCESS_MESSAGES.UPDATE_SUCCESS,
      };
      return res.status(response.status).json(response);
    } catch (err) {
      return next(err);
    }
  };

  /*********** Delete users ***********/
  deleteByFilter = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const reqData = req.body;
      const { filter } = this.userService.generateFilter({
        filters: reqData,
      });

      await this.userService.softDelete(filter, { userId: req.user._id });

      const response: IApiResponse = {
        status: HTTP_STATUS_CODE.OK.STATUS,
        code: HTTP_STATUS_CODE.OK.CODE,
        message: USER_SUCCESS_MESSAGES.DELETE_SUCCESS,
      };
      return res.status(response.status).json(response);
    } catch (err) {
      return next(err);
    }
  };
}
