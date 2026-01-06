import { IApiResponse, IPaginationApiResponse } from '../interfaces';
import { IShipmentAttributes } from '../interfaces';

export type TShipmentRes = IApiResponse<IShipmentAttributes>;

export type TShipmentListRes = IApiResponse<IShipmentAttributes[]>;

export type TShipmentListPaginationRes = IPaginationApiResponse<IShipmentAttributes>;
