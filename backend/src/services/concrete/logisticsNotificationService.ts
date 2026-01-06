import { WhatsAppService } from './whatsAppService';
import { sendEmail } from '../../helpers/sendEmail';
import { APP_DETAILS } from '../../constants';
import { ILogisticsNotificationService } from '../contracts/logisticsNotificationServiceInterface';
import { UserModel } from '../../db/mongodb/models/userModel';
import { format } from 'date-fns';

export class LogisticsNotificationService implements ILogisticsNotificationService {
  private whatsAppService: WhatsAppService;

  constructor() {
    this.whatsAppService = new WhatsAppService();
  }

  private async getCustomerDetails(userId: string) {
    const user = await UserModel.findById(userId);
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

    await this.whatsAppService.sendAutomatedMessage(customer.mobile, message);
    
    if (customer.email) {
      await sendEmail({
        to: customer.email,
        subject: `Order Confirmed - #${order.orderNumber}`,
        html: `<h1>Order Confirmed</h1><p>Hi ${customer.name},</p><p>Your order <b>#${order.orderNumber}</b> has been confirmed and is being processed.</p><p>Total Amount: ₹${order.totalAmount}</p>`
      });
    }
  }

  async notifyOrderShipped(order: any, shipment: any): Promise<void> {
    const customer = await this.getCustomerDetails(order.userId);
    if (!customer) return;

    const trackingUrl = `${APP_DETAILS.CUSTOMER_URL}/orders/${order._id}`;
    const message = `Package Alert! 🚀\n\nYour order #${order.orderNumber} has been shipped via ${shipment.carrier || 'our partner'}.\n\nTracking ID: ${shipment.trackingId || order.awb}\n\nTrack here: ${trackingUrl}\n\nGet ready to receive your goodies! 📦`;

    await this.whatsAppService.sendAutomatedMessage(customer.mobile, message);

    if (customer.email) {
      await sendEmail({
        to: customer.email,
        subject: `Your Order #${order.orderNumber} has been shipped!`,
        html: `<h1>Order Shipped</h1><p>Hi ${customer.name},</p><p>Your order is on its way!</p><p>Courier: ${shipment.carrier}</p><p>Tracking ID: ${shipment.trackingId || order.awb}</p><p><a href="${trackingUrl}">Track your package here</a></p>`
      });
    }
  }

  async notifyOutForDelivery(order: any, _shipment: any): Promise<void> {
    const customer = await this.getCustomerDetails(order.userId);
    if (!customer) return;

    const message = `Out for Delivery! 🚚\n\nHi ${customer.name}, your package from ${APP_DETAILS.APP_NAME} is out for delivery today.\n\nPlease ensure someone is available at the address to receive it.\n\nEnjoy your purchase! ✨`;

    await this.whatsAppService.sendAutomatedMessage(customer.mobile, message);
  }

  async notifyOrderDelivered(order: any, _shipment: any): Promise<void> {
    const customer = await this.getCustomerDetails(order.userId);
    if (!customer) return;

    const message = `Delivered! 🎁\n\nHi ${customer.name}, your order #${order.orderNumber} has been successfully delivered. 🎉\n\nWe hope you love what you got! Could you please share your feedback?\n\nRate us here: ${APP_DETAILS.CUSTOMER_URL}/orders/${order._id}\n\nSee you again soon! 👋`;

    await this.whatsAppService.sendAutomatedMessage(customer.mobile, message);
  }

  async notifyNdrIncident(order: any, ndr: any): Promise<void> {
    const customer = await this.getCustomerDetails(order.userId);
    if (!customer) return;

    const message = `Delivery Re-attempt Needed ⚠️\n\nHi ${customer.name}, we tried delivering your order #${order.orderNumber} but were unsuccessful.\n\nReason: ${ndr.ndrReasonText || 'Delivery attempt failed'}\n\nDon't worry! We will try again. If you have specific instructions, please reply here.`;

    await this.whatsAppService.sendAutomatedMessage(customer.mobile, message);
  }

  async notifyRtoInitiated(order: any, _shipment: any): Promise<void> {
    const customer = await this.getCustomerDetails(order.userId);
    if (!customer) return;

    const message = `Order Returning to Origin 🔄\n\nHi ${customer.name}, unfortunately, your order #${order.orderNumber} is being returned to us.\n\nThis could be due to multiple failed delivery attempts or incorrect address. Our team will contact you regarding the next steps.`;

    await this.whatsAppService.sendAutomatedMessage(customer.mobile, message);
  }

  async notifyReturnApproved(order: any, returnRequest: any): Promise<void> {
    const customer = await this.getCustomerDetails(order.userId);
    if (!customer) return;

    const message = `Return Request Approved! ✅\n\nHi ${customer.name}, your return request for order #${order.orderNumber} has been approved.\n\nOur courier partner will visit your address in the next 24-48 hours for the pickup. Please keep the items ready in their original packaging.\n\nReturn ID: ${returnRequest.returnNumber}`;

    await this.whatsAppService.sendAutomatedMessage(customer.mobile, message);

    if (customer.email) {
      await sendEmail({
        to: customer.email,
        subject: `Return Request Approved - #${returnRequest.returnNumber}`,
        html: `<h1>Return Approved</h1><p>Hi ${customer.name},</p><p>Your return request for order <b>#${order.orderNumber}</b> has been approved.</p><p><b>Return ID:</b> ${returnRequest.returnNumber}</p><p>Please keep the items ready for pickup.</p>`
      });
    }
  }

  async notifyRefundProcessed(order: any, returnRequest: any): Promise<void> {
    const customer = await this.getCustomerDetails(order.userId);
    if (!customer) return;

    const message = `Refund Processed! 💰\n\nHi ${customer.name}, great news! We have processed the refund of ₹${returnRequest.totalRefundAmount} for your return #${returnRequest.returnNumber}.\n\nThe amount should reflect in your original payment method within 5-7 business days.\n\nThank you for your patience! ✨`;

    await this.whatsAppService.sendAutomatedMessage(customer.mobile, message);

    if (customer.email) {
      await sendEmail({
        to: customer.email,
        subject: `Refund Processed - #${returnRequest.returnNumber}`,
        html: `<h1>Refund Processed</h1><p>Hi ${customer.name},</p><p>We have processed your refund for return <b>#${returnRequest.returnNumber}</b>.</p><p><b>Amount:</b> ₹${returnRequest.totalRefundAmount}</p><p>It will take 5-7 business days to reflect in your account.</p>`
      });
    }
  }
}

export const logisticsNotificationService = new LogisticsNotificationService();
