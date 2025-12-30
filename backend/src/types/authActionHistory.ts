import { IApiResponse, IPaginationApiResponse } from '../interfaces';
import { IAuthActionHistoryAttributes } from '../interfaces';

export type TAuthActionHistoryCreate = Omit<IAuthActionHistoryAttributes, 'id'>;

export type TAuthActionHistoryRes = IApiResponse<IAuthActionHistoryAttributes>;

export type TAuthActionHistoryListRes = IApiResponse<IAuthActionHistoryAttributes>;

export type TAuthActionHistoryListPaginationRes =
  IPaginationApiResponse<IAuthActionHistoryAttributes>;
