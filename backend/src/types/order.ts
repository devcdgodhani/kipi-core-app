export interface IOrderItem {
  productId: string;
  skuId?: string;
  name: string;
  skuCode?: string;
  image?: string;
  quantity: number;
  price: number;
  total: number;
}

export interface IOrderAddress {
  name: string;
  mobile: string;
  street: string;
  city: string;
  state: string;
  country: string;
  pincode: string;
  landmark?: string;
}

export interface IOrder {
  userId: string;
  orderNumber: string;
  items: IOrderItem[];
  shippingAddress: IOrderAddress;
  billingAddress: IOrderAddress;
  paymentMethod: 'COD' | 'ONLINE';
  paymentStatus: 'PENDING' | 'COMPLETED' | 'FAILED' | 'REFUNDED';
  orderStatus: 'PENDING' | 'CONFIRMED' | 'PROCESSING' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED' | 'RETURNED';
  subTotal: number;
  couponCode?: string;
  discountAmount?: number;
  tax: number;
  shippingCost: number;
  totalAmount: number;
  notes?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export type TOrderCreateReq = Omit<IOrder, 'orderNumber' | 'createdAt' | 'updatedAt' | 'userId' | 'orderStatus' | 'paymentStatus' | 'totalAmount' | 'subTotal'>;

export type TOrderUpdateReq = Partial<IOrder>;

export type TOrderRes = {
  status: number;
  code: string;
  message: string;
  data?: IOrder;
};

export type TOrderListRes = {
  status: number;
  code: string;
  message: string;
  data: IOrder[];
};

export type TOrderListPaginationRes = {
  status: number;
  code: string;
  message: string;
  data: {
      limit: number;
      totalRecords: number;
      totalPages: number;
      hasPreviousPage: boolean;
      currentPage: number;
      hasNextPage: boolean;
      recordList: IOrder[];
  };
};
