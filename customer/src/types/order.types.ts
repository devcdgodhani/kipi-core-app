export interface OrderItem {
  productId: string;
  skuId?: string;
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
  userId: string;
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
  timeline?: {
    status: string;
    timestamp: string;
    message: string;
  }[];
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateOrderRequest {
  items: OrderItem[];
  shippingAddress: OrderAddress;
  billingAddress: OrderAddress;
  paymentMethod: 'COD' | 'ONLINE';
  subTotal: number;
  tax: number;
  shippingCost: number;
  totalAmount: number;
}

export interface OrderListResponse {
    limit: number;
    totalRecords: number;
    totalPages: number;
    hasPreviousPage: boolean;
    currentPage: number;
    hasNextPage: boolean;
    recordList: Order[];
}
