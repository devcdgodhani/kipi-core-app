import { Request, Response, NextFunction } from 'express';
import { HTTP_STATUS_CODE, CATEGORY_SUCCESS_MESSAGES } from '../constants';
import { CategoryService } from '../services/concrete/categoryService';
import { 
  TCategoryCreateReq, 
  TCategoryUpdateReq, 
  TCategoryRes, 
  TCategoryListRes, 
  TCategoryListPaginationRes,
  TCategoryTreeRes
} from '../types/category';
import { IApiResponse } from '../interfaces';
import slugify from 'slugify';

export default class CategoryController {
  private categoryService = new CategoryService();

  /*********** Fetch Categories ***********/
  getOne = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const reqData = { ...req.query, ...req.body };
      const { filter, options } = this.categoryService.generateFilter({
        filters: reqData,
      });

      const category = await this.categoryService.findOne(filter, options);

      const response: TCategoryRes = {
        status: HTTP_STATUS_CODE.OK.STATUS,
        code: HTTP_STATUS_CODE.OK.CODE,
        message: CATEGORY_SUCCESS_MESSAGES.GET_SUCCESS,
        data: category as any,
      };

      return res.status(response.status).json(response);
    } catch (err) {
      return next(err);
    }
  };

  getAll = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const reqData = { ...req.query, ...req.body };
      const { filter, options } = this.categoryService.generateFilter({
        filters: reqData,
      });

      if (reqData.isTree) {
        const treeData = await this.categoryService.getTree(filter);
        const response: TCategoryTreeRes = {
            status: HTTP_STATUS_CODE.OK.STATUS,
            code: HTTP_STATUS_CODE.OK.CODE,
            message: CATEGORY_SUCCESS_MESSAGES.GET_SUCCESS,
            data: treeData as any,
          };
        return res.status(response.status).json(response);
      }

      const categories = await this.categoryService.findAll(filter, options);

      const response: TCategoryListRes = {
        status: HTTP_STATUS_CODE.OK.STATUS,
        code: HTTP_STATUS_CODE.OK.CODE,
        message: CATEGORY_SUCCESS_MESSAGES.GET_SUCCESS,
        data: categories as any,
      };
      return res.status(response.status).json(response);
    } catch (err) {
      return next(err);
    }
  };

  getWithPagination = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const reqData = { ...req.query, ...req.body };
      const { filter, options } = this.categoryService.generateFilter({
        filters: reqData,
      });

      // Populate parent details
      options.populate = [{ path: 'parentId', select: 'name slug' }];

      const categoryList = await this.categoryService.findAllWithPagination(filter, options);

      const response: TCategoryListPaginationRes = {
        status: HTTP_STATUS_CODE.OK.STATUS,
        code: HTTP_STATUS_CODE.OK.CODE,
        message: CATEGORY_SUCCESS_MESSAGES.GET_SUCCESS,
        data: categoryList as any,
      };

      return res.status(response.status).json(response);
    } catch (err) {
      return next(err);
    }
  };

  /*********** Create Category ***********/
  create = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const reqData: TCategoryCreateReq = req.body;
      const slug = slugify(reqData.name, { lower: true });
      const createData = { ...reqData, slug };
      
      const newCategory = await this.categoryService.create(createData as any, { userId: req.user?._id });

      const response: TCategoryRes = {
        status: HTTP_STATUS_CODE.CREATED.STATUS,
        code: HTTP_STATUS_CODE.CREATED.CODE,
        message: CATEGORY_SUCCESS_MESSAGES.CREATE_SUCCESS,
        data: newCategory as any,
      };
      return res.status(response.status).json(response);
    } catch (err) {
      return next(err);
    }
  };

  /*********** Update Category ***********/
  updateById = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const updateData: TCategoryUpdateReq = req.body;

      if (updateData.name) {
        (updateData as any).slug = slugify(updateData.name, { lower: true });
      }

      await this.categoryService.updateOne({ _id: id }, updateData as any, { userId: req.user?._id });

      const response: IApiResponse = {
        status: HTTP_STATUS_CODE.OK.STATUS,
        code: HTTP_STATUS_CODE.OK.CODE,
        message: CATEGORY_SUCCESS_MESSAGES.UPDATE_SUCCESS,
      };
      return res.status(response.status).json(response);
    } catch (err) {
      return next(err);
    }
  };

  /*********** Delete Category ***********/
  deleteByFilter = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const reqData = req.body;
      const { filter } = this.categoryService.generateFilter({
        filters: reqData,
      });

      await this.categoryService.softDelete(filter, { userId: req.user?._id });

      const response: IApiResponse = {
        status: HTTP_STATUS_CODE.OK.STATUS,
        code: HTTP_STATUS_CODE.OK.CODE,
        message: CATEGORY_SUCCESS_MESSAGES.DELETE_SUCCESS,
      };
      return res.status(response.status).json(response);
    } catch (err) {
      return next(err);
    }
  };
}
