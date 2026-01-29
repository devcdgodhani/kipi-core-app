import { ICustomerAppSettingsAttributes, ICustomerAppSettingsDocument } from '../../interfaces/customerAppSettings';
import { IMongooseCommonService } from './mongooseCommonServiceInterface';

export interface ICustomerAppSettingsService 
  extends IMongooseCommonService<ICustomerAppSettingsAttributes, ICustomerAppSettingsDocument> {
  // Additional custom methods beyond standard CRUD
  getActiveSettings(): Promise<ICustomerAppSettingsAttributes | null>;
  updateSettings(data: Partial<ICustomerAppSettingsAttributes>): Promise<ICustomerAppSettingsAttributes>;
}
