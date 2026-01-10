import { RecentlyViewedModel } from '../../db/mongodb';
import { IRecentlyViewedAttributes, IRecentlyViewedDocument } from '../../interfaces';
import { IProductAttributes } from '../../interfaces/product';
import { IRecentlyViewedService } from '../contracts/recentlyViewedServiceInterface';
import { MongooseCommonService } from './mongooseCommonService';
import { RECENTLY_VIEWED_LIMITS } from '../../constants';

export class RecentlyViewedService
  extends MongooseCommonService<IRecentlyViewedAttributes, IRecentlyViewedDocument>
  implements IRecentlyViewedService
{
  constructor() {
    super(RecentlyViewedModel as any);
  }

  async trackView(userId: string, productId: string): Promise<void> {
    // Upsert: Update viewedAt if exists, create if not
    await RecentlyViewedModel.findOneAndUpdate(
      { userId, productId },
      { 
        $set: { 
          viewedAt: new Date(),
          status: 'ACTIVE'
        }
      },
      { upsert: true, new: true }
    );

    // Limit to last N views per user
    const userViews = await RecentlyViewedModel.find({ userId })
      .sort({ viewedAt: -1 })
      .skip(RECENTLY_VIEWED_LIMITS.MAX_VIEWS_PER_USER);

    if (userViews.length > 0) {
      const idsToDelete = userViews.map(v => v._id);
      await RecentlyViewedModel.deleteMany({ _id: { $in: idsToDelete } });
    }
  }

  async getRecentlyViewed(userId: string, limit: number = RECENTLY_VIEWED_LIMITS.DEFAULT_LIMIT): Promise<IProductAttributes[]> {
    const views = await RecentlyViewedModel.find({ 
      userId, 
      status: 'ACTIVE' 
    })
      .sort({ viewedAt: -1 })
      .limit(Math.min(limit, RECENTLY_VIEWED_LIMITS.MAX_VIEWS_PER_USER))
      .populate('productId')
      .lean();

    // Extract and return populated products
    return views
      .map((v: any) => (v as any).productId)
      .filter((p: any) => p && p.status === 'ACTIVE');
  }
}

export const recentlyViewedService = new RecentlyViewedService();
