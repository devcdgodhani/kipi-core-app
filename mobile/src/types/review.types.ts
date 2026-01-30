export interface Review {
  _id: string;
  productId: string;
  userId: string;
  rating: number;
  comment: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'HIDDEN';
  isVisible: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateReviewRequest {
  productId: string;
  orderId: string;
  rating: number;
  comment: string;
  images?: string[];
}

export interface UpdateReviewRequest {
  rating?: number;
  comment?: string;
}
