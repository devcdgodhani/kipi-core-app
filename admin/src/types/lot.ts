export const LOT_TYPE = {
  SUPPLIER: 'SUPPLIER',
  SELF_MANUFACTURE: 'SELF_MANUFACTURE',
} as const;
export type LOT_TYPE = (typeof LOT_TYPE)[keyof typeof LOT_TYPE];

export const LOT_STATUS = {
  ACTIVE: 'ACTIVE',
  INACTIVE: 'INACTIVE',
  COMPLETED: 'COMPLETED',
} as const;
export type LOT_STATUS = (typeof LOT_STATUS)[keyof typeof LOT_STATUS];

export interface ILot {
  _id: string;
  lotNumber: string;
  type: LOT_TYPE;
  supplierId?: {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
    mobile: string;
  };
  basePrice: number;
  quantity: number;
  remainingQuantity: number;
  startDate?: string;
  endDate?: string;
  status: LOT_STATUS;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ILotFilters {
  search?: string;
  type?: LOT_TYPE | LOT_TYPE[];
  status?: LOT_STATUS | LOT_STATUS[];
  startDate?: { from?: string; to?: string };
  endDate?: { from?: string; to?: string };
  page?: number;
  limit?: number;
  isPaginate?: boolean;
}
