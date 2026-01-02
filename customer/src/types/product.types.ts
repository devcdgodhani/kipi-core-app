export interface MediaItem {
  fileType: 'IMAGE' | 'VIDEO';
  type: string;
  fileStorageId?: string;
  url: string;
  status: 'ACTIVE' | 'INACTIVE';
  sortOrder: number;
}

export interface ProductAttribute {
  attributeId: string;
  value: any;
  label: string;
}

export interface Product {
  _id: string;
  name: string;
  productCode: string;
  slug: string;
  description: string;
  basePrice: number;
  salePrice?: number;
  offerPrice?: number;
  discount?: number;
  currency: string;
  media: MediaItem[];
  mainImage?: string;
  categoryIds: string[];
  attributes: ProductAttribute[];
  status: 'DRAFT' | 'ACTIVE' | 'INACTIVE' | 'OUT_OF_STOCK';
  stock: number;
  createdAt: string;
  updatedAt: string;
}

export interface SKU {
  _id: string;
  productId: string;
  skuCode: string;
  variantAttributes: ProductAttribute[];
  basePrice?: number;
  salePrice?: number;
  offerPrice?: number;
  discount: number;
  quantity: number;
  media: MediaItem[];
  status: 'ACTIVE' | 'INACTIVE' | 'OUT_OF_STOCK';
  lotId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Category {
  _id: string;
  name: string;
  slug: string;
  description?: string;
  parentId?: string;
  status: 'ACTIVE' | 'INACTIVE';
}

export interface ProductFilters {
  search?: string;
  categoryIds?: string[];
  minPrice?: number;
  maxPrice?: number;
  status?: string;
  inStock?: boolean;
  page?: number;
  limit?: number;
  sortBy?: 'name' | 'price' | 'createdAt';
  sortOrder?: 'asc' | 'desc';
}

export interface PaginatedProducts {
  data: Product[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}
