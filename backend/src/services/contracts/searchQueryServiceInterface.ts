import { ISearchQueryAttributes, ISearchQueryDocument } from '../../interfaces';
import { IMongooseCommonService } from './mongooseCommonServiceInterface';

export interface ISearchQueryService extends IMongooseCommonService<ISearchQueryAttributes, ISearchQueryDocument> {
  getTrending(limit?: number): Promise<string[]>;
  getSuggestions(query: string, limit?: number): Promise<string[]>;
}
