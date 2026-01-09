import { ORDER_STATUS } from '../../constants';
import { OrderService } from './orderService';
import { LotService } from './lotService';
import { ShipmentService } from './shipmentService';
import { RtoService } from './rtoService';
import { NdrService } from './ndrService';

import { IAnalyticsService, IRevenueAnalytics, IProductAnalytics, ICustomerAnalytics, ILotAnalytics, ILogisticsAnalytics, ICourierPerformance } from '../contracts/analyticsServiceInterface';

export class AnalyticsService implements IAnalyticsService {
  private orderService = new OrderService();
  private lotService = new LotService();
  private shipmentService = new ShipmentService();
  private rtoService = new RtoService();
  private ndrService = new NdrService();

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

    const result = await this.orderService.aggregate(pipeline as any) as any[];
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
      this.orderService.aggregate(salesPipeline as any) as Promise<any[]>,
      this.orderService.aggregate(returnsPipeline as any) as Promise<any[]>
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
      this.orderService.aggregate(spendersPipeline as any) as Promise<any[]>,
      this.orderService.aggregate(churnPipeline as any) as Promise<any[]>,
      this.orderService.aggregate(acquisitionPipeline as any) as Promise<any[]>
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
    const stockOverview = await this.lotService.aggregate([
      {
        $group: {
          _id: null,
          totalValue: { $sum: { $multiply: ['$basePrice', '$remainingQuantity'] } },
          totalStock: { $sum: '$remainingQuantity' },
          lowStockItems: { $sum: { $cond: [{ $and: [{ $gt: ['$remainingQuantity', 0] }, { $lt: ['$remainingQuantity', 10] }] }, 1, 0] } },
          outOfStockItems: { $sum: { $cond: [{ $eq: ['$remainingQuantity', 0] }, 1, 0] } }
        }
      }
    ]) as any[];

    const now = new Date();
    const thirtyDays = new Date();
    thirtyDays.setDate(now.getDate() + 30);
    const ninetyDays = new Date();
    ninetyDays.setDate(now.getDate() + 90);

    const expiryRisks = await this.lotService.aggregate([
      {
        $group: {
          _id: null,
          expired: { $sum: { $cond: [{ $lt: ['$endDate', now] }, 1, 0] } },
          expiringNext30Days: { $sum: { $cond: [{ $and: [{ $gte: ['$endDate', now] }, { $lt: ['$endDate', thirtyDays] }] }, 1, 0] } },
          expiringNext90Days: { $sum: { $cond: [{ $and: [{ $gte: ['$endDate', now] }, { $lt: ['$endDate', ninetyDays] }] }, 1, 0] } }
        }
      }
    ]) as any[];

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
      this.lotService.aggregate(movementsPipeline as any) as Promise<any[]>,
      this.orderService.aggregate(salesPipeline as any) as Promise<any[]>
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

  /**
   * Get logistics analytics (RTO & NDR metrics)
   */
  async getLogisticsAnalytics(startDate: Date, endDate: Date): Promise<ILogisticsAnalytics> {
    const shipmentStats = await this.shipmentService.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate, $lte: endDate }
        }
      },
      {
        $group: {
          _id: null,
          totalShipments: { $sum: 1 },
          rtoCount: { $sum: { $cond: ['$isRTO', 1, 0] } },
          ndrCount: { $sum: { $cond: ['$hasNDR', 1, 0] } }
        }
      }
    ]) as any[];

    const stats = shipmentStats[0] || { totalShipments: 0, rtoCount: 0, ndrCount: 0 };

    // NDR Conversion: NDRs followed by successful delivery
    const ndrConversion = await this.shipmentService.aggregate([
      {
        $match: {
          hasNDR: true,
          status: 'DELIVERED',
          createdAt: { $gte: startDate, $lte: endDate }
        }
      },
      { $count: 'converted' }
    ]) as any[];

    // RTO Reasons
    const rtoReasons = await this.rtoService.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate, $lte: endDate }
        }
      },
      {
        $group: {
          _id: '$rtoReason',
          count: { $sum: 1 }
        }
      },
      { $sort: { count: -1 } },
      { $project: { reason: '$_id', count: 1, _id: 0 } }
    ]) as any[];

    // Avg RTO Age
    const rtoAge = await this.rtoService.aggregate([
      {
        $match: {
          status: 'DELIVERED',
          rtoDeliveredDate: { $exists: true },
          createdAt: { $gte: startDate, $lte: endDate }
        }
      },
      {
        $group: {
          _id: null,
          avgAge: { $avg: { $divide: [{ $subtract: ['$rtoDeliveredDate', '$rtoInitiatedDate'] }, 1000 * 60 * 60 * 24] } }
        }
      }
    ]) as any[];

    return {
      rtoRate: stats.totalShipments > 0 ? (stats.rtoCount / stats.totalShipments) * 100 : 0,
      totalShipments: stats.totalShipments,
      rtoCount: stats.rtoCount,
      ndrCount: stats.ndrCount,
      ndrConversionRate: stats.ndrCount > 0 ? ((ndrConversion[0]?.converted || 0) / stats.ndrCount) * 100 : 0,
      avgRtoAge: rtoAge[0]?.avgAge || 0,
      rtoReasons
    };
  }

  /**
   * Get courier performance analytics
   */
  async getCourierPerformance(startDate: Date, endDate: Date): Promise<ICourierPerformance[]> {
    const pipeline = [
      {
        $match: {
          createdAt: { $gte: startDate, $lte: endDate }
        }
      },
      {
        $group: {
          _id: '$courierId',
          courierName: { $first: '$courierName' },
          totalShipments: { $sum: 1 },
          rtoCount: { $sum: { $cond: ['$isRTO', 1, 0] } },
          ndrCount: { $sum: { $cond: ['$hasNDR', 1, 0] } },
          deliveredCount: { $sum: { $cond: [{ $eq: ['$status', 'DELIVERED'] }, 1, 0] } },
          totalDeliveryTime: {
            $sum: {
              $cond: [
                { $and: [{ $eq: ['$status', 'DELIVERED'] }, { $exists: ['$actualDeliveryDate'] }, { $exists: ['$pickupCompletedDate'] }] },
                { $divide: [{ $subtract: ['$actualDeliveryDate', '$pickupCompletedDate'] }, 1000 * 60 * 60 * 24] },
                0
              ]
            }
          },
          onTimeDeliveries: {
            $sum: {
              $cond: [
                { $and: [{ $eq: ['$status', 'DELIVERED'] }, { $exists: ['$actualDeliveryDate'] }, { $exists: ['$estimatedDeliveryDate'] }, { $lte: ['$actualDeliveryDate', '$estimatedDeliveryDate'] }] },
                1,
                0
              ]
            }
          }
        }
      },
      {
        $project: {
          courierId: '$_id',
          courierName: 1,
          totalShipments: 1,
          rtoRate: { $multiply: [{ $divide: ['$rtoCount', '$totalShipments'] }, 100] },
          ndrRate: { $multiply: [{ $divide: ['$ndrCount', '$totalShipments'] }, 100] },
          avgDeliveryTime: { $cond: ['$deliveredCount', { $divide: ['$totalDeliveryTime', '$deliveredCount'] }, 0] },
          slaAdherence: { $cond: ['$deliveredCount', { $multiply: [{ $divide: ['$onTimeDeliveries', '$deliveredCount'] }, 100] }, 0] }
        }
      }
    ];

    return await this.shipmentService.aggregate(pipeline as any) as any[];
  }
}

export const analyticsService = new AnalyticsService();
