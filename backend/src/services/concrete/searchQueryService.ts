import { SearchQueryModel } from '../../db/mongodb';
import { ISearchQueryAttributes, ISearchQueryDocument } from '../../interfaces';
import { ISearchQueryService } from '../contracts/searchQueryServiceInterface';
import { MongooseCommonService } from './mongooseCommonService';

export class SearchQueryService
  extends MongooseCommonService<ISearchQueryAttributes, ISearchQueryDocument>
  implements ISearchQueryService
{
  constructor() {
    super(SearchQueryModel as any);
  }

  async getTrending(limit: number = 10): Promise<{ query: string; count: number }[]> {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const trending = await SearchQueryModel.aggregate([
      {
        $match: {
          createdAt: { $gte: thirtyDaysAgo },
          status: 'ACTIVE',
        },
      },
      {
        $group: {
          _id: { $toLower: '$query' },
          count: { $sum: 1 },
        },
      },
      {
        $sort: { count: -1 },
      },
      {
        $limit: limit,
      },
      {
        $project: {
          _id: 0,
          query: '$_id',
          count: 1,
        },
      },
    ]);

    return trending;
  }

  async getSuggestions(query: string, limit: number = 5): Promise<string[]> {
    const regex = new RegExp(`^${query}`, 'i');
    
    const suggestions = await SearchQueryModel.aggregate([
      {
        $match: {
          query: regex,
          status: 'ACTIVE',
        },
      },
      {
        $group: {
          _id: { $toLower: '$query' },
          count: { $sum: 1 },
        },
      },
      {
        $sort: { count: -1 },
      },
      {
        $limit: limit,
      },
      {
        $project: {
          _id: 0,
          query: '$_id',
        },
      },
    ]);

    return suggestions.map((s: any) => s.query);
  }
}

export const searchQueryService = new SearchQueryService();
