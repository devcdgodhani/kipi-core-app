import { PaymentModel } from '../../db/mongodb/models/paymentModel';
import { OrderModel } from '../../db/mongodb/models/orderModel';
import { IPaymentAttributes, IPaymentDocument } from '../../interfaces/payment';
import { PaymentGatewayService } from './PaymentGatewayService';
import { IPaymentServiceContract } from '../contracts/IPaymentServiceContract';
import { PAYMENT_GATEWAY, PAYMENT_STATUS, PAYMENT_ERROR_MESSAGES, PAYMENT_GATEWAY_DEFAULTS } from '../../constants/payment';
import { IOrder } from '../../types/order';

/**
 * Payment Service
 * Core orchestrator for payment operations
 */
export class PaymentService implements IPaymentServiceContract {
  private paymentGatewayService: PaymentGatewayService;

  constructor() {
    this.paymentGatewayService = new PaymentGatewayService();
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
    payment: IPaymentDocument;
    redirectUrl?: string;
    redirectMethod?: 'GET' | 'POST';
    gatewayData?: any;
  }> {
    // Fetch order
    const order = await OrderModel.findById(orderId).lean();
    if (!order) {
      throw new Error('Order not found');
    }

    // Check if payment already exists for this order
    const existingPayment = await PaymentModel.findOne({
      orderId,
      status: { $in: [PAYMENT_STATUS.INITIATED, PAYMENT_STATUS.PENDING, PAYMENT_STATUS.SUCCESS] }
    });

    if (existingPayment) {
      throw new Error(PAYMENT_ERROR_MESSAGES.PAYMENT_ALREADY_PROCESSED);
    }

    // Get gateway service
    const gatewayService = await this.paymentGatewayService.getGatewayService(gatewayName);

    // Create payment record
    const internalPaymentId = this.generatePaymentId();
    const idempotencyKey = this.generateIdempotencyKey(orderId, gatewayName);

    const payment = await PaymentModel.create({
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
      createdBy: userId,
      metadata: {}
    });

    // Initiate payment with gateway
    const callbackUrl = `${process.env.BACKEND_API_URL}/api/v1/webhook/${gatewayName}/payment`;
    const gatewayResponse = await gatewayService.createPayment(
      order as IOrder,
      order.totalAmount,
      { callbackUrl }
    );

    if (!gatewayResponse.success) {
      // Update payment status to failed
      await PaymentModel.updateOne(
        { _id: payment._id },
        {
          $set: {
            status: PAYMENT_STATUS.FAILED,
            metadata: {
              gatewayResponse: gatewayResponse
            }
          }
        }
      );
      throw new Error(gatewayResponse.error || 'Payment initiation failed');
    }

    // Update payment with gateway details
    await PaymentModel.updateOne(
      { _id: payment._id },
      {
        $set: {
          gatewayTransactionId: gatewayResponse.transactionId,
          gatewayOrderId: gatewayResponse.orderId,
          status: PAYMENT_STATUS.PENDING,
          metadata: {
            gatewayResponse: gatewayResponse.data
          }
        }
      }
    );

    // Update order with payment ID
    await OrderModel.updateOne(
      { _id: orderId },
      { $set: { paymentId: payment._id } }
    );

    const updatedPayment = await PaymentModel.findById(payment._id).lean();

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
  ): Promise<IPaymentDocument> {
    const payment = await PaymentModel.findById(paymentId);
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

    // Update payment status
    const updateData: Partial<IPaymentAttributes> = {
      webhookReceivedAt: new Date(),
      webhookProcessedAt: new Date()
    };

    if (verifyResponse.success) {
      updateData.status = PAYMENT_STATUS.SUCCESS;
      updateData.metadata = {
        ...payment.metadata,
        paymentMethod: verifyResponse.paymentMethod,
        gatewayResponse: verifyResponse.gatewayResponse
      };

      // Update order payment status
      await OrderModel.updateOne(
        { _id: payment.orderId },
        { $set: { paymentStatus: 'COMPLETED', orderStatus: 'CONFIRMED' } }
      );
    } else {
      updateData.status = PAYMENT_STATUS.FAILED;
      updateData.metadata = {
        ...payment.metadata,
        error: verifyResponse.error,
        errorCode: verifyResponse.errorCode
      };
    }

    await PaymentModel.updateOne({ _id: paymentId }, { $set: updateData });

    return (await PaymentModel.findById(paymentId))!;
  }

  /**
   * Get payment by ID
   */
  async getPaymentById(paymentId: string): Promise<IPaymentDocument | null> {
    return await PaymentModel.findById(paymentId).lean();
  }

  /**
   * Get payment by internal payment ID
   */
  async getPaymentByInternalId(internalPaymentId: string): Promise<IPaymentDocument | null> {
    return await PaymentModel.findOne({ internalPaymentId }).lean();
  }

  /**
   * Get payments for an order
   */
  async getPaymentsByOrderId(orderId: string): Promise<IPaymentDocument[]> {
    return await PaymentModel.find({ orderId }).sort({ createdAt: -1 }).lean();
  }

  /**
   * Get payments for a user
   */
  async getPaymentsByUserId(
    userId: string,
    limit: number = 10,
    skip: number = 0
  ): Promise<IPaymentDocument[]> {
    return await PaymentModel.find({ userId })
      .sort({ createdAt: -1 })
      .limit(limit)
      .skip(skip)
      .lean();
  }

  /**
   * Fetch payment status from gateway
   */
  async fetchPaymentStatus(paymentId: string): Promise<any> {
    const payment = await PaymentModel.findById(paymentId);
    if (!payment) {
      throw new Error(PAYMENT_ERROR_MESSAGES.PAYMENT_NOT_FOUND);
    }

    const gatewayService = await this.paymentGatewayService.getGatewayService(payment.gatewayName);
    return await gatewayService.fetchPaymentStatus(payment.gatewayTransactionId!);
  }
}
