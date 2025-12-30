import { NextFunction, Request, Response } from 'express';
import { categoryService } from '../services/concrete/categoryService';
import { successResponse } from '../helpers';
import { BaseController } from './baseController';
import { ICategory, ICategoryAttributes } from '../interfaces';

export class CategoryController extends BaseController<ICategoryAttributes, ICategory> {
  constructor() {
    super(categoryService, 'Category');
  }

  getTree = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const tree = await categoryService.getTree();
      return res.status(200).json(successResponse(tree, 'Category tree retrieved successfully'));
    } catch (error) {
      next(error);
    }
  };

  // Override getOne to include attributes population
  getOne = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const reqData = { ...req.query, ...req.body, ...req.params } as any;
      const id = reqData._id || reqData.id;
      
      if (id) {
        const category = await categoryService.getWithAttributes(id);
        return res.status(200).json(successResponse(category, 'Category retrieved successfully'));
      }
      
      // Fallback to filter-based query
      const { filter, options } = categoryService.generateFilter({
        filters: reqData,
      });
      const category = await categoryService.findOne(filter, options, [{ path: 'attributes' }]);
      return res.status(200).json(successResponse(category, 'Category retrieved successfully'));
    } catch (error) {
      next(error);
    }
  };

  // Override getById to include attributes (maps to getOne)
  getById = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const category = await categoryService.getWithAttributes(id);
      return res.status(200).json(successResponse(category, 'Category retrieved successfully'));
    } catch (error) {
      next(error);
    }
  };
}

export const categoryController = new CategoryController();
