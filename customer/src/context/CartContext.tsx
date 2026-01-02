import React, { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import type { Cart, CartItem } from '../types/cart.types';
import { cartService } from '../services/cart.service';

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

    const openCart = () => setIsCartOpen(true);
    const closeCart = () => setIsCartOpen(false);

    const userId = localStorage.getItem('USER_ID') || '';

    const refreshCart = async () => {
        if (!userId) return;

        setLoading(true);
        try {
            const userCart = await cartService.getByUser(userId);
            setCart(userCart);
        } catch (error) {
            console.error('Failed to fetch cart:', error);
        } finally {
            setLoading(false);
        }
    };

    const addItem = async (item: CartItem) => {
        setLoading(true);
        try {
            if (cart) {
                // Update existing cart
                const existingItemIndex = cart.items.findIndex(i => i.skuId === item.skuId);
                const updatedItems = [...cart.items];

                if (existingItemIndex >= 0) {
                    updatedItems[existingItemIndex].quantity += item.quantity;
                } else {
                    updatedItems.push(item);
                }

                await cartService.update(cart._id, { items: updatedItems });
            } else {
                // Create new cart
                await cartService.create({ userId, items: [item] });
            }
            await refreshCart();
        } catch (error) {
            console.error('Failed to add item to cart:', error);
            throw error;
        } finally {
            setLoading(false);
        }
    };

    const removeItem = async (skuId: string) => {
        if (!cart) return;

        setLoading(true);
        try {
            const updatedItems = cart.items.filter(item => item.skuId !== skuId);
            await cartService.update(cart._id, { items: updatedItems });
            await refreshCart();
        } catch (error) {
            console.error('Failed to remove item from cart:', error);
            throw error;
        } finally {
            setLoading(false);
        }
    };

    const updateQuantity = async (skuId: string, quantity: number) => {
        if (!cart) return;

        setLoading(true);
        try {
            const updatedItems = cart.items.map(item =>
                item.skuId === skuId ? { ...item, quantity } : item
            );
            await cartService.update(cart._id, { items: updatedItems });
            await refreshCart();
        } catch (error) {
            console.error('Failed to update quantity:', error);
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
        if (userId) {
            refreshCart();
        }
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
