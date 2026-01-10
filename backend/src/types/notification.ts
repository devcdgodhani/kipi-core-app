import { IApiResponse, IPaginationApiResponse } from '../interfaces';
import { INotificationAttributes } from '../interfaces';

export type TNotificationRes = IApiResponse<INotificationAttributes>;

export type TNotificationListRes = IApiResponse<INotificationAttributes[]>;

export type TNotificationListPaginationRes = IPaginationApiResponse<INotificationAttributes>;

export type TUnreadCountRes = IApiResponse<{ count: number }>;
