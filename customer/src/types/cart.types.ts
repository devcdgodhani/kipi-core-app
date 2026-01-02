import type { Product } from './product.types';
// import { Sku } from './sku.types'; // Assuming Sku type exists or using Partial<Product> logic

export interface CartItem {
    productId: string;
    skuId?: string;
    quantity: number;
    
    // Populated fields
    product: Product;
    sku?: {
        _id: string;
        price?: number;
        salePrice?: number;
        basePrice?: number;
        skuCode?: string;
        media?: { url: string }[];
    };
}

export interface Cart {
    _id: string;
    userId: string;
    items: CartItem[];
    createdAt: string;
    updatedAt: string;
}

export interface AddContextItem {
    productId: string;
    skuId?: string;
    quantity: number;
}

export interface AddToCartRequest {
    userId: string;
    items: {
        productId: string;
        skuId?: string;
        quantity: number;
    }[];
}

export interface UpdateCartRequest {
    items: {
        productId: string;
        skuId?: string;
        quantity: number;
    }[];
}
