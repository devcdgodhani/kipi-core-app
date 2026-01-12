import type { Address } from './address.types';

export interface CheckoutItem {
  productId: string;
  skuId?: string;
  quantity: number;
  name: string;
  price: number;
  image?: string;
  total: number;
}

export interface CouponInfo {
  code: string;
  discountAmount: number;
  description?: string;
  type: 'PERCENTAGE' | 'FLAT';
  value: number;
}

export interface CheckoutState {
  step: 'CART' | 'ADDRESS' | 'PAYMENT' | 'CONFIRMATION'; 
  selectedAddress: Address | null;
  paymentMethod: 'COD' | 'ONLINE';
  appliedCoupon: CouponInfo | null;
  orderSummary: {
      subTotal: number;
      tax: number;
      shipping: number;
      discount: number;
      walletDiscount: number;
      total: number;
  };
  wallet: {
      useWallet: boolean;
      amountToUse: number;
  };
  walletBalance: number;
}


export interface CreateOrderRequest {
    shippingAddress: Address;
    billingAddress: Address;
    paymentMethod: 'COD' | 'ONLINE';
    selectedGateway?: string;
    couponCode?: string;
    useWallet?: boolean;
    walletAmount?: number;
}

export interface OrderResponse {
    _id: string;
    orderNumber: string;
    totalAmount: number;
    status: string;
    items: CheckoutItem[];
}
