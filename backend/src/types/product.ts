import { IApiResponse, IPaginationData } from '../interfaces';
import { IProductAttributes } from '../interfaces/product';

/***************** Requests *******************/
export type TProductCreateReq = Omit<IProductAttributes, '_id' | 'createdAt' | 'updatedAt' | 'slug' | 'stock'>; 

export type TProductUpdateReq = Partial<TProductCreateReq>;

/***************** Responses *******************/
export type TProductRes = IApiResponse<IProductAttributes | null>;

export type TProductListRes = IApiResponse<IProductAttributes[]>;

export type TProductListPaginationRes = IApiResponse<IPaginationData<IProductAttributes>>;
