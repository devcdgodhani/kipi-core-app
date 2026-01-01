export const SKU_STATUS = {
  ACTIVE: 'ACTIVE',
  INACTIVE: 'INACTIVE',
  OUT_OF_STOCK: 'OUT_OF_STOCK',
} as const;
export type SKU_STATUS = (typeof SKU_STATUS)[keyof typeof SKU_STATUS];

export interface ISkuAttributeValue {
  attributeId: string | {
    _id: string;
    name: string;
    key: string;
    label: string;
    type: string;
  };
  value: any;
}

export interface ISku {
  _id: string;
  productId: string | {
    _id: string;
    name: string;
  };
  skuCode: string;
  variantAttributes: ISkuAttributeValue[];
  basePrice?: number;
  salePrice?: number;
  offerPrice?: number;
  discount?: number;
  quantity: number;
  images?: string[];
  status: SKU_STATUS;
  lotId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ISkuFilters {
  search?: string;
  productId?: string;
  skuCode?: string;
  status?: SKU_STATUS | SKU_STATUS[];
  page?: number;
  limit?: number;
  isPaginate?: boolean;
}
