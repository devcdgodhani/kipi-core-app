import { IApiResponse, IPaginationApiResponse } from '../interfaces';
import { IWalletAttributes } from '../interfaces/wallet';

export type TWalletRes = IApiResponse<IWalletAttributes>;
export type TWalletListRes = IApiResponse<IWalletAttributes[]>;
export type TWalletListPaginationRes = IPaginationApiResponse<IWalletAttributes>;

export type TWalletCreditReq = {
  userId: string;
  amount: number;
  description: string;
  metadata?: any;
};

export type TWalletDebitReq = {
  userId: string;
  amount: number;
  description: string;
  metadata?: any;
};
