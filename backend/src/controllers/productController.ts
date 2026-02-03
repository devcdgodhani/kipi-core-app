import { NextFunction, Request, Response } from 'express';
import { productService } from '../services/concrete/productService';
import { skuService } from '../services/concrete/skuService';
import { HTTP_STATUS_CODE, PRODUCT_SUCCESS_MESSAGES } from '../constants';
import { IApiResponse, IPaginationData } from '../interfaces';
import { IProductAttributes } from '../interfaces/product';
import { TProductListPaginationRes, TProductListRes, TProductRes } from '../types/product';
import { enrichProductWithPresignedUrls } from '../helpers';

export class ProductController {
  private get productService() { return productService; }
  private get skuService() { return skuService; }

  getAll = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { filter } = this.productService.generateFilter({
        filters: { ...req.query, ...req.body },
      });
      const response = await this.productService.findAll(filter, {}, [
        { path: 'media.fileStorageId' }, 
        { path: 'mainImage' }
      ]);
      
      if (Array.isArray(response)) {
        await Promise.all(response.map(p => enrichProductWithPresignedUrls(p)));
      }

      const apiResponse: TProductListRes = {
        status: HTTP_STATUS_CODE.OK.STATUS,
        code: HTTP_STATUS_CODE.OK.CODE,
        message: PRODUCT_SUCCESS_MESSAGES.GET_SUCCESS,
        data: response,
      };

      res.status(apiResponse.status).json(apiResponse);
    } catch (err) {
      next(err);
    }
  };

  getOne = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { filter } = this.productService.generateFilter({
        filters: req.body,
      });
      const response = await this.productService.findOne(filter, {}, [
        { path: 'media.fileStorageId' }, 
        { path: 'mainImage' }
      ]);
      
      if (response && (response as any)._id) {
          const skus = await this.skuService.findAll(
            { productId: (response as any)._id } as any,
            {},
            [{ path: 'media.fileStorageId' }]
          );
          (response as any).skus = skus;
      }

      await enrichProductWithPresignedUrls(response);

      const apiResponse: TProductRes = {
        status: HTTP_STATUS_CODE.OK.STATUS,
        code: HTTP_STATUS_CODE.OK.CODE,
        message: PRODUCT_SUCCESS_MESSAGES.GET_SUCCESS,
        data: response,
      };

      res.status(apiResponse.status).json(apiResponse);
    } catch (err) {
      next(err);
    }
  };

  getWithPagination = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const reqData: any = { ...req.query, ...req.body };
      
      if (reqData.sortBy) {
          const sortOrder = reqData.sortOrder === 'asc' ? 1 : -1;
          reqData.order = { [reqData.sortBy]: sortOrder };
          delete reqData.sortBy;
          delete reqData.sortOrder;
      }

      const { filter, options } = this.productService.generateFilter({
        filters: reqData,
      });
      const response = await this.productService.findAllWithPagination(
        filter,
        options,
        [
          { path: 'media.fileStorageId' }, 
          { path: 'mainImage' }
        ]
      );

      if (response.recordList && Array.isArray(response.recordList)) {
        await Promise.all(response.recordList.map(p => enrichProductWithPresignedUrls(p)));
      }

      const apiResponse: TProductListPaginationRes = {
        status: HTTP_STATUS_CODE.OK.STATUS,
        code: HTTP_STATUS_CODE.OK.CODE,
        message: PRODUCT_SUCCESS_MESSAGES.GET_SUCCESS,
        data: response,
      };

      res.status(apiResponse.status).json(apiResponse);
    } catch (err) {
      next(err);
    }
  };

  create = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { skus, ...productData } = req.body;
      const response = await this.productService.create(productData, { userId: req.user?._id });
      
      if (skus && Array.isArray(skus)) {
          await this.productService.syncSkus(response, skus, req.user?._id);
      }

      const apiResponse: TProductRes = {
        status: HTTP_STATUS_CODE.CREATED.STATUS,
        code: HTTP_STATUS_CODE.CREATED.CODE,
        message: PRODUCT_SUCCESS_MESSAGES.CREATE_SUCCESS,
        data: response,
      };

      res.status(apiResponse.status).json(apiResponse);
    } catch (err) {
      next(err);
    }
  };

  updateById = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { skus, ...updateData } = req.body;
      const response = await this.productService.update({ _id: req.params.id }, updateData);
      
      if (skus && Array.isArray(skus)) {
          await this.productService.syncSkus({ _id: req.params.id }, skus, req.user?._id);
      }

      const apiResponse: IApiResponse = {
        status: HTTP_STATUS_CODE.OK.STATUS,
        code: HTTP_STATUS_CODE.OK.CODE,
        message: PRODUCT_SUCCESS_MESSAGES.UPDATE_SUCCESS,
      };

      res.status(apiResponse.status).json(apiResponse);
    } catch (err) {
      next(err);
    }
  };

  deleteByFilter = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { filter } = this.productService.generateFilter({
        filters: req.body,
      });
      const response = await this.productService.delete(filter);
      const apiResponse: IApiResponse<any> = {
        status: HTTP_STATUS_CODE.OK.STATUS,
        code: HTTP_STATUS_CODE.OK.CODE,
        message: PRODUCT_SUCCESS_MESSAGES.DELETE_SUCCESS,
        data: response,
      };
      res.status(apiResponse.status).json(apiResponse);
    } catch (err) {
      next(err);
    }
  };

  getRecommended = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.user?._id?.toString();
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 10;

      const products = await this.productService.getRecommended(userId, limit);

      // Enrich with presigned URLs
      await Promise.all(products.map(p => enrichProductWithPresignedUrls(p)));

      const apiResponse: TProductListRes = {
        status: HTTP_STATUS_CODE.OK.STATUS,
        code: HTTP_STATUS_CODE.OK.CODE,
        message: 'Recommended products retrieved successfully',
        data: products,
      };

      res.status(apiResponse.status).json(apiResponse);
    } catch (err) {
      next(err);
    }
  };

  getSimilar = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { productId } = req.params;
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 6;

      const products = await this.productService.getSimilar(productId, limit);

      // Enrich with presigned URLs
      await Promise.all(products.map(p => enrichProductWithPresignedUrls(p)));

      const apiResponse: TProductListRes = {
        status: HTTP_STATUS_CODE.OK.STATUS,
        code: HTTP_STATUS_CODE.OK.CODE,
        message: 'Similar products retrieved successfully',
        data: products,
      };

      res.status(apiResponse.status).json(apiResponse);
    } catch (err) {
      next(err);
    }
  };

  getFrequentlyBoughtTogether = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { productId } = req.params;
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 4;

      const products = await this.productService.getFrequentlyBoughtTogether(productId, limit);

      // Enrich with presigned URLs
      await Promise.all(products.map(p => enrichProductWithPresignedUrls(p)));

      const apiResponse: TProductListRes = {
        status: HTTP_STATUS_CODE.OK.STATUS,
        code: HTTP_STATUS_CODE.OK.CODE,
        message: 'Frequently bought together products retrieved successfully',
        data: products,
      };

      res.status(apiResponse.status).json(apiResponse);
    } catch (err) {
      next(err);
    }
  };

  getProductSKUs = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { productId } = req.params;
      
      const skus = await this.skuService.findAll(
        { productId } as any,
        {},
        [{ path: 'media.fileStorageId' }]
      );

      // Enrich SKUs with presigned URLs
      if (Array.isArray(skus)) {
        await Promise.all(skus.map(async (sku: any) => {
          if (sku.media && Array.isArray(sku.media)) {
            for (const mediaItem of sku.media) {
              if (mediaItem.fileStorageId && typeof mediaItem.fileStorageId === 'object') {
                const fileStorage = mediaItem.fileStorageId as any;
                if (fileStorage.generatePreSignedUrl) {
                  mediaItem.fileStorageId = {
                    ...fileStorage.toObject(),
                    preSignedUrl: await fileStorage.generatePreSignedUrl()
                  };
                }
              }
            }
          }
        }));
      }

      const apiResponse: IApiResponse<any> = {
        status: HTTP_STATUS_CODE.OK.STATUS,
        code: HTTP_STATUS_CODE.OK.CODE,
        message: 'Product SKUs retrieved successfully',
        data: skus,
      };

      res.status(apiResponse.status).json(apiResponse);
    } catch (err) {
      next(err);
    }
  };
}

export const productController = new ProductController();
