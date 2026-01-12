import { ReturnModel } from '../../db/mongodb/models/returnModel';
import { IReturn } from '../../interfaces/return';
import { MongooseCommonService } from './mongooseCommonService';
import { RETURN_STATUS } from '../../constants/return';
import { ApiError } from '../../helpers/apiError';
import { HTTP_STATUS_CODE } from '../../constants';
import { orderService } from './orderService';
import { paymentService } from './paymentService';

import { inventoryService } from './inventoryService';
import { IReturnService } from '../contracts/returnServiceInterface';
import { logisticsNotificationService } from './logisticsNotificationService';
import { paymentRefundService } from './paymentRefundService';
import { REFUND_REASON } from '../../constants/payment';
import { walletService } from './walletService';
import { walletTransactionService } from './walletTransactionService';
import { WALLET_SOURCE_TYPE, WALLET_TRANSACTION_TYPE } from '../../constants/walletTransaction';

export class ReturnService extends MongooseCommonService<IReturn, IReturn> implements IReturnService {
    private get refundService() { return paymentRefundService; }
    private get orderService() { return orderService; }
    private get paymentService() { return paymentService; }

    constructor() {
        super(ReturnModel as any);
    }

    generateReturnNumber = (): string => {
        const date = new Date();
        const prefix = 'RET';
        const dateStr = date.toISOString().slice(0, 10).replace(/-/g, '');
        const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
        return `${prefix}-${dateStr}-${random}`;
    };

    async requestReturn(data: Partial<IReturn>): Promise<IReturn> {
        if (!data.orderId) {
            throw new ApiError(HTTP_STATUS_CODE.BAD_REQUEST.CODE, HTTP_STATUS_CODE.BAD_REQUEST.STATUS, 'Order ID is required');
        }

        const order = await this.orderService.findById(data.orderId as any);
        if (!order) {
            throw new ApiError(HTTP_STATUS_CODE.NOTFOUND.CODE, HTTP_STATUS_CODE.NOTFOUND.STATUS, 'Original order not found');
        }

        // Security Check: Only delivered orders can be returned
        if (order.orderStatus !== 'DELIVERED') {
            throw new ApiError(HTTP_STATUS_CODE.BAD_REQUEST.CODE, HTTP_STATUS_CODE.BAD_REQUEST.STATUS, `Cannot return an order that is in ${order.orderStatus} state`);
        }

        // Anti-Tampering Logic: Re-calculate and validate items
        let validatedRefundAmount = 0;
        const validatedItems = [];

        for (const returnItem of (data.items || [])) {
            const orderItem = order.items.find(oi => 
                (oi.skuId?.toString() === returnItem.skuId?.toString()) || 
                (oi.productId?.toString() === returnItem.skuId?.toString())
            );

            if (!orderItem) {
                throw new ApiError(HTTP_STATUS_CODE.BAD_REQUEST.CODE, HTTP_STATUS_CODE.BAD_REQUEST.STATUS, `Item identification mismatch for ID: ${returnItem.skuId}`);
            }

            if (returnItem.quantity > orderItem.quantity) {
                throw new ApiError(HTTP_STATUS_CODE.BAD_REQUEST.CODE, HTTP_STATUS_CODE.BAD_REQUEST.STATUS, `Return quantity exceeds purchase quantity for ${orderItem.name}`);
            }

            // Force original order price to override any incoming tampered price
            const actualPrice = orderItem.price;
            validatedItems.push({
                ...returnItem,
                price: actualPrice
            });
            validatedRefundAmount += actualPrice * returnItem.quantity;
        }

        // Lock the data state
        data.items = validatedItems as any;
        data.totalRefundAmount = validatedRefundAmount;

        const returnNumber = this.generateReturnNumber();
        const timeline = [{
            status: RETURN_STATUS.PENDING,
            timestamp: new Date(),
            message: 'Return request submitted by customer'
        }];

        return this.create({
            ...data,
            returnNumber,
            status: RETURN_STATUS.PENDING,
            timeline
        });
    }

    async updateReturnStatus(id: string, status: RETURN_STATUS, adminNotes?: string): Promise<IReturn | null> {
        const returnRequest = await this.findById(id);
        if (!returnRequest) {
            throw new ApiError(HTTP_STATUS_CODE.NOTFOUND.CODE, HTTP_STATUS_CODE.NOTFOUND.STATUS, 'Return request not found');
        }

        const timelineEntry = {
            status,
            timestamp: new Date(),
            message: `Return status updated to ${status}. ${adminNotes || ''}`
        };

        const updateData: any = {
            status,
            $push: { timeline: timelineEntry }
        };

        if (adminNotes) updateData.adminNotes = adminNotes;

        // --- PHASE 3: RESTOCKING LOGIC ---
        if (status === RETURN_STATUS.COMPLETED && returnRequest.status !== RETURN_STATUS.COMPLETED) {
            for (const item of returnRequest.items) {
                await inventoryService.restock({
                    skuId: item.skuId?.toString(),
                    quantity: item.quantity,
                    referenceId: id as any,
                    referenceType: 'RETURN',
                    reason: `Return #${returnRequest.returnNumber} completed`
                });
            }

            // 1.1 Automatic Refund for Online Payments
            const order = await this.orderService.findById(returnRequest.orderId as any);
            if (order) {
                // --- CASHBACK REVOCATION LOGIC ---
                let adjustedRefundAmount = returnRequest.totalRefundAmount;
                const awardedCashback = await walletTransactionService.getTransactionsBySource(
                    (order as any)._id.toString(),
                    WALLET_SOURCE_TYPE.ORDER_CASHBACK
                );

                const totalConfirmedCashback = awardedCashback
                    .filter(tx => tx.status === 'CONFIRMED' && tx.transactionType === WALLET_TRANSACTION_TYPE.CREDIT)
                    .reduce((sum, tx) => sum + tx.amount, 0);

                if (totalConfirmedCashback > 0) {
                    console.log(`[ReturnService] Revoking ₹${totalConfirmedCashback} cashback for Order #${(order as any).orderNumber}`);
                    
                    const shortfall = await walletService.revokeCashback(
                        (order as any).userId.toString(),
                        totalConfirmedCashback,
                        {
                            orderId: (order as any)._id,
                            orderNumber: (order as any).orderNumber,
                            description: `Revocation for Return #${returnRequest.returnNumber}`
                        }
                    );

                    if (shortfall > 0) {
                        console.log(`[ReturnService] Cashback shortfall of ₹${shortfall} detected. Deducting from refund.`);
                        adjustedRefundAmount = Math.max(0, adjustedRefundAmount - shortfall);
                    }
                }

                if ((order as any).paymentMethod !== 'COD') {
                    const payment = await this.paymentService.findOne({ orderId: (order as any)._id, status: 'SUCCESS' } as any);
                    if (payment) {
                        try {
                            await this.refundService.initiateRefund(
                                payment._id.toString(),
                                adjustedRefundAmount,
                                REFUND_REASON.RETURN,
                                `Refund for Return #${returnRequest.returnNumber}${adjustedRefundAmount !== returnRequest.totalRefundAmount ? ' (Adjusted for cashback)' : ''}`,
                                'SYSTEM'
                            );
                            console.log(`✅ Auto-refund initiated for Return #${returnRequest.returnNumber} with amount ₹${adjustedRefundAmount}`);
                        } catch (refundError) {
                            console.error(`❌ Auto-refund failed for Return #${returnRequest.returnNumber}:`, refundError);
                        }
                    }
                }
            }
        }

        const updatedReturn = await this.findOneAndUpdate({ _id: id } as any, updateData as any, { new: true });

        // Trigger Notifications
        if (updatedReturn) {
            const order = await this.orderService.findById(updatedReturn.orderId as any);
            if (order) {
                if (status === RETURN_STATUS.APPROVED) {
                    await logisticsNotificationService.notifyReturnApproved(order, updatedReturn);
                } else if (status === RETURN_STATUS.COMPLETED) {
                    await logisticsNotificationService.notifyRefundProcessed(order, updatedReturn);
                }
            }
        }

        return updatedReturn;
    }

    async cancelReturn(id: string, userId: string): Promise<IReturn | null> {
        const returnRequest = await this.findOne({ _id: id, userId });
        if (!returnRequest) {
            throw new ApiError(HTTP_STATUS_CODE.NOTFOUND.CODE, HTTP_STATUS_CODE.NOTFOUND.STATUS, 'Return request not found');
        }

        if (returnRequest.status !== RETURN_STATUS.PENDING) {
            throw new ApiError(HTTP_STATUS_CODE.BAD_REQUEST.CODE, HTTP_STATUS_CODE.BAD_REQUEST.STATUS, 'Only pending returns can be cancelled');
        }

        const timelineEntry = {
            status: RETURN_STATUS.CANCELLED,
            timestamp: new Date(),
            message: 'Return request cancelled by user'
        };

        const updateData: any = {
            status: RETURN_STATUS.CANCELLED,
            $push: { timeline: timelineEntry }
        };

        return this.findOneAndUpdate({ _id: id } as any, updateData as any, { new: true });
    }
}

export const returnService = new ReturnService();
