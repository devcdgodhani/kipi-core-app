import { MongooseCommonService } from './mongooseCommonService';
import { ICourierService } from '../contracts/courierServiceInterface';
import { CourierModel } from '../../db/mongodb/models/courierModel';
import { ICourierAttributes, ICourierDocument } from '../../interfaces/courier';

export class CourierService extends MongooseCommonService<ICourierAttributes, ICourierDocument> implements ICourierService {
  constructor() {
    super(CourierModel as any);
  }

  async getAll(filters: any): Promise<ICourierAttributes[]> {
    const query: any = {};
    if (filters.status) {
      query.isActive = filters.status === 'active';
    }
    // Add more filters as needed
    return this.findAll(query, { sort: { name: 1 } });
  }

  async toggleActive(id: string, isActive: boolean): Promise<boolean> {
    const result = await this.findOneAndUpdate({ _id: id } as any, { $set: { isActive } } as any, { new: true });
    return !!result;
  }
}

export const courierService = new CourierService();
