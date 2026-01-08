import { Job } from 'bullmq';
import { QueueFactory } from '../../services/infrastructure/queueFactory';
import { PAYMENT_QUEUE_NAMES } from '../../jobs/queues/paymentQueues';
import { IPaymentWebhookJobPayload, JOB_NAMES } from '../../jobs/types';
import { PaymentService } from '../../services/concrete/PaymentService';
import { PaymentModel } from '../../db/mongodb/models/paymentModel';
import { PAYMENT_GATEWAY } from '../../constants/payment';

const paymentService = new PaymentService();

/**
 * Processor for payment webhooks
 */
const paymentWebhookProcessor = async (job: Job<IPaymentWebhookJobPayload>) => {
    const { provider, body, receivedAt } = job.data;
    console.log(`[PaymentWorker] Processing webhook for ${provider}, received at ${receivedAt}`);

    try {
        let paymentId: string | undefined;

        // Identify payment based on provider-specific payload
        if (provider === 'RAZORPAY') {
            const razorpayOrderId = body.payload?.payment?.entity?.order_id || body.payload?.order?.entity?.id;
            const payment = await PaymentModel.findOne({ gatewayOrderId: razorpayOrderId });
            paymentId = payment?._id?.toString();
        } else if (provider === 'PHONEPE') {
            const merchantTransactionId = body.data?.merchantTransactionId || body.merchantTransactionId;
            const payment = await PaymentModel.findOne({ gatewayTransactionId: merchantTransactionId });
            paymentId = payment?._id?.toString();
        } else if (provider === 'PAYTM') {
            const orderId = body.ORDERID;
            const payment = await PaymentModel.findOne({ gatewayOrderId: orderId });
            paymentId = payment?._id?.toString();
        }

        if (!paymentId) {
            console.error(`[PaymentWorker] Could not find payment for ${provider} webhook payload`);
            return; // Don't retry if payment not found? Or maybe it's not yet created?
        }

        await paymentService.verifyPayment(paymentId, body);
        console.log(`[PaymentWorker] Successfully verified payment ${paymentId} via ${provider} webhook`);
    } catch (error) {
        console.error(`[PaymentWorker] Error processing ${provider} webhook:`, error);
        throw error; // Rethrow to trigger BullMQ retry
    }
};

/**
 * Processor for payment status synchronization
 */
const paymentSyncProcessor = async (job: Job<{ paymentId: string }>) => {
    const { paymentId } = job.data;
    console.log(`[PaymentWorker] Syncing status for payment ${paymentId}`);

    try {
        await paymentService.fetchPaymentStatus(paymentId);
        console.log(`[PaymentWorker] Successfully synced status for payment ${paymentId}`);
    } catch (error) {
        console.error(`[PaymentWorker] Error syncing payment ${paymentId}:`, error);
        throw error;
    }
};

export const setupPaymentWorkers = () => {
    QueueFactory.createWorker(PAYMENT_QUEUE_NAMES.WEBHOOK, paymentWebhookProcessor);
    QueueFactory.createWorker(PAYMENT_QUEUE_NAMES.SYNC, paymentSyncProcessor);
    console.log('✅ Payment workers initialized');
};
