import { Document, ObjectId } from 'mongoose';
import { CUSTOMER_APP_SETTINGS_STATUS } from '../constants/customerAppSettings';
import { IDefaultAttributes } from './common';

export interface ICustomerAppSettingsAttributes extends IDefaultAttributes {
  _id: ObjectId;
  
  // Home page sections configuration
  sections: Array<{
    sectionId: string; // BANNER, FLASH_DEALS, FEATURES, NEW_ARRIVALS, RECENTLY_VIEWED, RECOMMENDATIONS
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
  logo?: ObjectId; // FileStorage reference
  appName: string;
  favicon?: ObjectId; // FileStorage reference
  
  // System fields
  status: CUSTOMER_APP_SETTINGS_STATUS;
  isDefault: boolean;
}

export interface ICustomerAppSettingsDocument 
  extends Omit<ICustomerAppSettingsAttributes, '_id'>, Document {}
