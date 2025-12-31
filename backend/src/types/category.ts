import { IApiResponse, IPaginationData } from '../interfaces';
import { ICategoryAttributes } from '../interfaces/category';

/***************** Requests *******************/
export type TCategoryCreateReq = Omit<ICategoryAttributes, '_id' | 'createdAt' | 'updatedAt' | 'slug'>;

export type TCategoryUpdateReq = Partial<TCategoryCreateReq>;

/***************** Responses *******************/
export type TCategoryRes = IApiResponse<ICategoryAttributes | null>;

export type TCategoryListRes = IApiResponse<ICategoryAttributes[]>;

export type TCategoryListPaginationRes = IApiResponse<IPaginationData<ICategoryAttributes>>;

export interface ITreeNode extends ICategoryAttributes {
  children?: ITreeNode[];
}

export type TCategoryTreeRes = IApiResponse<ITreeNode[]>;
