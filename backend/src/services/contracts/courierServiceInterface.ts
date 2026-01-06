import { ICourier, ICourierFilters } from '../../types/courier'; // Assuming types exist or need creation

export interface ICourierService {
  getAll(filters: ICourierFilters): Promise<ICourier[]>;
  toggleActive(id: string, isActive: boolean): Promise<boolean>;
}
