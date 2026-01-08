import { Document, Types } from 'mongoose';
import { IDefaultAttributes } from './common';

export interface ICourierServiceType {
  type: string;
  name: string;
  estimatedDays: number;
  isActive: boolean;
}

export interface ICourierAttributes extends IDefaultAttributes {
  name: string;
  code: string;
  provider: string;
  isActive: boolean;
  isPrimary: boolean;
  serviceTypes: ICourierServiceType[];
  pricingConfig?: Record<string, any>;
  codCharges?: number;
  rtoCharges?: number;
  apiUrl?: string;
  apiCredentials?: string;
  webhookSecret?: string;
  avgDeliveryDays?: number;
  rtoPercentage?: number;
  onTimeDeliveryRate?: number;
  maxWeight?: number;
  maxCODAmount?: number;
  supportEmail?: string;
  supportPhone?: string;
  slaMin: number;
  slaMax: number;
}

export interface ICourierDocument extends Omit<ICourierAttributes, '_id'>, Document {}
