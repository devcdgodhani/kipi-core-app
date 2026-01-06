import { Request, Response, NextFunction } from 'express';
import { NdrService } from '../services/concrete/ndrService';
import { HTTP_STATUS_CODE } from '../constants';
import { IApiResponse, IRequest } from '../interfaces';

export class NdrController {
  private ndrService = new NdrService();

  getAll = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { filter, options } = this.ndrService.generateFilter({
        filters: { ...req.query, ...req.body },
      });
      const data = await this.ndrService.findAllWithPagination(filter, options);
      
      return res.status(HTTP_STATUS_CODE.OK.STATUS).json({
        status: HTTP_STATUS_CODE.OK.STATUS,
        code: HTTP_STATUS_CODE.OK.CODE,
        message: 'NDR records fetched successfully',
        data
      } as IApiResponse<any>);
    } catch (err) {
      next(err);
    }
  };

  resolve = async (req: IRequest, res: Response, next: NextFunction) => {
    try {
      const { ndrId } = req.params;
      const resolutionData = {
        ...req.body,
        resolvedBy: req.user?._id.toString()
      };
      
      const data = await this.ndrService.resolveNDR(ndrId, resolutionData);
      
      return res.status(HTTP_STATUS_CODE.OK.STATUS).json({
        status: HTTP_STATUS_CODE.OK.STATUS,
        code: HTTP_STATUS_CODE.OK.CODE,
        message: 'NDR resolved successfully',
        data
      } as IApiResponse<any>);
    } catch (err) {
      next(err);
    }
  };

  getOne = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const data = await this.ndrService.findById(req.params.id);
      if (!data) {
          return res.status(HTTP_STATUS_CODE.NOTFOUND.STATUS).json({
              status: HTTP_STATUS_CODE.NOTFOUND.STATUS,
              code: HTTP_STATUS_CODE.NOTFOUND.CODE,
              message: 'NDR record not found'
          } as IApiResponse<any>);
      }
      return res.status(HTTP_STATUS_CODE.OK.STATUS).json({
        status: HTTP_STATUS_CODE.OK.STATUS,
        code: HTTP_STATUS_CODE.OK.CODE,
        message: 'NDR record fetched successfully',
        data
      } as IApiResponse<any>);
    } catch (err) {
      next(err);
    }
  };
}
