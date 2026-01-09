import { PaymentModel } from '../../db/mongodb/models/paymentModel';
import { IPaymentAttributes, IPaymentDocument } from '../../interfaces/payment';
import { paymentGatewayService } from './PaymentGatewayService';
import { orderService } from './orderService';
import { IPaymentServiceContract } from '../contracts/IPaymentServiceContract';
import { PAYMENT_GATEWAY, PAYMENT_STATUS, PAYMENT_ERROR_MESSAGES, PAYMENT_GATEWAY_DEFAULTS } from '../../constants/payment';
import { IOrder } from '../../types/order';
import { ENV_VARIABLE } from '../../configs/env';
import { MongooseCommonService } from './mongooseCommonService';

/**
 * Payment Service
 * Core orchestrator for payment operations
 */
export class PaymentService 
  extends MongooseCommonService<IPaymentAttributes, IPaymentDocument>
  implements IPaymentServiceContract {
  private get paymentGatewayService() { return paymentGatewayService; }
  private get orderService() { return orderService; }

  constructor() {
    super(PaymentModel);
  }

  /**
   * Generate unique internal payment ID
   */
  private generatePaymentId(): string {
    return `PAY_${Date.now()}_${Math.random().toString(36).substring(7).toUpperCase()}`;
  }

  /**
   * Generate idempotency key
   */
  private generateIdempotencyKey(orderId: string, gatewayName: string): string {
    return `${orderId}_${gatewayName}_${Date.now()}`;
  }

  /**
   * Initiate payment for an order
   */
  async initiatePayment(
    orderId: string,
    gatewayName: PAYMENT_GATEWAY,
    userId: string
  ): Promise<{
    payment: IPaymentAttributes;
    redirectUrl?: string;
    redirectMethod?: 'GET' | 'POST';
    gatewayData?: any;
  }> {
    // Fetch order
    const order = await this.orderService.findById(orderId);
    if (!order) {
      throw new Error('Order not found');
    }

    // Check if payment already exists for this order
    const existingPayment = await this.findOne({
      orderId,
      status: { $in: [PAYMENT_STATUS.INITIATED, PAYMENT_STATUS.PENDING, PAYMENT_STATUS.SUCCESS] }
    } as any);

    if (existingPayment) {
      throw new Error(PAYMENT_ERROR_MESSAGES.PAYMENT_ALREADY_PROCESSED);
    }

    // Get gateway service
    const gatewayService = await this.paymentGatewayService.getGatewayService(gatewayName);

    // Create payment record
    const internalPaymentId = this.generatePaymentId();
    const idempotencyKey = this.generateIdempotencyKey(orderId, gatewayName);

    const payment = await this.create({
      orderId,
      userId,
      gatewayName,
      internalPaymentId,
      amount: order.totalAmount,
      currency: PAYMENT_GATEWAY_DEFAULTS.CURRENCY,
      status: PAYMENT_STATUS.INITIATED,
      idempotencyKey,
      refundedAmount: 0,
      refundCount: 0,
      createdBy: userId as any,
      metadata: {}
    } as any);

    // Initiate payment with gateway
    const callbackUrl = `${ENV_VARIABLE.BACKEND_API_URL}/api/v1/webhooks/phonepe`;
    const gatewayResponse = await gatewayService.createPayment(
      order as IOrder,
      order.totalAmount,
      { callbackUrl }
    );

    if (!gatewayResponse.success) {
      // Update payment status to failed
      await this.updateOne(
        { _id: (payment as any)._id } as any,
        {
          $set: {
            status: PAYMENT_STATUS.FAILED,
            metadata: {
              gatewayResponse: gatewayResponse
            }
          }
        } as any
      );
      throw new Error(gatewayResponse.error || 'Payment initiation failed');
    }

    // Update payment with gateway details
    await this.updateOne(
      { _id: (payment as any)._id } as any,
      {
        $set: {
          gatewayTransactionId: gatewayResponse.gatewayTransactionId,
          gatewayOrderId: gatewayResponse.gatewayOrderId,
          status: PAYMENT_STATUS.PENDING,
          metadata: {
            gatewayResponse: gatewayResponse.data
          }
        }
      } as any
    );

    // Update order with payment ID
    await this.orderService.updateOne(
      { _id: orderId },
      { $set: { paymentId: (payment as any)._id } }
    );

    const updatedPayment = await this.findById((payment as any)._id);

    return {
      payment: updatedPayment!,
      redirectUrl: gatewayResponse.redirectUrl,
      redirectMethod: gatewayResponse.redirectMethod,
      gatewayData: gatewayResponse.data
    };
  }

  /**
   * Verify payment after callback
   */
  async verifyPayment(
    paymentId: string,
    gatewayData: any
  ): Promise<IPaymentAttributes> {
    const payment = await this.findById(paymentId);
    if (!payment) {
      throw new Error(PAYMENT_ERROR_MESSAGES.PAYMENT_NOT_FOUND);
    }

    // Check if already processed
    if (payment.status === PAYMENT_STATUS.SUCCESS) {
      return payment;
    }

    // Get gateway service
    const gatewayService = await this.paymentGatewayService.getGatewayService(payment.gatewayName);

    // Verify payment with gateway
    const verifyResponse = await gatewayService.verifyPayment(gatewayData);

    const status = verifyResponse.success ? PAYMENT_STATUS.SUCCESS : PAYMENT_STATUS.FAILED;
    await this.updatePaymentStatus(paymentId, status, verifyResponse.metadata);

    return (await this.findById(paymentId)) as IPaymentAttributes;
  }

  /**
   * Update payment status and linked order
   */
  async updatePaymentStatus(
    paymentId: string,
    status: PAYMENT_STATUS,
    gatewayResponse?: any
  ): Promise<void> {
    const payment = await this.findById(paymentId);
    if (!payment) return;

    const updateData: any = {
      status,
      webhookProcessedAt: new Date()
    };

    if (gatewayResponse) {
      updateData.metadata = {
        ...payment.metadata,
        gatewayResponse
      };
    }

    await this.updateOne({ _id: paymentId } as any, { $set: updateData } as any);

    // Update Linked Order
    const orderStatusUpdate: any = {};
    if (status === PAYMENT_STATUS.SUCCESS) {
      orderStatusUpdate.paymentStatus = 'COMPLETED';
      // Auto confirm if currently pending
      const order = await this.orderService.findById((payment as any).orderId);
      if (order && (order as any).orderStatus === 'PENDING') {
        orderStatusUpdate.orderStatus = 'CONFIRMED';
      }
    } else if (status === PAYMENT_STATUS.FAILED) {
      orderStatusUpdate.paymentStatus = 'FAILED';
      // Auto cancel if payment failed
      orderStatusUpdate.orderStatus = 'CANCELLED';
    }

    if (Object.keys(orderStatusUpdate).length > 0) {
      await this.orderService.updateOne(
        { _id: (payment as any).orderId },
        { $set: orderStatusUpdate }
      );
    }
  }

  /**
   * Get payment by ID
   */
  async getPaymentById(paymentId: string): Promise<IPaymentAttributes | null> {
    return await this.findById(paymentId);
  }

  /**
   * Get payment by internal payment ID
   */
  async getPaymentByInternalId(internalPaymentId: string): Promise<IPaymentAttributes | null> {
    return await this.findOne({ internalPaymentId } as any);
  }

  /**
   * Get payment by gateway transaction ID or order ID
   */
  async getPaymentByGatewayId(gatewayId: string): Promise<IPaymentAttributes | null> {
    return await this.findOne({
      $or: [
        { gatewayTransactionId: gatewayId },
        { gatewayOrderId: gatewayId },
        { internalPaymentId: gatewayId } // Fallback to internal ID
      ]
    } as any);
  }

  /**
   * Get payments for an order
   */
  async getPaymentsByOrderId(orderId: string): Promise<IPaymentAttributes[]> {
    return await this.findAll({ orderId } as any, { sort: { createdAt: -1 } });
  }

  /**
   * Get payments for a user
   */
  async getPaymentsByUserId(
    userId: string,
    limit: number = 10,
    skip: number = 0
  ): Promise<IPaymentAttributes[]> {
    return await this.findAll({ userId } as any, {
      sort: { createdAt: -1 },
      limit,
      skip,
    });
  }

  /**
   * Fetch payment status from gateway
   */
  async fetchPaymentStatus(paymentId: string): Promise<any> {
    const payment = await this.findById(paymentId);
    if (!payment) {
      throw new Error(PAYMENT_ERROR_MESSAGES.PAYMENT_NOT_FOUND);
    }

    const gatewayService = await this.paymentGatewayService.getGatewayService(payment.gatewayName);
    const statusResponse = await gatewayService.fetchPaymentStatus(payment.gatewayTransactionId!);

    if (statusResponse.success) {
      await this.updatePaymentStatus(paymentId, statusResponse.status as PAYMENT_STATUS, statusResponse.metadata);
    } else {
      // Status check failed to get a definitive status, but if it's explicitly FAILED from gateway
      if (statusResponse.status === 'FAILED') {
        await this.updatePaymentStatus(paymentId, PAYMENT_STATUS.FAILED, statusResponse.metadata);
      }
    }

    return statusResponse;
  }
}
 
export const paymentService = new PaymentService();
