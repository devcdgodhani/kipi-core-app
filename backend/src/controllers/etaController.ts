import { Request, Response, NextFunction } from 'express';
import { etaService } from '../services/concrete/etaService';
import { HTTP_STATUS_CODE } from '../constants';
import { TEtaRes } from '../types/eta';

export class EtaController {
  
  calculateETA = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { destinationPincode, courierId, pickupPincode } = req.body;
      const result = await etaService.calculateETA(destinationPincode, courierId, pickupPincode);
      
      const response: TEtaRes = {
        status: HTTP_STATUS_CODE.OK.STATUS,
        code: HTTP_STATUS_CODE.OK.CODE,
        message: 'ETA calculated successfully',
        data: result
      };
      
      return res.status(response.status).json(response);
    } catch (err) {
      return next(err);
    }
  };
}
