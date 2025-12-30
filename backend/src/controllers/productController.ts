import { NextFunction, Request, Response } from 'express';
import { productService } from '../services/concrete/productService';
import { successResponse } from '../helpers';
import { BaseController } from './baseController';
import { IProduct, IProductAttributes } from '../interfaces';

export class ProductController extends BaseController<IProductAttributes, IProduct> {
  constructor() {
    super(productService, 'Product');
  }

  // Override create to use createWithVariants
  create = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const product = await productService.createWithVariants({
        ...req.body,
        createdBy: (req as any).user?._id
      });
      return res.status(201).json(successResponse(product, 'Product created successfully'));
    } catch (error) {
      next(error);
    }
  };

  // Override getOne to include SKUs and attributes population
  getOne = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const reqData = { ...req.query, ...req.body, ...req.params } as any;
      const { filter, options } = productService.generateFilter({
        filters: reqData,
      });
      
      const product = await productService.findOne(filter, options, [
        { path: 'category' },
        { 
          path: 'skus',
          populate: [
            { path: 'lotId' },
            { path: 'attributes.attributeId' }
          ]
        }
      ]);
      
      return res.status(200).json(successResponse(product, 'Product retrieved successfully'));
    } catch (error) {
      next(error);
    }
  };

  // Override getAll to include population
  getAll = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const reqData = { ...req.query, ...req.body } as any;
      const { filter, options } = productService.generateFilter({
        filters: reqData,
        searchFields: ['name', 'brand', 'slug']
      });
      
      const result = await productService.findAll(filter, options, [{ path: 'category' }, { path: 'skus' }, { path: 'supplierId' }]);
      return res.status(200).json(successResponse(result, 'Products retrieved successfully'));
    } catch (error) {
      next(error);
    }
  };

  // Override getWithPagination to include population
  getWithPagination = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const reqData = { ...req.query, ...req.body } as any;
      const { filter, options } = productService.generateFilter({
        filters: { ...reqData, isPaginate: true },
        searchFields: ['name', 'brand', 'slug']
      });
      
      const result = await productService.findAllWithPagination(filter, options, [{ path: 'category' }, { path: 'skus' }, { path: 'supplierId' }]);
      return res.status(200).json(successResponse(result, 'Products retrieved successfully'));
    } catch (error) {
      next(error);
    }
  };

  // Override getById to include SKUs
  getById = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const product = await productService.getWithSkus(id);
      return res.status(200).json(successResponse(product, 'Product retrieved successfully'));
    } catch (error) {
      next(error);
    }
  };

  // Override updateById to use updateWithVariants
  updateById = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const updated = await productService.updateWithVariants(id, req.body);
      return res.status(200).json(successResponse(updated, 'Product updated successfully'));
    } catch (error) {
      next(error);
    }
  };

  // Add update method for PUT /admin/products/:id
  update = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const updated = await productService.updateWithVariants(id, req.body);
      return res.status(200).json(successResponse(updated, 'Product updated successfully'));
    } catch (error) {
      next(error);
    }
  };
}

export const productController = new ProductController();
