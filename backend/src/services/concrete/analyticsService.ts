import { OrderModel } from '../../db/mongodb/models/orderModel';
import { ORDER_STATUS } from '../../constants';

interface IRevenueAnalytics {
  revenue: number;
  orders: number;
  aov: number;
  timeline: {
    date: string;
    revenue: number;
    orders: number;
  }[];
}

export interface IProductAnalytics {
  topProducts: {
    _id: string; // product id
    name: string;
    skuCode: string;
    totalSold: number;
    totalRevenue: number;
  }[];
  topReturns: {
    _id: string; // product id
    name: string;
    skuCode: string;
    returnCount: number;
  }[];
}

export interface ICustomerAnalytics {
  topSpenders: {
    _id: string; // userId
    name: string;
    email: string;
    totalSpend: number;
    orderCount: number;
  }[];
  churnRisk: {
    _id: string; // userId
    name: string;
    email: string;
    lastOrderDate: Date;
    totalSpend: number;
  }[];
  acquisition: {
    newCustomers: { revenue: number; count: number };
    returningCustomers: { revenue: number; count: number };
  };
}

export class AnalyticsService {
  /**
   * Get revenue analytics for a specific date range
   */
  async getRevenueAnalytics(startDate: Date, endDate: Date): Promise<IRevenueAnalytics> {
    
    // Determine grouping format based on duration
    const diffTime = Math.abs(endDate.getTime() - startDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    // If range > 60 days, group by month, else group by day
    const groupByFormat = diffDays > 60 ? '%Y-%m' : '%Y-%m-%d';

    const pipeline = [
      {
        $match: {
          createdAt: { $gte: startDate, $lte: endDate },
          orderStatus: { $nin: [ORDER_STATUS.CANCELLED, ORDER_STATUS.PENDING] } // Only count confirmed/processed/delivered
        }
      },
      {
        $group: {
          _id: {
            $dateToString: { format: groupByFormat, date: '$createdAt' }
          },
          revenue: { $sum: '$totalAmount' },
          orders: { $sum: 1 }
        }
      },
      {
        $sort: { _id: 1 }
      }
    ];

    const result = await OrderModel.aggregate(pipeline as any);

    let totalRevenue = 0;
    let totalOrders = 0;

    const timeline = result.map(item => {
      totalRevenue += item.revenue;
      totalOrders += item.orders;
      return {
        date: item._id,
        revenue: item.revenue,
        orders: item.orders
      };
    });

    return {
      revenue: totalRevenue,
      orders: totalOrders,
      aov: totalOrders > 0 ? Math.round(totalRevenue / totalOrders) : 0,
      timeline
    };
  }

  /**
   * Get product performance analytics (Best Sellers & Returns)
   */
  async getProductPerformance(startDate: Date, endDate: Date): Promise<IProductAnalytics> {
    
    // 1. Top Selling Products Pipeline
    const salesPipeline = [
      {
        $match: {
          createdAt: { $gte: startDate, $lte: endDate },
          orderStatus: { $nin: [ORDER_STATUS.CANCELLED, ORDER_STATUS.PENDING] }
        }
      },
      { $unwind: '$items' },
      {
        $group: {
          _id: '$items.productId',
          name: { $first: '$items.name' },
          skuCode: { $first: '$items.skuCode' },
          totalSold: { $sum: '$items.quantity' },
          totalRevenue: { $sum: '$items.total' }
        }
      },
      { $sort: { totalRevenue: -1 } },
      { $limit: 10 }
    ];

    // 2. Top Returned Products Pipeline
    const returnsPipeline = [
      {
        $match: {
          createdAt: { $gte: startDate, $lte: endDate },
          orderStatus: ORDER_STATUS.RETURNED
        }
      },
      { $unwind: '$items' },
      {
        $group: {
          _id: '$items.productId',
          name: { $first: '$items.name' },
          skuCode: { $first: '$items.skuCode' },
          returnCount: { $sum: '$items.quantity' }
        }
      },
      { $sort: { returnCount: -1 } },
      { $limit: 10 }
    ];

    const [topProducts, topReturns] = await Promise.all([
      OrderModel.aggregate(salesPipeline as any),
      OrderModel.aggregate(returnsPipeline as any)
    ]);

    return {
      topProducts,
      topReturns
    };
    return {
      topProducts,
      topReturns
    };
  }

  /**
   * Get customer analytics (Platinum Users, Churn Risk, Acquisition)
   */
  async getCustomerAnalytics(startDate: Date, endDate: Date): Promise<ICustomerAnalytics> {
    
    // 1. Top Spenders
    const spendersPipeline = [
      {
        $match: {
          createdAt: { $gte: startDate, $lte: endDate },
          orderStatus: { $nin: [ORDER_STATUS.CANCELLED, ORDER_STATUS.PENDING] }
        }
      },
      {
        $group: {
          _id: '$userId',
          totalSpend: { $sum: '$totalAmount' },
          orderCount: { $sum: 1 }
        }
      },
      { $sort: { totalSpend: -1 } },
      { $limit: 10 },
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: '_id',
          as: 'user'
        }
      },
      { $unwind: '$user' },
      {
        $project: {
          name: { $concat: ['$user.firstName', ' ', '$user.lastName'] },
          email: '$user.email',
          totalSpend: 1,
          orderCount: 1
        }
      }
    ];

    // 2. Churn Risk (High value users who haven't ordered in last 60 days)
    // Heuristic: Find users with high LTV (from all time) whose last order was > 60 days ago
    const sixtyDaysAgo = new Date();
    sixtyDaysAgo.setDate(sixtyDaysAgo.getDate() - 60);

    const churnPipeline = [
      {
        $match: {
           orderStatus: { $nin: [ORDER_STATUS.CANCELLED, ORDER_STATUS.PENDING] }
        }
      },
      {
        $group: {
          _id: '$userId',
          lastOrderDate: { $max: '$createdAt' },
          totalSpend: { $sum: '$totalAmount' }
        }
      },
      {
        $match: {
          lastOrderDate: { $lt: sixtyDaysAgo },
          totalSpend: { $gt: 0 } // Only care about actual spenders
        }
      },
      { $sort: { totalSpend: -1 } },
      { $limit: 10 },
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: '_id',
          as: 'user'
        }
      },
      { $unwind: '$user' },
      {
        $project: {
          name: { $concat: ['$user.firstName', ' ', '$user.lastName'] },
          email: '$user.email',
          lastOrderDate: 1,
          totalSpend: 1
        }
      }
    ];

    // 3. New vs Returning (Based on User Created Date)
    // We analyze orders in the period, and check if the user was created IN this period (New) or BEFORE (Returning)
    const acquisitionPipeline = [
      {
        $match: {
          createdAt: { $gte: startDate, $lte: endDate },
          orderStatus: { $nin: [ORDER_STATUS.CANCELLED, ORDER_STATUS.PENDING] }
        }
      },
      {
        $lookup: {
          from: 'users',
          localField: 'userId',
          foreignField: '_id',
          as: 'user'
        }
      },
      { $unwind: '$user' },
      {
        $project: {
          totalAmount: 1,
          isNew: { $gte: ['$user.createdAt', startDate] }
        }
      },
      {
        $group: {
          _id: '$isNew',
          revenue: { $sum: '$totalAmount' },
          count: { $sum: 1 }
        }
      }
    ];

    const [topSpenders, churnRisk, acquisitionData] = await Promise.all([
      OrderModel.aggregate(spendersPipeline as any),
      OrderModel.aggregate(churnPipeline as any),
      OrderModel.aggregate(acquisitionPipeline as any)
    ]);

    const acquisition = {
      newCustomers: { revenue: 0, count: 0 },
      returningCustomers: { revenue: 0, count: 0 }
    };

    acquisitionData.forEach((item: any) => {
      if (item._id === true) {
        acquisition.newCustomers = { revenue: item.revenue, count: item.count };
      } else {
        acquisition.returningCustomers = { revenue: item.revenue, count: item.count };
      }
    });

    return {
      topSpenders,
      churnRisk,
      acquisition
    };
  }
}

export const analyticsService = new AnalyticsService();
