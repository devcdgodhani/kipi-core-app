import { IApiResponse } from '../interfaces';
import { IRecentlyViewedAttributes } from '../interfaces';
import { IProductAttributes } from '../interfaces/product';

export type TRecentlyViewedRes = IApiResponse<IRecentlyViewedAttributes>;

export type TRecentlyViewedListRes = IApiResponse<IRecentlyViewedAttributes[]>;

export type TRecentlyViewedProductsRes = IApiResponse<IProductAttributes[]>;
