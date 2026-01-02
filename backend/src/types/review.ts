import { REVIEW_STATUS } from '../constants/review';
import { IReviewAttributes } from '../interfaces/review';
import { IApiResponse } from '../interfaces';

export type TReviewCreateReq = {
    productId: string;
    orderId: string;
    rating: number;
    comment: string;
    images?: string[]; // IDs of FileStorage
};

export type TReviewUpdateReq = {
    comment?: string;
    rating?: number;
    status?: REVIEW_STATUS;
    adminReply?: string;
    isVisible?: boolean;
};

export type TReviewRes = IApiResponse<IReviewAttributes>;
export type TReviewListRes = IApiResponse<IReviewAttributes[]>;

