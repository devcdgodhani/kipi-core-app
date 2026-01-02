import http from './http';
import type { Product, SKU, Category, ProductFilters, PaginatedProducts } from '../types/product.types';

const PRODUCT_BASE_URL = '/product';
const SKU_BASE_URL = '/sku';
const CATEGORY_BASE_URL = '/category';

export const productService = {
  // Get all products with filters
  getAll: async (filters?: ProductFilters): Promise<Product[]> => {
    const response: any = await http.post(`${PRODUCT_BASE_URL}/getAll`, { 
      status: 'ACTIVE',
      ...filters 
    });
    return response.data;
  },

  // Get products with pagination
  getWithPagination: async (filters?: ProductFilters): Promise<PaginatedProducts> => {
    const response: any = await http.post(`${PRODUCT_BASE_URL}/getWithPagination`, {
      status: 'ACTIVE',
      page: 1,
      limit: 20,
      ...filters,
    });
    
    // Check if response is the unwrapped data (from interceptor) or needs .data access
    // The interceptor returns response.data (the body).
    // The body has structure { status, data: { recordList... } }
    // Actually typically generic http wrapper might strictly return T. 
    // If http.post returns the body, then `response` is the body.
    // response.data is the pagination object.
    
    const paginationData = response.data;

    return {
        data: paginationData.recordList,
        pagination: {
            total: paginationData.totalRecords,
            page: paginationData.currentPage,
            limit: paginationData.limit,
            totalPages: paginationData.totalPages
        }
    };
  },

  // Get single product by ID
  getById: async (productId: string): Promise<Product> => {
    const response: any = await http.post(`${PRODUCT_BASE_URL}/getOne`, { _id: productId });
    return response.data;
  },

  // Get product by slug
  getBySlug: async (slug: string): Promise<Product> => {
    const response: any = await http.post(`${PRODUCT_BASE_URL}/getOne`, { slug });
    return response.data;
  },

  // Get SKUs for a product
  getProductSKUs: async (productId: string): Promise<SKU[]> => {
    const response: any = await http.post(`${SKU_BASE_URL}/getAll`, { productId, status: 'ACTIVE' });
    return response.data;
  },

  // Get single SKU
  getSKUById: async (skuId: string): Promise<SKU> => {
    const response: any = await http.post(`${SKU_BASE_URL}/getOne`, { _id: skuId });
    return response.data;
  },

  // Search products
  search: async (query: string, filters?: ProductFilters): Promise<Product[]> => {
    const response: any = await http.post(`${PRODUCT_BASE_URL}/getAll`, {
      name: query,
      status: 'ACTIVE',
      ...filters,
    });
    return response.data;
  },
};

export const categoryService = {
  // Get all categories
  getAll: async (): Promise<Category[]> => {
    const response: any = await http.post(`${CATEGORY_BASE_URL}/getAll`, { status: 'ACTIVE' });
    return response.data;
  },

  // Get category by ID
  getById: async (categoryId: string): Promise<Category> => {
    const response: any = await http.post(`${CATEGORY_BASE_URL}/getOne`, { _id: categoryId });
    return response.data;
  },

  // Get subcategories
  getSubcategories: async (parentId: string): Promise<Category[]> => {
    const response: any = await http.post(`${CATEGORY_BASE_URL}/getAll`, { parentId, status: 'ACTIVE' });
    return response.data;
  },
};
