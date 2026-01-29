import { IThemeAttributes, IThemeDocument } from '../../interfaces/theme';
import { IMongooseCommonService } from './mongooseCommonServiceInterface';

export interface IThemeService extends IMongooseCommonService<IThemeAttributes, IThemeDocument> {
    getThemeByAppName(appName: string): Promise<IThemeAttributes | null>;
    updateThemeByAppName(appName: string, data: Partial<IThemeAttributes>): Promise<IThemeAttributes | null>;
}
