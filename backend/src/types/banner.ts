import { IApiResponse, IPaginationApiResponse } from '../interfaces';
import { IBannerAttributes } from '../interfaces';

export type TBannerRes = IApiResponse<IBannerAttributes>;

export type TBannerListRes = IApiResponse<IBannerAttributes[]>;

export type TBannerListPaginationRes = IPaginationApiResponse<IBannerAttributes>;
