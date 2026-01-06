import { MongooseCommonService } from './mongooseCommonService';
import { ICourierService } from '../contracts/courierServiceInterface';
import { CourierModel } from '../../db/mongodb/models/courierModel';
import { ICourier, ICourierFilters } from '../../types/courier';
import { ICourier as ICourierDoc } from '../../db/mongodb/models/courierModel';

export class CourierService extends MongooseCommonService<ICourier, ICourierDoc> implements ICourierService {
  constructor() {
    super(CourierModel);
  }

  async getAll(filters: ICourierFilters): Promise<ICourier[]> {
    const query: any = {};
    if (filters.status) {
      query.isActive = filters.status === 'active';
    }
    // Add more filters as needed
    return this.model.find(query).sort({ name: 1 }).lean() as unknown as ICourier[];
  }

  async toggleActive(id: string, isActive: boolean): Promise<boolean> {
    const result = await this.model.findByIdAndUpdate(id, { isActive }, { new: true });
    return !!result;
  }
}

export const courierService = new CourierService();
