import { ThemeModel } from '../../db/mongodb/models/themeModel';
import { IThemeAttributes, IThemeDocument } from '../../interfaces/theme';
import { IThemeService } from '../contracts/themeServiceInterface';
import { MongooseCommonService } from './mongooseCommonService';

export class ThemeService
  extends MongooseCommonService<IThemeAttributes, IThemeDocument>
  implements IThemeService
{
  constructor() {
    super(ThemeModel as any);
  }

  async getThemeByAppName(appName: string): Promise<IThemeAttributes | null> {
    return await this.model.findOne({ appName });
  }

  async updateThemeByAppName(appName: string, data: Partial<IThemeAttributes>): Promise<IThemeAttributes | null> {
      // Upsert: create if not exists
      return await this.model.findOneAndUpdate(
          { appName },
          data,
          { new: true, upsert: true }
      );
  }
}

export const themeService = new ThemeService();
