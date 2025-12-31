import { IApiResponse, IPaginationData } from '../interfaces';
import { ISkuAttributes } from '../interfaces/sku';

/***************** Requests *******************/
export type TSkuCreateReq = Omit<ISkuAttributes, '_id' | 'createdAt' | 'updatedAt'>;

export type TSkuUpdateReq = Partial<TSkuCreateReq>;

/***************** Responses *******************/
export type TSkuRes = IApiResponse<ISkuAttributes | null>;

export type TSkuListRes = IApiResponse<ISkuAttributes[]>;

export type TSkuListPaginationRes = IApiResponse<IPaginationData<ISkuAttributes>>;
