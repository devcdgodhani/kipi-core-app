import { CustomerAppSettingsModel } from '../../db/mongodb/models/customerAppSettingsModel';
import { ICustomerAppSettingsAttributes, ICustomerAppSettingsDocument } from '../../interfaces/customerAppSettings';
import { ICustomerAppSettingsService } from '../contracts/customerAppSettingsServiceInterface';
import { MongooseCommonService } from './mongooseCommonService';
import { CUSTOMER_APP_SETTINGS_STATUS } from '../../constants/customerAppSettings';

export class CustomerAppSettingsService
  extends MongooseCommonService<ICustomerAppSettingsAttributes, ICustomerAppSettingsDocument>
  implements ICustomerAppSettingsService
{
  constructor() {
    super(CustomerAppSettingsModel as any);
  }

  async getActiveSettings(): Promise<ICustomerAppSettingsAttributes | null> {
    return await this.findOne({ 
      status: CUSTOMER_APP_SETTINGS_STATUS.ACTIVE,
      isDefault: true 
    });
  }

  async updateSettings(data: Partial<ICustomerAppSettingsAttributes>): Promise<ICustomerAppSettingsAttributes> {
    const existing = await this.getActiveSettings();
    
    if (existing) {
      // Use findOneAndUpdate to get the updated document back
      const updated = await this.model.findOneAndUpdate(
        { _id: existing._id },
        { $set: data },
        { new: true }
      ).lean();
      
      if (!updated) {
        throw new Error('Failed to update settings');
      }
      
      return updated as unknown as ICustomerAppSettingsAttributes;
    } else {
      return await this.create({
        ...data,
        status: CUSTOMER_APP_SETTINGS_STATUS.ACTIVE,
        isDefault: true
      } as any);
    }
  }
}

export const customerAppSettingsService = new CustomerAppSettingsService();
