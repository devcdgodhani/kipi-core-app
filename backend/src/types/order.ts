import { IOrderAttributes } from '../interfaces';

export type TOrderCreateReq = Omit<IOrderAttributes, '_id' | 'orderNumber' | 'createdAt' | 'updatedAt' | 'userId' | 'orderStatus' | 'paymentStatus' | 'isDeleted' | 'isActive'>;

export type TOrderUpdateReq = Partial<IOrderAttributes>;

export type TOrderRes = {
  status: number;
  code: string;
  message: string;
  data?: IOrderAttributes;
};

export type TOrderListRes = {
  status: number;
  code: string;
  message: string;
  data: IOrderAttributes[];
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
      recordList: IOrderAttributes[];
  };
};
