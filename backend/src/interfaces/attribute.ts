import { Document, ObjectId } from 'mongoose';
import { IDefaultAttributes } from './common';
import { ATTRIBUTE_STATUS, ATTRIBUTE_VALUE_TYPE, ATTRIBUTE_INPUT_TYPE } from '../constants';

export interface IAttributeOption {
  label: string;
  value: string;
  color?: string;
}

export interface IAttributeValidation {
  required?: boolean;
  min?: number;
  max?: number;
  pattern?: string;
  customMessage?: string;
}

export interface IAttributeAttributes extends IDefaultAttributes {
  _id: ObjectId;
  name: string;
  slug: string;
  description?: string;
  valueType: ATTRIBUTE_VALUE_TYPE;
  inputType: ATTRIBUTE_INPUT_TYPE;
  options?: IAttributeOption[]; // For SELECT and MULTI_SELECT types
  defaultValue?: any;
  validation?: IAttributeValidation;
  unit?: string; // For measurements like "cm", "kg", etc.
  isFilterable: boolean; // Can be used in product filters
  isRequired: boolean; // Required when creating products
  isVariant: boolean; // Can be used as product variant (like Size, Color)
  categoryIds: ObjectId[]; // Categories this attribute belongs to
  order: number;
  status: ATTRIBUTE_STATUS;
}

export interface IAttributeDocument extends IAttributeAttributes, Document {
  _id: any;
}
