import { LotModel } from '../../db/mongodb/models/lotModel';
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
    const diffTime = Math.abs(endDate.getTime() - startDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    const groupByFormat = diffDays > 60 ? '%Y-%m' : '%Y-%m-%d';

    const pipeline = [
      {
        $match: {
          createdAt: { $gte: startDate, $lte: endDate },
          orderStatus: { $nin: [ORDER_STATUS.CANCELLED, ORDER_STATUS.PENDING] }
        }
      },
      {
        $group: {
          _id: { $dateToString: { format: groupByFormat, date: '$createdAt' } },
          revenue: { $sum: '$totalAmount' },
          orders: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
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
   * Get product performance analytics
   */
  async getProductPerformance(startDate: Date, endDate: Date): Promise<IProductAnalytics> {
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

    return { topProducts, topReturns };
  }

  /**
   * Get customer analytics
   */
  async getCustomerAnalytics(startDate: Date, endDate: Date): Promise<ICustomerAnalytics> {
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
        $lookup: { from: 'users', localField: '_id', foreignField: '_id', as: 'user' }
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

    const sixtyDaysAgo = new Date();
    sixtyDaysAgo.setDate(sixtyDaysAgo.getDate() - 60);

    const churnPipeline = [
      { $match: { orderStatus: { $nin: [ORDER_STATUS.CANCELLED, ORDER_STATUS.PENDING] } } },
      {
        $group: {
          _id: '$userId',
          lastOrderDate: { $max: '$createdAt' },
          totalSpend: { $sum: '$totalAmount' }
        }
      },
      {
        $match: { lastOrderDate: { $lt: sixtyDaysAgo }, totalSpend: { $gt: 0 } }
      },
      { $sort: { totalSpend: -1 } },
      { $limit: 10 },
      {
        $lookup: { from: 'users', localField: '_id', foreignField: '_id', as: 'user' }
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

    const acquisitionPipeline = [
      {
        $match: {
          createdAt: { $gte: startDate, $lte: endDate },
          orderStatus: { $nin: [ORDER_STATUS.CANCELLED, ORDER_STATUS.PENDING] }
        }
      },
      {
        $lookup: { from: 'users', localField: 'userId', foreignField: '_id', as: 'user' }
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

    return { topSpenders, churnRisk, acquisition };
  }

  /**
   * Get lot intelligence (Stock health, Expiry risks, Movements)
   */
  async getLotAnalytics(startDate: Date, endDate: Date) {
    const stockOverview = await LotModel.aggregate([
      {
        $group: {
          _id: null,
          totalValue: { $sum: { $multiply: ['$basePrice', '$remainingQuantity'] } },
          totalStock: { $sum: '$remainingQuantity' },
          lowStockItems: { $sum: { $cond: [{ $and: [{ $gt: ['$remainingQuantity', 0] }, { $lt: ['$remainingQuantity', 10] }] }, 1, 0] } },
          outOfStockItems: { $sum: { $cond: [{ $eq: ['$remainingQuantity', 0] }, 1, 0] } }
        }
      }
    ]);

    const now = new Date();
    const thirtyDays = new Date();
    thirtyDays.setDate(now.getDate() + 30);
    const ninetyDays = new Date();
    ninetyDays.setDate(now.getDate() + 90);

    const expiryRisks = await LotModel.aggregate([
      {
        $group: {
          _id: null,
          expired: { $sum: { $cond: [{ $lt: ['$endDate', now] }, 1, 0] } },
          expiringNext30Days: { $sum: { $cond: [{ $and: [{ $gte: ['$endDate', now] }, { $lt: ['$endDate', thirtyDays] }] }, 1, 0] } },
          expiringNext90Days: { $sum: { $cond: [{ $and: [{ $gte: ['$endDate', now] }, { $lt: ['$endDate', ninetyDays] }] }, 1, 0] } }
        }
      }
    ]);

    const movementsPipeline = [
      { $match: { createdAt: { $gte: startDate, $lte: endDate } } },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          received: { $sum: '$quantity' }
        }
      }
    ];

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
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          sold: { $sum: '$items.quantity' }
        }
      }
    ];

    const [receivedData, soldData] = await Promise.all([
      LotModel.aggregate(movementsPipeline as any),
      OrderModel.aggregate(salesPipeline as any)
    ]);

    const movementMap = new Map();
    receivedData.forEach(item => movementMap.set(item._id, { date: item._id, received: item.received, sold: 0 }));
    soldData.forEach(item => {
      const existing = movementMap.get(item._id);
      if (existing) {
        existing.sold = item.sold;
      } else {
        movementMap.set(item._id, { date: item._id, received: 0, sold: item.sold });
      }
    });

    const lotMovements = Array.from(movementMap.values()).sort((a, b) => a.date.localeCompare(b.date));

    return {
      stockOverview: stockOverview[0] || { totalValue: 0, totalStock: 0, lowStockItems: 0, outOfStockItems: 0 },
      expiryRisks: expiryRisks[0] || { expired: 0, expiringNext30Days: 0, expiringNext90Days: 0 },
      lotMovements
    };
  }
}

export const analyticsService = new AnalyticsService();
