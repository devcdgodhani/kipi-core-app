import { IApiResponse, IPaginationApiResponse } from '../interfaces';
import { IUserAttributes } from '../interfaces';

export type TUserRes = IApiResponse<IUserAttributes>;

export type TUserListRes = IApiResponse<IUserAttributes[]>;

export type TUserListPaginationRes = IPaginationApiResponse<IUserAttributes>;