import { NextFunction, Request, Response } from 'express';
import { productService } from '../services/concrete/productService';
import { skuService } from '../services/concrete/skuService';
import { HTTP_STATUS_CODE, PRODUCT_SUCCESS_MESSAGES } from '../constants';
import { fileStorageService } from '../services/concrete/fileStorageService';
import { IApiResponse, IPaginationData } from '../interfaces';
import { IProductAttributes } from '../interfaces/product';
import { TProductListPaginationRes, TProductListRes, TProductRes } from '../types/product';

export class ProductController {
  private get productService() { return productService; }
  private get skuService() { return skuService; }
  private get fileStorageService() { return fileStorageService; }

  private async enrichProductWithPresignedUrls(product: any) {
    if (!product) return;

    // Enrich Main Image
    if (product.mainImage && typeof product.mainImage === 'object') {
      await this.fileStorageService.ensurePresignedUrl(product.mainImage);
      product.mainImage = product.mainImage.preSignedUrl;
    }

    // Enrich Media
    if (product.media && Array.isArray(product.media)) {
      await Promise.all(product.media.map(async (m: any) => {
        if (m.fileStorageId && typeof m.fileStorageId === 'object') {
          await this.fileStorageService.ensurePresignedUrl(m.fileStorageId);
          m.url = m.fileStorageId.preSignedUrl;
        }
      }));
    }

    // Enrich SKUs
    if (product.skus && Array.isArray(product.skus)) {
      await Promise.all(product.skus.map(async (sku: any) => {
        if (sku.media && Array.isArray(sku.media)) {
          await Promise.all(sku.media.map(async (m: any) => {
            if (m.fileStorageId && typeof m.fileStorageId === 'object') {
              await this.fileStorageService.ensurePresignedUrl(m.fileStorageId);
              m.url = m.fileStorageId.preSignedUrl;
            }
          }));
        }
      }));
    }
  }

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
        await Promise.all(response.map(p => this.enrichProductWithPresignedUrls(p)));
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

      await this.enrichProductWithPresignedUrls(response);

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
        await Promise.all(response.recordList.map(p => this.enrichProductWithPresignedUrls(p)));
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
}

export const productController = new ProductController();
