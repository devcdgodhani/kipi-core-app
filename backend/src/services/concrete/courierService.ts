import { MongooseCommonService } from './mongooseCommonService';
import { ICourierService } from '../contracts/courierServiceInterface';
import { CourierModel } from '../../db/mongodb/models/courierModel';
import { ICourierAttributes, ICourierDocument } from '../../interfaces/courier';

export class CourierService extends MongooseCommonService<ICourierAttributes, ICourierDocument> implements ICourierService {
  constructor() {
    super(CourierModel);
  }

  async getAll(filters: any): Promise<ICourierAttributes[]> {
    const query: any = {};
    if (filters.status) {
      query.isActive = filters.status === 'active';
    }
    // Add more filters as needed
    return this.model.find(query).sort({ name: 1 }).lean() as any;
  }

  async toggleActive(id: string, isActive: boolean): Promise<boolean> {
    const result = await this.model.findByIdAndUpdate(id, { isActive }, { new: true });
    return !!result;
  }
}

export const courierService = new CourierService();
