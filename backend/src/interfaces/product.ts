import { Document, Types } from 'mongoose';
import { PRODUCT_STATUS, SOURCE_TYPE } from '../constants';

// SKU Interface
export interface ISkuAttributes {
  product: Types.ObjectId;
  sku: string;
  attributes: {
    attributeId: Types.ObjectId;
    value: string;
    attributeName?: string; // Optional snapshot for easier display
  }[];
  barcode?: string;
  ean?: string;
  upc?: string;
  weight?: number;
  dimensions?: {
    length?: number;
    width?: number;
    height?: number;
    unit?: string;
  };
  manufacturingDate?: Date;
  expiryDate?: Date;
  images?: string[];
  isDefault?: boolean;
  isActive: boolean; // Changed to boolean type as it's an interface
  // Integrated price fields
  mrp: number;
  sellingPrice: number;
  costPrice?: number;
  // Integrated stock fields (snapshot or simplified)
  stock?: number;
  lotId?: Types.ObjectId;
}

export interface ISku extends Document, ISkuAttributes {}

// Product Interface
export interface IProductAttributes {
  name: string;
  slug: string;
  description?: string;
  category: Types.ObjectId;
  sourceType: SOURCE_TYPE;
  supplierId?: Types.ObjectId; // Reference to User with type SUPPLIER
  hasLotTracking: boolean; // If true, inventory tracked by lots
  brand?: string;
  variantAttributes?: Types.ObjectId[]; // Attributes used for variant generation
  specifications?: Record<string, any>; // Non-variant attributes
  status: PRODUCT_STATUS;
  images?: string[];
  tags?: string[];
  metaData?: {
    seoTitle?: string;
    seoDescription?: string;
    seoKeywords?: string[];
  };
  // Integrated price fields for base product
  mrp?: number;
  sellingPrice?: number;
  costPrice?: number;
  
  // Virtuals or populated fields
  skus?: ISku[]; 
}

export interface IProduct extends Document, IProductAttributes {}
