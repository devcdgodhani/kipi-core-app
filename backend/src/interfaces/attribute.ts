import { Document } from 'mongoose';
import { ATTRIBUTE_TYPE } from '../constants';

export interface IAttributeAttributes {
  name: string;
  code: string;
  type: ATTRIBUTE_TYPE;
  options?: string[];
  isVariant: boolean; // True for variant-generating attributes (Size, Color)
  isSpecification: boolean; // True for non-variant attributes (Weight, Dimensions)
  group?: string; // e.g., "Physical", "Technical", "Warranty"
  displayOrder?: number;
  unit?: string; // e.g., "kg", "cm", "GB"
  validationRules?: {
    min?: number;
    max?: number;
    regex?: string;
  };
  isRequired: boolean;
  isActive: boolean;
}

export interface IAttribute extends Document, IAttributeAttributes {}
