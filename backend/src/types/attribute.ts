import { IApiResponse, IPaginationApiResponse } from '../interfaces';
import { IAttributeAttributes } from '../interfaces';

export type TAttributeRes = IApiResponse<IAttributeAttributes>;

export type TAttributeListRes = IApiResponse<IAttributeAttributes[]>;

export type TAttributeListPaginationRes = IPaginationApiResponse<IAttributeAttributes>;
