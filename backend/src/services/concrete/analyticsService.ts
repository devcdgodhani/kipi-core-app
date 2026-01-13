import { ORDER_STATUS } from '../../constants';
import { orderService } from './orderService';
import { lotService } from './lotService';
import { shipmentService } from './shipmentService';
import { rtoService } from './rtoService';
import { returnService } from './returnService';
import { ndrService } from './ndrService';
import { walletService } from './walletService';
import { walletTransactionService } from './walletTransactionService';
import { WALLET_TRANSACTION_STATUS, RETURN_STATUS } from '../../constants';

import { IAnalyticsService, IRevenueAnalytics, IProductAnalytics, ICustomerAnalytics, ILotAnalytics, ILogisticsAnalytics, ICourierPerformance, IWalletAnalytics } from '../contracts/analyticsServiceInterface';

export class AnalyticsService implements IAnalyticsService {
  private get orderService() { return orderService; }
  private get lotService() { return lotService; }
  private get shipmentService() { return shipmentService; }
  private get rtoService() { return rtoService; }
  private get ndrService() { return ndrService; }
  private get walletService() { return walletService; }
  private get walletTransactionService() { return walletTransactionService; }
  private get returnService() { return returnService; }

  constructor() {}

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
          tax: { $sum: '$tax' },
          orders: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ];

    const result = await this.orderService.aggregate(pipeline as any) as any[];
    let totalRevenue = 0;
    let totalOrders = 0;
    let totalTax = 0;

    const timeline = result.map(item => {
      totalRevenue += item.revenue;
      totalOrders += item.orders;
      totalTax += item.tax || 0;
      return {
        date: item._id,
        revenue: item.revenue,
        orders: item.orders,
        tax: item.tax || 0,
        aov: item.orders > 0 ? Math.round(item.revenue / item.orders) : 0
      };
    });

    return {
      revenue: totalRevenue,
      orders: totalOrders,
      tax: totalTax,
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
          status: { $nin: [RETURN_STATUS.CANCELLED, RETURN_STATUS.REJECTED] }
        }
      },
      { $unwind: '$items' },
      // Join with SKU to get name and skuCode
      {
        $lookup: {
          from: 'skus',
          localField: 'items.skuId',
          foreignField: '_id',
          as: 'sku'
        }
      },
      { $unwind: '$sku' },
      {
        $group: {
          _id: '$sku.productId',
          name: { $first: '$sku.skuCode' }, // Fallback to skuCode if needed, but we prefer Product name
          skuCode: { $first: '$sku.skuCode' },
          returnCount: { $sum: '$items.quantity' }
        }
      },
      // Join with Product for accurate name
      {
        $lookup: {
          from: 'products',
          localField: '_id',
          foreignField: '_id',
          as: 'product'
        }
      },
      { $unwind: { path: '$product', preserveNullAndEmptyArrays: true } },
      {
        $project: {
          _id: 1,
          name: { $ifNull: ['$product.name', '$name'] },
          skuCode: 1,
          returnCount: 1
        }
      },
      { $sort: { returnCount: -1 } },
      { $limit: 10 }
    ];

    const [topProducts, topReturns] = await Promise.all([
      this.orderService.aggregate(salesPipeline as any) as Promise<any[]>,
      this.returnService.aggregate(returnsPipeline as any) as Promise<any[]>
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
          orderStatus: { $in: [ORDER_STATUS.DELIVERED, ORDER_STATUS.SHIPPED, ORDER_STATUS.PROCESSING, ORDER_STATUS.CONFIRMED] }
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
      { $unwind: { path: '$user', preserveNullAndEmptyArrays: true } },
      {
        $project: {
          name: { 
            $cond: [
              { $and: ['$user.firstName', '$user.lastName'] },
              { $concat: ['$user.firstName', ' ', '$user.lastName'] },
              { $ifNull: ['$user.firstName', { $ifNull: ['$user.lastName', 'Valued Customer'] }] }
            ]
          },
          email: { $ifNull: ['$user.email', 'N/A'] },
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
        $match: { 
          lastOrderDate: { $lt: sixtyDaysAgo }, 
          totalSpend: { $gt: 0 } 
        }
      },
      { $sort: { totalSpend: -1 } },
      { $limit: 10 },
      {
        $lookup: { from: 'users', localField: '_id', foreignField: '_id', as: 'user' }
      },
      { $unwind: { path: '$user', preserveNullAndEmptyArrays: true } },
      {
        $project: {
          name: { 
            $cond: [
              { $and: ['$user.firstName', '$user.lastName'] },
              { $concat: ['$user.firstName', ' ', '$user.lastName'] },
              { $ifNull: ['$user.firstName', { $ifNull: ['$user.lastName', 'Valued Customer'] }] }
            ]
          },
          email: { $ifNull: ['$user.email', 'N/A'] },
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
      // Check if this is the user's first order
      {
        $lookup: {
          from: 'orders',
          let: { uId: '$userId', cAt: '$createdAt' },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    { $eq: ['$userId', '$$uId'] },
                    { $lt: ['$createdAt', '$$cAt'] },
                    { $not: { $in: ['$orderStatus', [ORDER_STATUS.CANCELLED, ORDER_STATUS.PENDING]] } }
                  ]
                }
              }
            },
            { $limit: 1 },
            { $project: { _id: 1 } }
          ],
          as: 'previousOrders'
        }
      },
      {
        $project: {
          totalAmount: 1,
          isNew: { $eq: [{ $size: '$previousOrders' }, 0] }
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
                { $and: [{ $eq: ['$status', 'DELIVERED'] }, { $ne: ['$actualDeliveryDate', null] }, { $ne: ['$pickupCompletedDate', null] }] },
                { $divide: [{ $subtract: ['$actualDeliveryDate', '$pickupCompletedDate'] }, 1000 * 60 * 60 * 24] },
                0
              ]
            }
          },
          onTimeDeliveries: {
            $sum: {
              $cond: [
                { $and: [{ $eq: ['$status', 'DELIVERED'] }, { $ne: ['$actualDeliveryDate', null] }, { $ne: ['$estimatedDeliveryDate', null] }, { $lte: ['$actualDeliveryDate', '$estimatedDeliveryDate'] }] },
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

  /**
   * Get wallet analytics (System totals, pending, expiring)
   */
  async getWalletAnalytics(startDate: Date, endDate: Date): Promise<IWalletAnalytics> {
    const walletStats = await this.walletService.aggregate([
      {
        $group: {
          _id: null,
          totalBalance: { $sum: '$availableBalance' },
          blockedBalance: { $sum: '$blockedBalance' },
          totalWallets: { $sum: 1 }
        }
      }
    ]) as any[];

    const stats = walletStats[0] || { totalBalance: 0, blockedBalance: 0, totalWallets: 0 };

    // Pending Cashback from transactions
    const pendingStats = await this.walletTransactionService.aggregate([
      {
        $match: {
          status: WALLET_TRANSACTION_STATUS.PENDING,
          createdAt: { $gte: startDate, $lte: endDate }
        }
      },
      {
        $group: {
          _id: null,
          count: { $sum: 1 },
          amount: { $sum: '$amount' }
        }
      }
    ]) as any[];

    const pending = pendingStats[0] || { count: 0, amount: 0 };

    // Expiring soon (Next 7 days)
    const sevenDaysFromNow = new Date();
    sevenDaysFromNow.setDate(sevenDaysFromNow.getDate() + 7);

    const expiringStats = await this.walletTransactionService.aggregate([
      {
        $match: {
          status: WALLET_TRANSACTION_STATUS.CONFIRMED,
          expiryDate: { $gte: new Date(), $lte: sevenDaysFromNow }
        }
      },
      {
        $group: {
          _id: null,
          count: { $sum: 1 },
          amount: { $sum: '$amount' }
        }
      }
    ]) as any[];

    const expiring = expiringStats[0] || { count: 0, amount: 0 };

    return {
      totalBalance: stats.totalBalance,
      blockedBalance: stats.blockedBalance,
      totalWallets: stats.totalWallets,
      pendingCashback: {
        count: pending.count,
        amount: pending.amount
      },
      expiringSoon: {
        count: expiring.count,
        amount: expiring.amount
      }
    };
  }
}

export const analyticsService = new AnalyticsService();
