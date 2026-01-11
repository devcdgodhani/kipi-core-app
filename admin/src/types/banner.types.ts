
export enum BANNER_STATUS {
    ACTIVE = 'ACTIVE',
    INACTIVE = 'INACTIVE',
    DELETED = 'DELETED'
}

export enum BANNER_LINK_TYPE {
    PRODUCT = 'PRODUCT',
    CATEGORY = 'CATEGORY',
    EXTERNAL = 'EXTERNAL',
    NONE = 'NONE'
}

export enum BANNER_TARGET_AUDIENCE {
    ALL = 'ALL',
    NEW_USERS = 'NEW_USERS',
    EXISTING_USERS = 'EXISTING_USERS',
    GUEST = 'GUEST'
}

export interface Banner {
    _id: string;
    title: string;
    subtitle?: string;
    imageId: string;
    mobileImageId?: string;
    linkType: BANNER_LINK_TYPE;
    linkValue?: string;
    displayOrder: number;
    startDate: string;
    endDate: string;
    isActive: boolean;
    targetAudience: BANNER_TARGET_AUDIENCE;
    status: BANNER_STATUS;
    createdAt: string;
    updatedAt: string;
}

export interface BannerResponse {
    status: string;
    code: number;
    message: string;
    data: Banner;
}

export interface BannerListResponse {
    status: string;
    code: number;
    message: string;
    data: {
        recordList: Banner[];
        totalRecords: number;
        totalPages: number;
        currentPage: number;
        limit: number;
    };
}
