import { Document, Types } from 'mongoose';
import { CUSTOMER_APP_SETTINGS_STATUS } from '../constants/customerAppSettings';
import { IDefaultAttributes } from './common';
import { IFileStorageAttributes } from './fileStorage';

export interface ICustomerAppSettingsAttributes extends IDefaultAttributes {
  _id: Types.ObjectId;
  
  // Home page sections configuration
  sections: Array<{
    sectionId: string;
    isVisible: boolean;
    displayOrder: number;
    title?: string;
    subtitle?: string;
    viewAllLink?: string;
    viewAllText?: string;
    limit?: number;
  }>;
  
  // Feature cards
  features: Array<{
    icon: string;
    title: string;
    description: string;
    isActive: boolean;
    displayOrder: number;
    _id?: Types.ObjectId; // Optional: features usually have ids if subdocuments
  }>;
  
  // Footer configuration
  footer: {
    brand: {
      name: string;
      tagline: string;
      description: string;
    };
    socialLinks: Array<{
      platform: string;
      url: string;
      isActive: boolean;
    }>;
    columns: Array<{
      title: string;
      links: Array<{
        label: string;
        url: string;
        isActive: boolean;
      }>;
      displayOrder: number;
    }>;
    contact: {
      address: string;
      phone: string;
      email: string;
    };
    copyright: string;
    language: string;
    currency: string;
  };
  
  // Branding
  logo?: Types.ObjectId | IFileStorageAttributes;
  appName: string;
  favicon?: Types.ObjectId | IFileStorageAttributes;
  
  // System fields
  status: CUSTOMER_APP_SETTINGS_STATUS;
  isDefault: boolean;
}

export interface ICustomerAppSettingsDocument 
  extends Omit<ICustomerAppSettingsAttributes, '_id'>, Document {}
