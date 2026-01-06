import { Request, Response } from 'express';
import { courierService } from '../../services/concrete/courierService';

export class CourierController {
  static async getAll(req: Request, res: Response) {
    try {
      const filters = req.body || {};
      const couriers = await courierService.getAll(filters);
      return res.status(200).json({
        status: 'SUCCESS',
        code: 200,
        message: 'Couriers fetched successfully',
        data: couriers
      });
    } catch (error) {
       console.error('Error fetching couriers:', error);
       return res.status(500).json({
         status: 'ERROR',
         code: 500,
         message: 'Failed to fetch couriers',
         data: null
       });
    }
  }

  static async toggleActive(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { isActive } = req.body;
      await courierService.toggleActive(id, isActive);
      return res.status(200).json({
        status: 'SUCCESS',
        code: 200,
        message: 'Courier status updated',
        data: null
      });
    } catch (error) {
      console.error('Error updating courier status:', error);
      return res.status(500).json({
        status: 'ERROR',
        code: 500,
        message: 'Failed to update courier status',
        data: null
      });
    }
  }
}
