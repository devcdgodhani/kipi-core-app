export interface WishlistItem {
  productId: string;
  addedAt: string;
}

export interface Wishlist {
  _id: string;
  userId: string;
  products: WishlistItem[];
  status: 'ACTIVE' | 'INACTIVE';
  createdAt: string;
  updatedAt: string;
}

export interface AddToWishlistRequest {
  userId: string;
  products: WishlistItem[];
}

export interface UpdateWishlistRequest {
  products?: WishlistItem[];
  status?: string;
}
