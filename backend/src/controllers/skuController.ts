import { Request, Response, NextFunction } from 'express';
import { HTTP_STATUS_CODE } from '../constants';
import { SkuService } from '../services/concrete/skuService';
import { 
  TSkuCreateReq, 
  TSkuUpdateReq, 
  TSkuRes, 
  TSkuListRes, 
  TSkuListPaginationRes 
} from '../types/sku';
import { IApiResponse } from '../interfaces';
import { FileStorageModel, ProductModel, SkuModel } from '../db/mongodb';
import { FileStorageService } from '../services/concrete/fileStorageService';
import { inventoryAuditService } from '../services/concrete/inventoryAuditService';

export default class SkuController {
  private skuService = new SkuService();
  private fileStorageService = new FileStorageService();

  private async enrichSkuWithPresignedUrls(sku: any) {
    if (!sku || !sku.media || !Array.isArray(sku.media)) return;
    
    await Promise.all(sku.media.map(async (m: any) => {
        if (m.fileStorageId && typeof m.fileStorageId === 'object') {
            await this.fileStorageService.ensurePresignedUrl(m.fileStorageId);
            m.url = m.fileStorageId.preSignedUrl;
        }
    }));
  }

  /*********** Fetch SKUs ***********/
  getOne = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const reqData = { ...req.query, ...req.body };
      const { filter, options } = this.skuService.generateFilter({
        filters: reqData,
      });

      const skuDoc = await this.skuService.findOne(filter);
      let sku = skuDoc as any;

      if (sku) {
          // Sanitize fields
          if (sku.productId === '') delete sku.productId;
          if (sku.lotId === '') delete sku.lotId;
          if (sku.media) {
              sku.media = sku.media.map((m: any) => {
                  if (m.fileStorageId === '') {
                      const { fileStorageId, ...rest } = m;
                      return rest;
                  }
                  return m;
              });
          }

          // Manually perform population
          sku = await SkuModel.populate(sku, [
              { path: 'productId', select: 'name productCode' },
              { path: 'variantAttributes.attributeId', select: 'name key label type' },
              { path: 'media.fileStorageId' }
          ]);

          await this.enrichSkuWithPresignedUrls(sku);
      }

      const response: TSkuRes = {
        status: HTTP_STATUS_CODE.OK.STATUS,
        code: HTTP_STATUS_CODE.OK.CODE,
        message: 'SKU fetched successfully',
        data: sku as any,
      };

      return res.status(response.status).json(response);
    } catch (err) {
      return next(err);
    }
  };

  getAll = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const reqData = { ...req.query, ...req.body };
      const { filter, options } = this.skuService.generateFilter({
        filters: reqData,
      });

      options.populate = [
          { path: 'productId', select: 'name productCode' },
          { path: 'variantAttributes.attributeId', select: 'name key label type' },
          { path: 'media.fileStorageId' }
      ];
      const skus = await this.skuService.findAll(filter, options);

      if (Array.isArray(skus)) {
          await Promise.all(skus.map(s => this.enrichSkuWithPresignedUrls(s)));
      }

      const response: TSkuListRes = {
        status: HTTP_STATUS_CODE.OK.STATUS,
        code: HTTP_STATUS_CODE.OK.CODE,
        message: 'SKUs fetched successfully',
        data: skus as any,
      };
      return res.status(response.status).json(response);
    } catch (err) {
      return next(err);
    }
  };

  getWithPagination = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const reqData = { ...req.query, ...req.body };
      const { filter, options } = this.skuService.generateFilter({
        filters: reqData,
      });

      options.populate = [
          { path: 'productId', select: 'name' },
          { path: 'media.fileStorageId' }
      ];

      const skuList = await this.skuService.findAllWithPagination(filter, options);

      if (skuList.recordList && Array.isArray(skuList.recordList)) {
          await Promise.all(skuList.recordList.map(s => this.enrichSkuWithPresignedUrls(s)));
      }

      const response: TSkuListPaginationRes = {
        status: HTTP_STATUS_CODE.OK.STATUS,
        code: HTTP_STATUS_CODE.OK.CODE,
        message: 'SKUs fetched successfully (paginated)',
        data: skuList as any,
      };

      return res.status(response.status).json(response);
    } catch (err) {
      return next(err);
    }
  };

  /*********** Create SKU ***********/
  create = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const reqData: TSkuCreateReq = req.body;
      
      const newSku = await this.skuService.create(reqData as any, { userId: req.user?._id });

      const response: TSkuRes = {
        status: HTTP_STATUS_CODE.CREATED.STATUS,
        code: HTTP_STATUS_CODE.CREATED.CODE,
        message: 'SKU created successfully',
        data: newSku as any,
      };
      return res.status(response.status).json(response);
    } catch (err) {
      return next(err);
    }
  };

  /*********** Update SKU ***********/
  updateById = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const updateData: TSkuUpdateReq = req.body;

      // --- INVENTORY AUDIT: MANUAL ADJUSTMENT ---
      if (updateData.quantity !== undefined) {
        const existingSku = await SkuModel.findById(id);
        if (existingSku && existingSku.quantity !== updateData.quantity) {
          const delta = updateData.quantity - existingSku.quantity;
          await inventoryAuditService.logAdjustment({
            skuId: id,
            transactionType: 'ADMIN_ADJUSTMENT',
            changeQuantity: delta,
            previousQuantity: existingSku.quantity,
            newQuantity: updateData.quantity,
            referenceId: (req as any).user?._id,
            referenceType: 'USER',
            reason: 'Manual stock adjustment by admin'
          });
        }
      }

      await this.skuService.updateOne({ _id: id }, updateData as any, { userId: req.user?._id });

      const response: IApiResponse = {
        status: HTTP_STATUS_CODE.OK.STATUS,
        code: HTTP_STATUS_CODE.OK.CODE,
        message: 'SKU updated successfully',
      };
      return res.status(response.status).json(response);
    } catch (err) {
      return next(err);
    }
  };

  /*********** Delete SKU ***********/
  deleteByFilter = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const reqData = req.body;
      const { filter } = this.skuService.generateFilter({
        filters: reqData,
      });

      await this.skuService.softDelete(filter, { userId: req.user?._id });

      const response: IApiResponse = {
        status: HTTP_STATUS_CODE.OK.STATUS,
        code: HTTP_STATUS_CODE.OK.CODE,
        message: 'SKU deleted successfully',
      };
      return res.status(response.status).json(response);
    } catch (err) {
      return next(err);
    }
  };
}
