import { ISearchQueryAttributes, ISearchQueryDocument } from '../../interfaces';
import { IMongooseCommonService } from './mongooseCommonServiceInterface';

export interface ISearchQueryService extends IMongooseCommonService<ISearchQueryAttributes, ISearchQueryDocument> {
  getTrending(limit?: number): Promise<{ query: string; count: number }[]>;
  getSuggestions(query: string, limit?: number): Promise<string[]>;
}
