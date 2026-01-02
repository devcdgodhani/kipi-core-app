export const REVIEW_STATUS = {
  PENDING: 'PENDING',
  APPROVED: 'APPROVED',
  REJECTED: 'REJECTED',
  DELETED: 'DELETED'
} as const;

export type REVIEW_STATUS = typeof REVIEW_STATUS[keyof typeof REVIEW_STATUS];

export interface Review {
  _id: string;
  productId: any; // Populated with { _id, name }
  userId: any; // Populated with { _id, firstName, lastName }
  rating: number;
  comment: string;
  status: REVIEW_STATUS;
  isVisible: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateReviewRequest {
  productId: string;
  rating: number;
  comment: string;
}

export interface UpdateReviewStatusRequest {
  status: REVIEW_STATUS;
  isVisible?: boolean;
}
