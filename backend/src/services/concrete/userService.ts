import { UserModel } from '../../db/mongodb';
import { IUserAttributes, IUserDocument, IPaginationData } from '../../interfaces';
import { IUserService } from '../contracts/userServiceInterface';
import { MongooseCommonService } from './mongooseCommonService';
import { FilterQuery, QueryOptions } from 'mongoose';

export class UserService
  extends MongooseCommonService<IUserAttributes, IUserDocument>
  implements IUserService
{
  constructor() {
    super(UserModel as any);
  }

  async findAllWithPagination(
    filter: FilterQuery<IUserAttributes>,
    options: QueryOptions & {
      page?: number;
      limit?: number;
      order?: Partial<Record<keyof IUserAttributes, 1 | -1>>;
    } = {}
  ): Promise<IPaginationData<IUserAttributes>> {
    const { order, page = 1, limit = 10 } = options;

    const sort = order || { createdAt: -1 };
    const safePage = Math.max(1, page);
    const safeLimit = Math.max(1, limit);
    const skip = (safePage - 1) * safeLimit;

    const pipeline: any[] = [
      { $match: filter },
      {
        $lookup: {
          from: 'wallets',
          localField: '_id',
          foreignField: 'userId',
          as: 'wallet'
        }
      },
      {
        $addFields: {
          wallet: { $arrayElemAt: ['$wallet', 0] }
        }
      },
      {
        $facet: {
          metadata: [{ $count: 'totalRecords' }],
          data: [
            { $sort: sort },
            { $skip: skip },
            { $limit: safeLimit }
          ]
        }
      }
    ];

    const result = await this.model.aggregate(pipeline).exec();
    const totalRecords = result[0]?.metadata[0]?.totalRecords || 0;
    const recordList = result[0]?.data || [];

    return {
      limit: safeLimit,
      totalRecords,
      totalPages: Math.ceil(totalRecords / safeLimit),
      hasPreviousPage: safePage > 1,
      currentPage: safePage,
      hasNextPage: safePage < Math.ceil(totalRecords / safeLimit),
      recordList,
    };
  }
}

export const userService = new UserService();
