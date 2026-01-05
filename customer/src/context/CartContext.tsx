import React, { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import type { Cart, CartItem } from '../types/cart.types';
import { cartService } from '../services/cart.service';
import { useAppSelector } from '../features/hooks';
import { toast } from 'react-hot-toast';

interface CartContextType {
    cart: Cart | null;
    loading: boolean;
    isCartOpen: boolean;
    openCart: () => void;
    closeCart: () => void;
    addItem: (item: CartItem) => Promise<void>;
    removeItem: (skuId: string) => Promise<void>;
    updateQuantity: (skuId: string, quantity: number) => Promise<void>;
    clearCart: () => Promise<void>;
    refreshCart: () => Promise<void>;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [cart, setCart] = useState<Cart | null>(null);
    const [loading, setLoading] = useState(false);
    const [isCartOpen, setIsCartOpen] = useState(false);
    const { user } = useAppSelector(state => state.auth);
    const userId = user?._id || localStorage.getItem('USER_ID');

    const openCart = () => setIsCartOpen(true);
    const closeCart = () => setIsCartOpen(false);

    const refreshCart = async () => {
        if (!userId) {
            setCart(null);
            return;
        }

        try {
            const userCart = await cartService.getByUser(userId);
            setCart(userCart);
        } catch (error) {
            // If getByUser fails (e.g. 404), cart is null. 
            // We don't error out, just set null so next add creates one.
            setCart(null);
        }
    };

    const addItem = async (item: CartItem) => {
        if (!userId) {
            toast.error('Please login to add items to cart');
            // Alternatively, redirect to login
            return;
        }

        setLoading(true);
        try {
            // Refresh first to ensure we have latest state
            let currentCart = cart;
            if (!currentCart) {
                try {
                    currentCart = await cartService.getByUser(userId);
                } catch (e) {
                    currentCart = null;
                }
            }

            if (currentCart) {
                // Update existing cart
                const existingItemIndex = currentCart.items.findIndex(i => i.skuId === item.skuId);
                const updatedItems = [...currentCart.items];

                if (existingItemIndex >= 0) {
                    updatedItems[existingItemIndex].quantity += item.quantity;
                } else {
                    updatedItems.push(item);
                }

                // Sanitize items for backend: only send IDs and required fields
                const payloadItems = updatedItems.map(i => ({
                    productId: typeof i.productId === 'object' ? (i.productId as any)._id : i.productId,
                    skuId: typeof i.skuId === 'object' ? (i.skuId as any)._id : i.skuId,
                    quantity: i.quantity,
                    price: i.sku?.basePrice || i.product?.basePrice || 0, // Fallback if price missing
                    salePrice: i.sku?.salePrice || i.product?.salePrice,
                    offerPrice: i.sku?.offerPrice || i.product?.offerPrice
                }));

                await cartService.update(currentCart._id, { items: payloadItems });
            } else {
                // Create new cart
                // Ensure item has price fields for creation too
                const newItem = {
                    productId: item.productId,
                    skuId: item.skuId,
                    quantity: item.quantity,
                    price: item.sku?.basePrice || item.product?.basePrice || 0,
                    salePrice: item.sku?.salePrice || item.product?.salePrice,
                    offerPrice: item.sku?.offerPrice || item.product?.offerPrice
                };
                await cartService.create({ userId, items: [newItem] });
            }
            await refreshCart();
            setIsCartOpen(true);
            toast.success('Added to cart');
        } catch (error) {
            console.error('Failed to add item to cart:', error);
            toast.error('Failed to add item');
            throw error;
        } finally {
            setLoading(false);
        }
    };

    const removeItem = async (skuId: string) => {
        if (!cart) return;

        setLoading(true);
        try {
            const updatedItems = cart.items.filter(item => {
                const itemSkuId = typeof item.skuId === 'object' ? (item.skuId as any)._id : item.skuId;
                return itemSkuId !== skuId;
            });

            const payloadItems = updatedItems.map(i => ({
                productId: typeof i.productId === 'object' ? (i.productId as any)._id : i.productId,
                skuId: typeof i.skuId === 'object' ? (i.skuId as any)._id : i.skuId,
                quantity: i.quantity,
                price: i.sku?.basePrice || i.product?.basePrice || 0,
                salePrice: i.sku?.salePrice || i.product?.salePrice,
                offerPrice: i.sku?.offerPrice || i.product?.offerPrice
            }));

            await cartService.update(cart._id, { items: payloadItems });
            await refreshCart();
            toast.success('Removed from cart');
        } catch (error) {
            console.error('Failed to remove item from cart:', error);
            toast.error('Failed to remove item');
            throw error;
        } finally {
            setLoading(false);
        }
    };

    const updateQuantity = async (skuId: string, quantity: number) => {
        if (!cart) return;

        setLoading(true);
        try {
            if (quantity <= 0) {
                await removeItem(skuId);
                return;
            }

            const updatedItems = cart.items.map(item => {
                const itemSkuId = typeof item.skuId === 'object' ? (item.skuId as any)._id : item.skuId;
                return itemSkuId === skuId ? { ...item, quantity } : item;
            });

            const payloadItems = updatedItems.map(i => ({
                productId: typeof i.productId === 'object' ? (i.productId as any)._id : i.productId,
                skuId: typeof i.skuId === 'object' ? (i.skuId as any)._id : i.skuId,
                quantity: i.quantity,
                price: i.sku?.basePrice || i.product?.basePrice || 0,
                salePrice: i.sku?.salePrice || i.product?.salePrice,
                offerPrice: i.sku?.offerPrice || i.product?.offerPrice
            }));

            await cartService.update(cart._id, { items: payloadItems });
            await refreshCart();
        } catch (error) {
            console.error('Failed to update quantity:', error);
            toast.error('Failed to update quantity');
            throw error;
        } finally {
            setLoading(false);
        }
    };

    const clearCart = async () => {
        if (!cart) return;

        setLoading(true);
        try {
            await cartService.delete(cart._id);
            setCart(null);
        } catch (error) {
            console.error('Failed to clear cart:', error);
            throw error;
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        refreshCart();
    }, [userId]);

    return (
        <CartContext.Provider value={{ cart, loading, isCartOpen, openCart, closeCart, addItem, removeItem, updateQuantity, clearCart, refreshCart }}>
            {children}
        </CartContext.Provider>
    );
};

export const useCart = () => {
    const context = useContext(CartContext);
    if (!context) {
        throw new Error('useCart must be used within a CartProvider');
    }
    return context;
};
