import { IApiResponse, IPaginationApiResponse } from '../interfaces';
import { IFlashDealAttributes } from '../interfaces';

export type TFlashDealRes = IApiResponse<IFlashDealAttributes>;

export type TFlashDealListRes = IApiResponse<IFlashDealAttributes[]>;

export type TFlashDealListPaginationRes = IPaginationApiResponse<IFlashDealAttributes>;
