
export interface Notification {
    _id: string;
    userId: string;
    type: string;
    title: string;
    message: string;
    data?: any;
    imageUrl?: string;
    actionUrl?: string;
    isRead: boolean;
    status: string;
    createdAt: string;
    updatedAt: string;
}

export interface NotificationResponse {
    notifications: Notification[];
    unreadCount: number;
    pagination?: {
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    }
}
