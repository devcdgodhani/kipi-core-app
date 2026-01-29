import { IApiResponse, IPaginationApiResponse } from '../interfaces';
import { IThemeAttributes } from '../interfaces/theme';

export type TThemeRes = IApiResponse<IThemeAttributes>;
export type TThemeListRes = IApiResponse<IThemeAttributes[]>;
export type TThemeListPaginationRes = IPaginationApiResponse<IThemeAttributes>;
