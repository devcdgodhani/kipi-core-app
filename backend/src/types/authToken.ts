import { IApiResponse, IPaginationApiResponse } from '../interfaces';
import { IAuthTokenAttributes } from '../interfaces';

export type TAuthTokenCreate = Omit<IAuthTokenAttributes, '_id'>;

export type TAuthTokenRes = IApiResponse<IAuthTokenAttributes>;

export type TAuthTokenListRes = IApiResponse<IAuthTokenAttributes[]>;

export type TAuthTokenListPaginationRes =
  IPaginationApiResponse<IAuthTokenAttributes>;
