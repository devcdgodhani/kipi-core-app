import { NextFunction, Request, Response } from 'express';
import { attributeService } from '../services/concrete/attributeService';
import { HTTP_STATUS_CODE } from '../constants';
import { successResponse } from '../helpers';
import { BaseController } from './baseController';
import { IAttribute, IAttributeAttributes } from '../interfaces';

export class AttributeController extends BaseController<IAttributeAttributes, IAttribute> {
  constructor() {
    super(attributeService, 'Attribute');
  }

  // Override getAll to handle categoryId
  getAll = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const reqData = { ...req.query, ...req.body } as any;
      const { categoryId, isPaginate, search, ...filters } = reqData;

      let query = {
        ...filters,
        ...(search ? { 
          $or: [
            { name: { $regex: search, $options: 'i' } },
            { code: { $regex: search, $options: 'i' } } 
          ] 
        } : {})
      } as any;

      if (categoryId) {
        const { categoryService } = require('../services/concrete/categoryService');
        const attributeIds = await categoryService.getAttributes(categoryId as string, true);
        if (attributeIds && attributeIds.length > 0) {
          query._id = { $in: attributeIds };
        } else if (!search) {
          return res.status(200).json(successResponse([], 'No attributes linked to this category'));
        }
      }

      if (isPaginate === 'false' || isPaginate === false) {
        const attributes = await attributeService.findAll(query, { sort: { createdAt: -1 } });
        return res.status(200).json(successResponse(attributes, 'Attributes retrieved successfully'));
      }

      const { filter, options } = attributeService.generateFilter({
        filters: { ...reqData, isPaginate: true },
        searchFields: ['name', 'code']
      });

      // Mix in the category filter if present
      const finalFilter = { ...filter, ...query };

      const result = await attributeService.findAllWithPagination(finalFilter, options);
      return res.status(200).json(successResponse(result, 'Attributes retrieved successfully'));
    } catch (error) {
      next(error);
    }
  };
}

export const attributeController = new AttributeController();
