import { Request, Response, NextFunction } from 'express';
import { HTTP_STATUS_CODE } from '../constants';
import { ProductService } from '../services/concrete/productService';
import { 
  TProductCreateReq, 
  TProductUpdateReq, 
  TProductRes, 
  TProductListRes, 
  TProductListPaginationRes 
} from '../types/product';
import { IApiResponse } from '../interfaces';
import slugify from 'slugify';
import { FileStorageModel, SkuModel, ProductModel } from '../db/mongodb';

export default class ProductController {
  private productService = new ProductService();

  /*********** Fetch Products ***********/
  getOne = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const reqData = { ...req.query, ...req.body };
      const { filter, options } = this.productService.generateFilter({
        filters: reqData,
      });
      const productDoc = await this.productService.findOne(filter);
      let product = productDoc as any;

      if (product) {
          // Sanitize fields that might cause CastError during population if they contain empty strings
          if (product.mainImage === '') delete product.mainImage;
          if (product.media) {
              product.media = product.media.map((m: any) => {
                  if (m.fileStorageId === '') {
                      const { fileStorageId, ...rest } = m;
                      return rest;
                  }
                  return m;
              });
          }

          // Manually perform population on the sanitized object
          product = await ProductModel.populate(product, [
              { path: 'categoryIds', select: 'name slug' },
              { path: 'attributes.attributeId', select: 'name key label type' },
              { path: 'media.fileStorageId' },
              { path: 'mainImage' }
          ]);
      }

      const response: TProductRes = {
        status: HTTP_STATUS_CODE.OK.STATUS,
        code: HTTP_STATUS_CODE.OK.CODE,
        message: 'Product fetched successfully',
        data: product,
      };

      return res.status(response.status).json(response);
    } catch (err) {
      return next(err);
    }
  };

  getAll = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const reqData = { ...req.query, ...req.body };
      const { filter, options } = this.productService.generateFilter({
        filters: reqData,
      });

      const products = await this.productService.findAll(filter, options);

      const response: TProductListRes = {
        status: HTTP_STATUS_CODE.OK.STATUS,
        code: HTTP_STATUS_CODE.OK.CODE,
        message: 'Products fetched successfully',
        data: products as any,
      };
      return res.status(response.status).json(response);
    } catch (err) {
      return next(err);
    }
  };

  getWithPagination = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const reqData = { ...req.query, ...req.body };
      const { filter, options } = this.productService.generateFilter({
        filters: reqData,
      });
      
       options.populate = [
          { path: 'categoryIds', select: 'name slug' }
      ];

      const productList = await this.productService.findAllWithPagination(filter, options);

      const response: TProductListPaginationRes = {
        status: HTTP_STATUS_CODE.OK.STATUS,
        code: HTTP_STATUS_CODE.OK.CODE,
        message: 'Products fetched successfully (paginated)',
        data: productList as any,
      };

      return res.status(response.status).json(response);
    } catch (err) {
      return next(err);
    }
  };

  /*********** Create Product ***********/
  create = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { skus, ...reqData }: TProductCreateReq = req.body;
      const slug = slugify(reqData.name, { lower: true });
      const createData = { ...reqData, slug };
      
      const newProduct = await this.productService.create(createData as any, { userId: req.user?._id });

      // Sync SKUs
      if (skus) {
          await this.productService.syncSkus(newProduct, skus, req.user?._id);
      }

      const response: TProductRes = {
        status: HTTP_STATUS_CODE.CREATED.STATUS,
        code: HTTP_STATUS_CODE.CREATED.CODE,
        message: 'Product created successfully',
        data: newProduct as any,
      };
      return res.status(response.status).json(response);
    } catch (err) {
      return next(err);
    }
  };

  /*********** Update Product ***********/
  updateById = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const { skus, ...updateData }: TProductUpdateReq = req.body;

      if (updateData.name) {
        (updateData as any).slug = slugify(updateData.name, { lower: true });
      }

      await this.productService.updateOne({ _id: id }, updateData as any, { userId: req.user?._id });

      // Sync SKUs if provided
      if (skus) {
          const product = await this.productService.findById(id);
          if (product) {
              await this.productService.syncSkus(product, skus, req.user?._id);
          }
      }

      const response: IApiResponse = {
        status: HTTP_STATUS_CODE.OK.STATUS,
        code: HTTP_STATUS_CODE.OK.CODE,
        message: 'Product updated successfully',
      };
      return res.status(response.status).json(response);
    } catch (err) {
      return next(err);
    }
  };

  /*********** Delete Product ***********/
  deleteByFilter = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const reqData = req.body;
      // Ideally check SKUs before delete? Or cascade delete?
      // Soft delete usually hides product. SKUs might also need hiding.
      // For now, simple product delete.
      const { filter } = this.productService.generateFilter({
        filters: reqData,
      });

      await this.productService.softDelete(filter, { userId: req.user?._id });

      const response: IApiResponse = {
        status: HTTP_STATUS_CODE.OK.STATUS,
        code: HTTP_STATUS_CODE.OK.CODE,
        message: 'Product deleted successfully',
      };
      return res.status(response.status).json(response);
    } catch (err) {
      return next(err);
    }
  };
}
