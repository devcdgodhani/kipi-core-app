import { IApiResponse, IPaginationApiResponse } from '../interfaces';
import { ISearchQueryAttributes } from '../interfaces';

export type TSearchQueryRes = IApiResponse<ISearchQueryAttributes>;
export type TSearchQueryListRes = IApiResponse<ISearchQueryAttributes[]>;
export type TSearchQueryListPaginationRes = IPaginationApiResponse<ISearchQueryAttributes>;
export type TTrendingSearchRes = IApiResponse<{ query: string; count: number }[]>;
export type TSearchSuggestionsRes = IApiResponse<string[]>;
