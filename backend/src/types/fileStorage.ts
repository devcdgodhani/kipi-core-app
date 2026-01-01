import { IApiResponse, IPaginationApiResponse } from '../interfaces';
import { IFileStorageAttributes } from '../interfaces';

export type TFileStorageRes = IApiResponse<IFileStorageAttributes>;

export type TFileStorageListRes = IApiResponse<IFileStorageAttributes[]>;

export type TFileStorageListPaginationRes = IPaginationApiResponse<IFileStorageAttributes>;
