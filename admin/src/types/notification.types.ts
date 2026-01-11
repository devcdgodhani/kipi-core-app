
export enum NOTIFICATION_TYPE {
    INFO = 'INFO',
    SUCCESS = 'SUCCESS',
    WARNING = 'WARNING',
    ERROR = 'ERROR',
    SYSTEM = 'SYSTEM',
    PROMOTION = 'PROMOTION',
    ORDER_UPDATE = 'ORDER_UPDATE'
}

export enum NOTIFICATION_STATUS {
    ACTIVE = 'ACTIVE',
    INACTIVE = 'INACTIVE',
    DELETED = 'DELETED'
}

export interface Notification {
    _id: string;
    userId?: string;
    type: NOTIFICATION_TYPE;
    title: string;
    message: string;
    data?: any;
    isRead: boolean;
    readAt?: string;
    imageUrl?: string;
    actionUrl?: string;
    status: NOTIFICATION_STATUS;
    createdAt: string;
    updatedAt: string;
}

export interface NotificationResponse {
    status: string;
    code: number;
    message: string;
    data: Notification;
}

export interface NotificationListResponse {
    status: string;
    code: number;
    message: string;
    data: {
        recordList: Notification[];
        totalRecords: number;
        totalPages: number;
        currentPage: number;
        limit: number;
    };
}
