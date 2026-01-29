import { IApiResponse, IPaginationApiResponse } from '../interfaces';
import { ICustomerAppSettingsAttributes } from '../interfaces/customerAppSettings';

export type TCustomerAppSettingsRes = IApiResponse<ICustomerAppSettingsAttributes>;
export type TCustomerAppSettingsListRes = IApiResponse<ICustomerAppSettingsAttributes[]>;
export type TCustomerAppSettingsListPaginationRes = IPaginationApiResponse<ICustomerAppSettingsAttributes>;
