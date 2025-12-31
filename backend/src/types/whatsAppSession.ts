import { IApiResponse, IPaginationApiResponse, IWhatsAppSessionAttributes } from '../interfaces';

/***************** Requests *******************/
export type TWhatsAppSessionCreateReq = {
  name: string;
  isAutoResume?: boolean;
};

export type TWhatsAppSessionUpdateReq = {
  name?: string;
  isAutoResume?: boolean;
  isActive?: boolean;
};

export type TWhatsAppSendMessageReq = {
  sessionId: string;
  to: string;
  message: string;
};

export type TWhatsAppSendBulkMessageReq = {
  sessionId: string;
  numbers: string[];
  message: string;
};

/***************** Responses *******************/
export type TWhatsAppSessionRes = IApiResponse<IWhatsAppSessionAttributes | null>;

export type TWhatsAppSessionListRes = IApiResponse<IWhatsAppSessionAttributes[]>;

export type TWhatsAppSessionListPaginationRes = IPaginationApiResponse<IWhatsAppSessionAttributes>;
