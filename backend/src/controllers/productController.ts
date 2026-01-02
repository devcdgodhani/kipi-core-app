import { NextFunction, Request, Response } from 'express';
import { ProductService } from '../services/concrete/productService';
import { HTTP_STATUS_CODE } from '../constants';
import { SkuModel } from '../db/mongodb/models/skuModel';
import { FileStorageService } from '../services/concrete/fileStorageService';

export default class ProductController {
  private productService = new ProductService();
  private fileStorageService = new FileStorageService();

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

      res.status(HTTP_STATUS_CODE.OK.STATUS).json({
        code: HTTP_STATUS_CODE.OK.CODE,
        message: 'Product listing fetched successfully',
        data: response,
      });
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
      
      if (response && response._id) {
          const skus = await SkuModel.find({ productId: response._id })
            .populate('media.fileStorageId')
            .lean();
          (response as any).skus = skus;
      }

      await this.enrichProductWithPresignedUrls(response);

      res.status(HTTP_STATUS_CODE.OK.STATUS).json({
        code: HTTP_STATUS_CODE.OK.CODE,
        message: 'Product fetched successfully',
        data: response,
      });
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

      res.status(HTTP_STATUS_CODE.OK.STATUS).json({
        code: HTTP_STATUS_CODE.OK.CODE,
        message: 'Product listing fetched successfully',
        data: response,
      });
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

      // Re-fetch to return full structure with URLs?
      // Optimization: For now just return as is (usually ID). 
      // User flow usually redirects to listing or details which fetches again.
      // Or manually enrich if needed. Leaving as is to minimize complexity unless requested.

      res.status(HTTP_STATUS_CODE.CREATED.STATUS).json({
        code: HTTP_STATUS_CODE.CREATED.CODE,
        message: 'Product created successfully',
        data: response,
      });
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

      res.status(HTTP_STATUS_CODE.OK.STATUS).json({
        code: HTTP_STATUS_CODE.OK.CODE,
        message: 'Product updated successfully',
        data: response,
      });
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
      res.status(HTTP_STATUS_CODE.OK.STATUS).json({
        code: HTTP_STATUS_CODE.OK.CODE,
        message: 'Product deleted successfully',
        data: response,
      });
    } catch (err) {
      next(err);
    }
  };
}
