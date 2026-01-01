import type { IMedia } from './media';

export const PRODUCT_STATUS = {
  ACTIVE: 'ACTIVE',
  INACTIVE: 'INACTIVE',
  DRAFT: 'DRAFT',
  ARCHIVED: 'ARCHIVED',
} as const;
export type PRODUCT_STATUS = (typeof PRODUCT_STATUS)[keyof typeof PRODUCT_STATUS];

export interface IProductAttributeValue {
  attributeId: string | {
    _id: string;
    name: string;
    key: string;
    label: string;
    type: string;
  };
  value: any;
  label?: string;
}

export interface IProduct {
  _id: string;
  name: string;
  productCode: string;
  slug: string;
  description?: string;
  basePrice: number;
  salePrice?: number;
  offerPrice?: number;
  discount?: number;
  currency: string;
  media: IMedia[];
  mainImage?: string | any;
  mainImage_preview?: string;
  categoryIds: string[] | {
    _id: string;
    name: string;
    slug: string;
  }[];
  attributes: IProductAttributeValue[];
  status: PRODUCT_STATUS;
  stock: number;
  createdAt: string;
  updatedAt: string;
}

export interface IProductFilters {
  search?: string;
  status?: PRODUCT_STATUS | PRODUCT_STATUS[];
  categoryIds?: string | string[];
  page?: number;
  limit?: number;
  isPaginate?: boolean;
}
