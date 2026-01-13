import { FinancialRecordModel } from '../../db/mongodb/models/financialRecordModel';
import { IFinancialRecordAttributes, IFinancialRecordDocument } from '../../interfaces/financialRecord';
import { IFinancialRecordService } from '../contracts/financialRecordServiceInterface';
import { MongooseCommonService } from './mongooseCommonService';
import { 
  TRANSACTION_TYPE, 
  INCOME_SUBTYPE, 
  EXPENSE_SUBTYPE,
  FINANCIAL_RECORD_STATUS 
} from '../../constants/financialRecord';
import { TFinancialAnalytics } from '../../types/financialRecord';
import { startOfDay, endOfDay } from 'date-fns';

export class FinancialRecordService
  extends MongooseCommonService<IFinancialRecordAttributes, IFinancialRecordDocument>
  implements IFinancialRecordService
{
  constructor() {
    super(FinancialRecordModel as any);
  }

  /**
   * Create automatic income record from order
   */
  async createAutomaticIncomeRecord(
    orderId: string,
    amount: number,
    date: Date
  ): Promise<IFinancialRecordAttributes> {
    const record = await this.create({
      transactionType: TRANSACTION_TYPE.INCOME,
      subtype: INCOME_SUBTYPE.ORDER,
      amount,
      startDate: startOfDay(date),
      endDate: endOfDay(date),
      isAutomatic: true,
      orderId: orderId as any,
      status: FINANCIAL_RECORD_STATUS.ACTIVE
    } as any);

    return record;
  }

  /**
   * Create automatic expense record from lot, return, or wallet transaction
   */
  async createAutomaticExpenseRecord(
    type: string,
    referenceId: string,
    amount: number,
    date: Date,
    referenceType: 'lot' | 'return' | 'wallet'
  ): Promise<IFinancialRecordAttributes> {
    const referenceField: any = {};
    
    if (referenceType === 'lot') {
      referenceField.lotId = referenceId;
    } else if (referenceType === 'return') {
      referenceField.returnId = referenceId;
    } else if (referenceType === 'wallet') {
      referenceField.walletTransactionId = referenceId;
    }

    const record = await this.create({
      transactionType: TRANSACTION_TYPE.EXPENSE,
      subtype: type,
      amount,
      startDate: startOfDay(date),
      endDate: endOfDay(date),
      isAutomatic: true,
      ...referenceField,
      status: FINANCIAL_RECORD_STATUS.ACTIVE
    } as any);

    return record;
  }

  /**
   * Get analytics for financial records within date range
   */
  async getAnalytics(
    startDate?: Date,
    endDate?: Date
  ): Promise<TFinancialAnalytics> {
    const matchStage: any = {
      status: FINANCIAL_RECORD_STATUS.ACTIVE
    };

    if (startDate || endDate) {
      matchStage.startDate = {};
      if (startDate) matchStage.startDate.$gte = startDate;
      if (endDate) matchStage.startDate.$lte = endDate;
    }

    // Get total income and expense
    const totals = await FinancialRecordModel.aggregate([
      { $match: matchStage },
      {
        $group: {
          _id: '$transactionType',
          total: { $sum: '$amount' },
          count: { $sum: 1 }
        }
      }
    ]);

    const totalIncome = totals.find(t => t._id === TRANSACTION_TYPE.INCOME)?.total || 0;
    const totalExpense = totals.find(t => t._id === TRANSACTION_TYPE.EXPENSE)?.total || 0;
    const transactionCount = totals.reduce((sum, t) => sum + t.count, 0);

    // Get income breakdown by subtype
    const incomeBySubtype = await FinancialRecordModel.aggregate([
      { $match: { ...matchStage, transactionType: TRANSACTION_TYPE.INCOME } },
      {
        $group: {
          _id: '$subtype',
          amount: { $sum: '$amount' },
          count: { $sum: 1 }
        }
      },
      {
        $project: {
          _id: 0,
          subtype: '$_id',
          amount: 1,
          count: 1
        }
      }
    ]);

    // Get expense breakdown by subtype
    const expenseBySubtype = await FinancialRecordModel.aggregate([
      { $match: { ...matchStage, transactionType: TRANSACTION_TYPE.EXPENSE } },
      {
        $group: {
          _id: '$subtype',
          amount: { $sum: '$amount' },
          count: { $sum: 1 }
        }
      },
      {
        $project: {
          _id: 0,
          subtype: '$_id',
          amount: 1,
          count: 1
        }
      }
    ]);

    // Get platform breakdown
    const platformBreakdown = await FinancialRecordModel.aggregate([
      { $match: { ...matchStage, platform: { $exists: true, $ne: null } } },
      {
        $group: {
          _id: '$platform',
          amount: { $sum: '$amount' },
          count: { $sum: 1 }
        }
      },
      {
        $project: {
          _id: 0,
          platform: '$_id',
          amount: 1,
          count: 1
        }
      }
    ]);

    // Get recent transactions
    const recentTransactions = await this.findAll(matchStage, {
      sort: { createdAt: -1 },
      limit: 10
    });

    return {
      totalIncome,
      totalExpense,
      netProfit: totalIncome - totalExpense,
      transactionCount,
      incomeBySubtype,
      expenseBySubtype,
      platformBreakdown,
      recentTransactions
    };
  }

  /**
   * Get records by date range
   */
  async getByDateRange(
    startDate: Date,
    endDate: Date,
    filters?: any
  ): Promise<IFinancialRecordDocument[]> {
    const query: any = {
      startDate: { $gte: startDate, $lte: endDate },
      status: FINANCIAL_RECORD_STATUS.ACTIVE,
      ...filters
    };

    return this.model.find(query).sort({ startDate: -1 });
  }

    async getDailyTrends(startDate: Date, endDate: Date): Promise<any[]> {
        const matchStage = {
            startDate: { $gte: startDate, $lte: endDate },
            status: FINANCIAL_RECORD_STATUS.ACTIVE
        };

        return this.model.aggregate([
            { $match: matchStage },
            {
                $group: {
                    _id: {
                        date: { $dateToString: { format: "%Y-%m-%d", date: "$startDate" } },
                        type: "$transactionType"
                    },
                    totalAmount: { $sum: "$amount" },
                    count: { $sum: 1 }
                }
            },
            {
                $group: {
                    _id: "$_id.date",
                    income: {
                        $sum: {
                            $cond: [{ $eq: ["$_id.type", TRANSACTION_TYPE.INCOME] }, "$totalAmount", 0]
                        }
                    },
                    expense: {
                        $sum: {
                            $cond: [{ $eq: ["$_id.type", TRANSACTION_TYPE.EXPENSE] }, "$totalAmount", 0]
                        }
                    },
                    incomeCount: {
                        $sum: {
                            $cond: [{ $eq: ["$_id.type", TRANSACTION_TYPE.INCOME] }, "$count", 0]
                        }
                    },
                    expenseCount: {
                        $sum: {
                            $cond: [{ $eq: ["$_id.type", TRANSACTION_TYPE.EXPENSE] }, "$count", 0]
                        }
                    }
                }
            },
            { $sort: { _id: 1 } }, // Sort by date ascending
            {
                $project: {
                    date: "$_id",
                    income: 1,
                    expense: 1,
                    netProfit: { $subtract: ["$income", "$expense"] },
                    incomeCount: 1,
                    expenseCount: 1,
                    _id: 0
                }
            }
        ]);
    }

    async getTypeBreakdown(startDate: Date, endDate: Date): Promise<any> {
        const matchStage = {
            startDate: { $gte: startDate, $lte: endDate },
            status: FINANCIAL_RECORD_STATUS.ACTIVE
        };

        const incomeBreakdown = await this.model.aggregate([
            { $match: { ...matchStage, transactionType: TRANSACTION_TYPE.INCOME } },
            {
                $group: {
                    _id: { subtype: "$subtype", platform: "$platform" },
                    amount: { $sum: "$amount" },
                    count: { $sum: 1 }
                }
            },
            {
                $group: {
                    _id: "$_id.subtype",
                    total: { $sum: "$amount" },
                    count: { $sum: "$count" },
                    platforms: {
                        $push: {
                            platform: { $ifNull: ["$_id.platform", "Direct"] },
                            amount: "$amount",
                            count: "$count"
                        }
                    }
                }
            }
        ]);

        const expenseBreakdown = await this.model.aggregate([
            { $match: { ...matchStage, transactionType: TRANSACTION_TYPE.EXPENSE } },
            {
                $group: {
                    _id: { subtype: "$subtype" },
                    amount: { $sum: "$amount" },
                    count: { $sum: 1 }
                }
            }
        ]);

        return {
            income: incomeBreakdown,
            expense: expenseBreakdown
        };
    }

    async getLotProfitability(startDate?: Date, endDate?: Date): Promise<any[]> {
        // 1. Get all Lots (active/completed)
        const { LotModel } = await import('../../db/mongodb/models/lotModel');
        const { OrderModel } = await import('../../db/mongodb/models/orderModel');
        
        // Helper to get Lot Revenue via Orders -> Items -> Sku -> Lot
        // This is complex, so we will do it in steps or a big pipeline.
        // A big pipeline on Orders is best.

        const revenueByLot = await OrderModel.aggregate([
            { $match: { orderStatus: { $ne: 'CANCELLED' } } }, // Only valid orders
            { $unwind: "$items" },
            {
                $lookup: {
                    from: "skus",
                    localField: "items.skuId",
                    foreignField: "_id",
                    as: "sku"
                }
            },
            { $unwind: "$sku" },
            {
                $group: {
                    _id: "$sku.lotId",
                    revenue: { $sum: "$items.total" }, // Or items.price * quantity
                    itemsSold: { $sum: "$items.quantity" }
                }
            }
        ]);

        // 2. Get Lot Expenses from Financial Records
        const expenseByLot = await this.model.aggregate([
            { 
                $match: { 
                    subtype: 'LOT_AMOUNT',
                    status: FINANCIAL_RECORD_STATUS.ACTIVE,
                    lotId: { $ne: null }
                } 
            },
            {
                $group: {
                    _id: "$lotId",
                    cost: { $sum: "$amount" }
                }
            }
        ]);

        // 3. Combine Data
        // Ideally we start with Lot collection to get Lot Number etc.
        const lots = await LotModel.find({}, 'lotNumber status basePrice quantity').lean();

        const report = lots.map(lot => {
            const lotIdStr = lot._id.toString();
            const revenueData = revenueByLot.find(r => r._id?.toString() === lotIdStr);
            const expenseData = expenseByLot.find(e => e._id?.toString() === lotIdStr);

            const revenue = revenueData ? revenueData.revenue : 0;
            const itemsSold = revenueData ? revenueData.itemsSold : 0;
            const cost = expenseData ? expenseData.cost : (lot.basePrice || 0) * (lot.quantity || 0); // Fallback to calculation if no record
            const profit = revenue - cost;
            const margin = revenue > 0 ? (profit / revenue) * 100 : 0;

            return {
                lotId: lot._id,
                lotNumber: lot.lotNumber,
                status: lot.status,
                totalRevenue: revenue,
                totalCost: cost,
                netProfit: profit,
                marginPercentage: parseFloat(margin.toFixed(2)),
                itemsSold: itemsSold,
                totalItems: lot.quantity
            };
        });

        // Filter by profitability or sort
        return report.sort((a, b) => b.netProfit - a.netProfit);
    }

    async getBankReports(startDate: Date, endDate: Date): Promise<any> {
        const matchStage = {
            startDate: { $gte: startDate, $lte: endDate },
            status: FINANCIAL_RECORD_STATUS.ACTIVE
        };

        const bankBreakdown = await this.model.aggregate([
            { $match: { ...matchStage } },
            {
                $group: {
                    _id: { 
                        bank: { $ifNull: ["$bankName", "Cash/Other"] },
                        type: "$transactionType"
                    },
                    total: { $sum: "$amount" },
                    count: { $sum: 1 }
                }
            },
            {
                $group: {
                    _id: "$_id.bank",
                    income: {
                        $sum: { $cond: [{ $eq: ["$_id.type", TRANSACTION_TYPE.INCOME] }, "$total", 0] }
                    },
                    expense: {
                        $sum: { $cond: [{ $eq: ["$_id.type", TRANSACTION_TYPE.EXPENSE] }, "$total", 0] }
                    },
                    transactionCount: { $sum: "$count" }
                }
            },
            {
                $project: {
                    bankName: "$_id",
                    income: 1,
                    expense: 1,
                    netFlow: { $subtract: ["$income", "$expense"] },
                    transactionCount: 1,
                    _id: 0
                }
            },
            { $sort: { income: -1 } }
        ]);

        return bankBreakdown;
    }
}

export const financialRecordService = new FinancialRecordService();
