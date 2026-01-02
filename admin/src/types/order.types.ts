export interface OrderItem {
  productId: any;
  skuId?: any;
  name: string;
  skuCode?: string;
  image?: string;
  quantity: number;
  price: number;
  total: number;
}

export interface OrderAddress {
  name: string;
  mobile: string;
  street: string;
  city: string;
  state: string;
  country: string;
  pincode: string;
  landmark?: string;
}

export interface Order {
  _id: string;
  userId: any;
  orderNumber: string;
  items: OrderItem[];
  shippingAddress: OrderAddress;
  billingAddress: OrderAddress;
  paymentMethod: 'COD' | 'ONLINE';
  paymentStatus: 'PENDING' | 'COMPLETED' | 'FAILED' | 'REFUNDED';
  orderStatus: 'PENDING' | 'CONFIRMED' | 'PROCESSING' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED' | 'RETURNED';
  subTotal: number;
  tax: number;
  shippingCost: number;
  totalAmount: number;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}
