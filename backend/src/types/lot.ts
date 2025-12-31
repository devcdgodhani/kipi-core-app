import { IApiResponse, IPaginationData } from '../interfaces';
import { ILotAttributes } from '../interfaces/lot';

/***************** Requests *******************/
export type TLotCreateReq = Omit<ILotAttributes, '_id' | 'createdAt' | 'updatedAt' | 'remainingQuantity'>;

export type TLotUpdateReq = Partial<TLotCreateReq>;

/***************** Responses *******************/
export type TLotRes = IApiResponse<ILotAttributes | null>;

export type TLotListRes = IApiResponse<ILotAttributes[]>;

export type TLotListPaginationRes = IApiResponse<IPaginationData<ILotAttributes>>;
