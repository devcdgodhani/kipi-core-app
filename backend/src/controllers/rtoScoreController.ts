import { Request, Response, NextFunction } from 'express';
import { RtoScoreService } from '../services/concrete/rtoScoreService';
import { HTTP_STATUS_CODE } from '../constants';
import { IApiResponse } from '../interfaces';
import { TRtoScoreRes } from '../types/rto';

import { RtoScoreModel } from '../db/mongodb';

export class RtoScoreController {
  rtoScoreService = new RtoScoreService();
  
  calculateScore = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { userId, pincode, orderAmount, paymentMethod } = req.body;
      const result = await this.rtoScoreService.calculateRiskScore(userId, pincode, orderAmount, paymentMethod);
      
      const response: TRtoScoreRes = {
        status: HTTP_STATUS_CODE.OK.STATUS,
        code: HTTP_STATUS_CODE.OK.CODE,
        message: 'RTO Score calculated successfully',
        data: result as any
      };
      
      return res.status(response.status).json(response);
    } catch (err) {
      return next(err);
    }
  };

  getAllScores = async (req: Request, res: Response, next: NextFunction) => {
    try {
       const scores = await RtoScoreModel.find().populate('customerId', 'firstName lastName email').populate('orderId', 'orderNumber totalAmount').sort({ createdAt: -1 });
       return res.status(HTTP_STATUS_CODE.OK.STATUS).json({
          status: HTTP_STATUS_CODE.OK.STATUS,
          code: HTTP_STATUS_CODE.OK.CODE,
          message: 'RTO Scores fetched successfully',
          data: scores
       });
    } catch (err) {
        return next(err);
    }
  };

  getScoreByOrderId = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { orderId } = req.params;
        const score = await RtoScoreModel.findOne({ orderId }).populate('customerId', 'firstName lastName email');
        return res.status(HTTP_STATUS_CODE.OK.STATUS).json({
            status: HTTP_STATUS_CODE.OK.STATUS,
            code: HTTP_STATUS_CODE.OK.CODE,
            message: 'RTO Score fetched successfully',
            data: score
        });
    } catch (err) {
        return next(err);
    }
  };
}

