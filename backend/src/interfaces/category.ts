import { Document, Types } from 'mongoose';

export interface ICategoryAttributes {
  name: string;
  slug: string;
  parentId?: Types.ObjectId | null;
  level: number; // 0 for root, 1 for first child, etc.
  path: Types.ObjectId[]; // Array of ancestor IDs
  breadcrumb: string[]; // Array of ancestor names
  attributes?: Types.ObjectId[]; // Array of Attribute IDs
  description?: string;
  image?: string;
  displayOrder?: number;
  childrenCount?: number;
  productCount?: number;
  isActive: boolean;
}

export interface ICategory extends Document, ICategoryAttributes {}
