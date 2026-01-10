import { notificationQueue } from '../../jobs/notification/queue';
import { BULL_QUEUES } from '../../constants/bullQueue';
import { APP_DETAILS } from '../../constants';
import { ILogisticsNotificationService } from '../contracts/logisticsNotificationServiceInterface';
import { UserService } from './userService';

export class LogisticsNotificationService implements ILogisticsNotificationService {
  private userService = new UserService();

  private async getCustomerDetails(userId: string) {
    const user = await this.userService.findById(userId);
    if (!user || !user.mobile) return null;
    return {
      name: user.firstName || 'Customer',
      mobile: user.mobile,
      email: user.email
    };
  }

  async notifyOrderConfirmed(order: any): Promise<void> {
    const customer = await this.getCustomerDetails(order.userId);
    if (!customer) return;

    const message = `Hi ${customer.name}! 👋\n\nGreat news! Your order #${order.orderNumber} has been confirmed. 🛍️\n\nWe are preparing it for shipment and will notify you once it's on its way.\n\nThank you for choosing ${APP_DETAILS.APP_NAME}! ✨`;

    await notificationQueue.queue.add(BULL_QUEUES.NOTIFICATION.JOBS.SEND_EMAIL, {
      type: 'WHATSAPP',
      recipient: customer.mobile,
      template: 'ORDER_CONFIRMED',
      data: { body: message }
    });
    
    if (customer.email) {
      await notificationQueue.queue.add(BULL_QUEUES.NOTIFICATION.JOBS.SEND_EMAIL, {
        type: 'EMAIL',
        recipient: customer.email,
        template: 'ORDER_CONFIRMED',
        data: {
          subject: `Order Confirmed - #${order.orderNumber}`,
          body: `Hi ${customer.name}, Your order #${order.orderNumber} has been confirmed.`,
          html: `<h1>Order Confirmed</h1><p>Hi ${customer.name},</p><p>Your order <b>#${order.orderNumber}</b> has been confirmed and is being processed.</p><p>Total Amount: ₹${order.totalAmount}</p>`
        }
      });
    }
  }

  async notifyOrderShipped(order: any, shipment: any): Promise<void> {
    const customer = await this.getCustomerDetails(order.userId);
    if (!customer) return;

    const trackingUrl = `${APP_DETAILS.CUSTOMER_URL}/orders/${order._id}`;
    const message = `Package Alert! 🚀\n\nYour order #${order.orderNumber} has been shipped via ${shipment.carrier || 'our partner'}.\n\nTracking ID: ${shipment.trackingId || order.awb}\n\nTrack here: ${trackingUrl}\n\nGet ready to receive your goodies! 📦`;

    await notificationQueue.queue.add(BULL_QUEUES.NOTIFICATION.JOBS.SEND_EMAIL, {
      type: 'WHATSAPP',
      recipient: customer.mobile,
      template: 'ORDER_SHIPPED',
      data: { body: message }
    });

    if (customer.email) {
      await notificationQueue.queue.add(BULL_QUEUES.NOTIFICATION.JOBS.SEND_EMAIL, {
        type: 'EMAIL',
        recipient: customer.email,
        template: 'ORDER_SHIPPED',
        data: {
          subject: `Your Order #${order.orderNumber} has been shipped!`,
          body: `Hi ${customer.name}, Your order #${order.orderNumber} is on its way via ${shipment.carrier}.`,
          html: `<h1>Order Shipped</h1><p>Hi ${customer.name},</p><p>Your order is on its way!</p><p>Courier: ${shipment.carrier}</p><p>Tracking ID: ${shipment.trackingId || order.awb}</p><p><a href="${trackingUrl}">Track your package here</a></p>`
        }
      });
    }
  }

  async notifyOutForDelivery(order: any, _shipment: any): Promise<void> {
    const customer = await this.getCustomerDetails(order.userId);
    if (!customer) return;

    const message = `Out for Delivery! 🚚\n\nHi ${customer.name}, your package from ${APP_DETAILS.APP_NAME} is out for delivery today.\n\nPlease ensure someone is available at the address to receive it.\n\nEnjoy your purchase! ✨`;

    await notificationQueue.queue.add(BULL_QUEUES.NOTIFICATION.JOBS.SEND_EMAIL, {
      type: 'WHATSAPP',
      recipient: customer.mobile,
      template: 'OUT_FOR_DELIVERY',
      data: { body: message }
    });
  }

  async notifyOrderDelivered(order: any, _shipment: any): Promise<void> {
    const customer = await this.getCustomerDetails(order.userId);
    if (!customer) return;

    const message = `Delivered! 🎁\n\nHi ${customer.name}, your order #${order.orderNumber} has been successfully delivered. 🎉\n\nWe hope you love what you got! Could you please share your feedback?\n\nRate us here: ${APP_DETAILS.CUSTOMER_URL}/orders/${order._id}\n\nSee you again soon! 👋`;

    await notificationQueue.queue.add(BULL_QUEUES.NOTIFICATION.JOBS.SEND_EMAIL, {
      type: 'WHATSAPP',
      recipient: customer.mobile,
      template: 'ORDER_DELIVERED',
      data: { body: message }
    });
  }

  async notifyNdrIncident(order: any, ndr: any): Promise<void> {
    const customer = await this.getCustomerDetails(order.userId);
    if (!customer) return;

    const message = `Delivery Re-attempt Needed ⚠️\n\nHi ${customer.name}, we tried delivering your order #${order.orderNumber} but were unsuccessful.\n\nReason: ${ndr.ndrReasonText || 'Delivery attempt failed'}\n\nDon't worry! We will try again. If you have specific instructions, please reply here.`;

    await notificationQueue.queue.add(BULL_QUEUES.NOTIFICATION.JOBS.SEND_EMAIL, {
      type: 'WHATSAPP',
      recipient: customer.mobile,
      template: 'NDR_INCIDENT',
      data: { body: message }
    });
  }

  async notifyRtoInitiated(order: any, _shipment: any): Promise<void> {
    const customer = await this.getCustomerDetails(order.userId);
    if (!customer) return;

    const message = `Order Returning to Origin 🔄\n\nHi ${customer.name}, unfortunately, your order #${order.orderNumber} is being returned to us.\n\nThis could be due to multiple failed delivery attempts or incorrect address. Our team will contact you regarding the next steps.`;

    await notificationQueue.queue.add(BULL_QUEUES.NOTIFICATION.JOBS.SEND_EMAIL, {
      type: 'WHATSAPP',
      recipient: customer.mobile,
      template: 'RTO_INITIATED',
      data: { body: message }
    });
  }

  async notifyReturnApproved(order: any, returnRequest: any): Promise<void> {
    const customer = await this.getCustomerDetails(order.userId);
    if (!customer) return;

    const message = `Return Request Approved! ✅\n\nHi ${customer.name}, your return request for order #${order.orderNumber} has been approved.\n\nOur courier partner will visit your address in the next 24-48 hours for the pickup. Please keep the items ready in their original packaging.\n\nReturn ID: ${returnRequest.returnNumber}`;

    await notificationQueue.queue.add(BULL_QUEUES.NOTIFICATION.JOBS.SEND_EMAIL, {
      type: 'WHATSAPP',
      recipient: customer.mobile,
      template: 'RETURN_APPROVED',
      data: { body: message }
    });

    if (customer.email) {
      await notificationQueue.queue.add(BULL_QUEUES.NOTIFICATION.JOBS.SEND_EMAIL, {
        type: 'EMAIL',
        recipient: customer.email,
        template: 'RETURN_APPROVED',
        data: {
          subject: `Return Request Approved - #${returnRequest.returnNumber}`,
          body: `Hi ${customer.name}, Your return request #${returnRequest.returnNumber} has been approved.`,
          html: `<h1>Return Approved</h1><p>Hi ${customer.name},</p><p>Your return request for order <b>#${order.orderNumber}</b> has been approved.</p><p><b>Return ID:</b> ${returnRequest.returnNumber}</p><p>Please keep the items ready for pickup.</p>`
        }
      });
    }
  }

  async notifyRefundProcessed(order: any, returnRequest: any): Promise<void> {
    const customer = await this.getCustomerDetails(order.userId);
    if (!customer) return;

    const message = `Refund Processed! 💰\n\nHi ${customer.name}, great news! We have processed the refund of ₹${returnRequest.totalRefundAmount} for your return #${returnRequest.returnNumber}.\n\nThe amount should reflect in your original payment method within 5-7 business days.\n\nThank you for your patience! ✨`;

    await notificationQueue.queue.add(BULL_QUEUES.NOTIFICATION.JOBS.SEND_EMAIL, {
      type: 'WHATSAPP',
      recipient: customer.mobile,
      template: 'REFUND_PROCESSED',
      data: { body: message }
    });

    if (customer.email) {
      await notificationQueue.queue.add(BULL_QUEUES.NOTIFICATION.JOBS.SEND_EMAIL, {
        type: 'EMAIL',
        recipient: customer.email,
        template: 'REFUND_PROCESSED',
        data: {
          subject: `Refund Processed - #${returnRequest.returnNumber}`,
          body: `Hi ${customer.name}, Your refund for #${returnRequest.returnNumber} has been processed.`,
          html: `<h1>Refund Processed</h1><p>Hi ${customer.name},</p><p>We have processed your refund for return <b>#${returnRequest.returnNumber}</b>.</p><p><b>Amount:</b> ₹${returnRequest.totalRefundAmount}</p><p>It will take 5-7 business days to reflect in your account.</p>`
        }
      });
    }
  }
}

export const logisticsNotificationService = new LogisticsNotificationService();
