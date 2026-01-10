import { IApiResponse, IPaginationApiResponse } from '../interfaces/common';
import { IPushNotificationAttributes } from '../interfaces/pushNotification';

export type TPushNotificationRes = IApiResponse<IPushNotificationAttributes>;
export type TPushNotificationListRes = IApiResponse<IPushNotificationAttributes[]>;
export type TPushNotificationListPaginationRes = IPaginationApiResponse<IPushNotificationAttributes>;
