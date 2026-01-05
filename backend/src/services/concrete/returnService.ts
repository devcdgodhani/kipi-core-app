import { ReturnModel } from '../../db/mongodb/models/returnModel';
import { IReturn } from '../../interfaces/return';
import { MongooseCommonService } from './mongooseCommonService';
import { RETURN_STATUS } from '../../constants/return';
import { ApiError } from '../../helpers/apiError';
import { HTTP_STATUS_CODE } from '../../constants';
import { inventoryAuditService } from './inventoryAuditService';
import { SkuModel, OrderModel, ProductModel } from '../../db/mongodb';

export class ReturnService extends MongooseCommonService<IReturn, IReturn> {
    constructor() {
        super(ReturnModel);
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

        const order = await OrderModel.findById(data.orderId);
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
                if (item.skuId) {
                    // Try SKU first
                    const sku = await SkuModel.findById(item.skuId);
                    if (sku) {
                        const previousQuantity = sku.quantity;
                        sku.quantity += item.quantity;
                        await sku.save();

                        // Log Inventory Audit
                        await inventoryAuditService.logAdjustment({
                            skuId: item.skuId.toString(),
                            transactionType: 'RETURN_RESTOCK',
                            changeQuantity: item.quantity,
                            previousQuantity,
                            newQuantity: sku.quantity,
                            referenceId: id as any,
                            referenceType: 'ORDER',
                            reason: `Return #${returnRequest.returnNumber} completed (SKU Restock)`
                        });
                    } else {
                        // If not a SKU, try Product (Simple Product fallback)
                        const product = await ProductModel.findById(item.skuId);
                        if (product) {
                            const previousQuantity = product.stock || 0;
                            product.stock = (product.stock || 0) + item.quantity;
                            await product.save();

                             // Log Inventory Audit (Product level)
                             await inventoryAuditService.logAdjustment({
                                productId: item.skuId.toString(),
                                transactionType: 'RETURN_RESTOCK',
                                changeQuantity: item.quantity,
                                previousQuantity,
                                newQuantity: product.stock,
                                referenceId: id as any,
                                referenceType: 'ORDER',
                                reason: `Return #${returnRequest.returnNumber} completed (Product Restock)`
                            } as any);
                        }
                    }
                }
            }
        }

        return this.model.findByIdAndUpdate({ _id: id }, updateData, { new: true });
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

        return this.model.findByIdAndUpdate({ _id: id }, updateData, { new: true });
    }
}

export const returnService = new ReturnService();
