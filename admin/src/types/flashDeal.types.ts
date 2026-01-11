
export enum FLASH_DEAL_STATUS {
    DRAFT = 'DRAFT',
    ACTIVE = 'ACTIVE',
    COMPLETED = 'COMPLETED',
    CANCELLED = 'CANCELLED',
    DELETED = 'DELETED'
}

export enum FLASH_DEAL_DISCOUNT_TYPE {
    PERCENTAGE = 'PERCENTAGE',
    FLAT = 'FLAT'
}

export interface FlashDeal {
    _id: string;
    name: string;
    description?: string;
    productIds: string[];
    discountType: FLASH_DEAL_DISCOUNT_TYPE;
    discountValue: number;
    startTime: string;
    endTime: string;
    maxQuantityPerUser?: number;
    totalQuantityLimit?: number;
    currentQuantitySold: number;
    status: FLASH_DEAL_STATUS;
    createdAt: string;
    updatedAt: string;
}

export interface FlashDealResponse {
    status: string;
    code: number;
    message: string;
    data: FlashDeal;
}

export interface FlashDealListResponse {
    status: string;
    code: number;
    message: string;
    data: {
        recordList: FlashDeal[];
        totalRecords: number;
        totalPages: number;
        currentPage: number;
        limit: number;
    };
}
