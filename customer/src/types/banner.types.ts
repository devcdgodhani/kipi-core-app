
export interface Banner {
    _id: string;
    title: string;
    subtitle?: string;
    imageId: string | {
        _id: string;
        url: string;
        preSignedUrl?: string;
    };
    mobileImageId?: string | {
        _id: string;
        url: string;
        preSignedUrl?: string;
    };
    linkType: string;
    linkValue?: string;
    displayOrder?: number;
    startDate: string | Date;
    endDate: string | Date;
    isActive: boolean;
    targetAudience?: string;
    status: string;
    createdAt?: string;
    updatedAt?: string;
}

export interface BannerFilter {
    isActive?: boolean;
    targetAudience?: string;
    status?: string;
}
