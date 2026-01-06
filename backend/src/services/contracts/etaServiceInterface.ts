import { IEtaResult } from '../../interfaces/eta';

export interface IEtaService {
  calculateETA(
    destinationPincode: string,
    courierId?: string,
    pickupPincode?: string
  ): Promise<IEtaResult | IEtaResult[]>;
}
