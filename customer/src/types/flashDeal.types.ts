import type { Product } from './product.types';

export interface FlashDeal {
    _id: string;
    name: string;
    description?: string;
    productIds: string[] | Product[];
    discountType: 'PERCENTAGE' | 'FIXED';
    discountValue: number;
    startTime: string | Date;
    endTime: string | Date;
    maxQuantityPerUser?: number;
    totalQuantityLimit?: number;
    currentQuantitySold?: number;
    status: string;
    createdAt?: string;
    updatedAt?: string;
}
