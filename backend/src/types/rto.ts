import { IApiResponse, IPaginationApiResponse } from '../interfaces';
import { IRtoAttributes, IRtoScoreAttributes } from '../interfaces';

export type TRtoRes = IApiResponse<IRtoAttributes>;

export type TRtoListRes = IApiResponse<IRtoAttributes[]>;

export type TRtoListPaginationRes = IPaginationApiResponse<IRtoAttributes>;

export type TRtoScoreRes = IApiResponse<IRtoScoreAttributes>;
