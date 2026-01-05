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

    // Unify userId retrieval
    const getUserId = () => {
        if (user?._id) return user._id;
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
            try {
                const parsed = JSON.parse(storedUser);
                return parsed._id || parsed.user?._id;
            } catch (e) {
                return null;
            }
        }
        return null;
    };
    const userId = getUserId();

    const openCart = () => setIsCartOpen(true);
    const closeCart = () => setIsCartOpen(false);

    const refreshCart = async () => {
        if (!userId) {
            setCart(null);
            return;
        }

        try {
            const userCart = await cartService.getByUser(userId);
            if (userCart && userCart.items) {
                // Map populated fields for frontend consistency
                const mappedItems = userCart.items.map(item => ({
                    ...item,
                    product: (item.productId as any)?.name ? (item.productId as any) : item.product,
                    sku: (item.skuId as any)?.skuCode ? (item.skuId as any) : item.sku
                }));
                setCart({ ...userCart, items: mappedItems });
            } else {
                setCart(userCart);
            }
        } catch (error) {
            // If getByUser fails (e.g. 404), cart is null. 
            // We don't error out, just set null so next add creates one.
            setCart(null);
        }
    };

    const addItem = async (item: CartItem) => {
        console.log('CartContext: addItem called with', item);
        if (!userId) {
            console.warn('CartContext: No userId found');
            toast.error('Please login to add items to cart');
            return;
        }

        setLoading(true);
        try {
            console.log('CartContext: Refreshing/Fetching cart for', userId);
            let currentCart = cart;
            if (!currentCart) {
                try {
                    currentCart = await cartService.getByUser(userId);
                    console.log('CartContext: Fetched cart:', currentCart);
                    setCart(currentCart);
                } catch (e) {
                    console.log('CartContext: No existing cart found or fetch failed');
                    currentCart = null;
                }
            }

            if (currentCart) {
                console.log('CartContext: Updating existing cart', currentCart._id);
                // Update existing cart
                const existingItemIndex = currentCart.items.findIndex(i => {
                    const iSkuId = typeof i.skuId === 'object' ? (i.skuId as any)?._id : i.skuId;
                    const itemSkuId = typeof item.skuId === 'object' ? (item.skuId as any)?._id : item.skuId;
                    return iSkuId === itemSkuId;
                });

                const updatedItems = [...currentCart.items];

                if (existingItemIndex >= 0) {
                    console.log('CartContext: Item already in cart, incrementing quantity');
                    updatedItems[existingItemIndex].quantity += item.quantity;
                } else {
                    console.log('CartContext: New item for existing cart');
                    updatedItems.push(item);
                }

                // Sanitize items for backend: only send IDs and required fields
                const payloadItems = updatedItems.map(i => {
                    const pId = typeof i.productId === 'object' ? (i.productId as any)?._id : i.productId;
                    const sId = typeof i.skuId === 'object' ? (i.skuId as any)?._id : i.skuId;

                    return {
                        productId: pId,
                        skuId: sId || (i as any).sku?._id || pId, // Fallback to sku object or product ID
                        quantity: i.quantity,
                        price: (i as any).sku?.offerPrice || (i as any).sku?.salePrice || (i as any).sku?.basePrice || (i as any).product?.offerPrice || (i as any).product?.salePrice || (i as any).product?.basePrice || 0,
                        salePrice: (i as any).sku?.salePrice || (i as any).product?.salePrice,
                        offerPrice: (i as any).sku?.offerPrice || (i as any).product?.offerPrice
                    };
                });

                console.log('CartContext: Sending update payload:', payloadItems);
                await cartService.update(currentCart._id, { items: payloadItems });
            } else {
                console.log('CartContext: Creating new cart');
                // Create new cart
                const pId = typeof item.productId === 'object' ? (item.productId as any)?._id : item.productId;
                const sId = typeof item.skuId === 'object' ? (item.skuId as any)?._id : item.skuId;

                const newItem = {
                    productId: pId,
                    skuId: sId || item.sku?._id || pId,
                    quantity: item.quantity,
                    price: item.sku?.basePrice || item.product?.basePrice || 0,
                    salePrice: item.sku?.salePrice || item.product?.salePrice,
                    offerPrice: item.sku?.offerPrice || item.product?.offerPrice
                };
                console.log('CartContext: Sending create payload:', newItem);
                await cartService.create({ userId, items: [newItem] });
            }
            console.log('CartContext: Refreshing cart state...');
            await refreshCart();
            setIsCartOpen(true);
            toast.success('Added to cart');
        } catch (error) {
            console.error('CartContext: Failed to add item to cart:', error);
            toast.error('Failed to add item');
            throw error;
        } finally {
            setLoading(false);
        }
    };

    const removeItem = async (skuIdOrObj: string | any) => {
        if (!cart) return;

        // Extracts ID from either a string or a populated object (_id or id)
        const targetId = typeof skuIdOrObj === 'object' ? (skuIdOrObj?._id || skuIdOrObj?.id) : skuIdOrObj;

        setLoading(true);
        try {
            const updatedItems = cart.items.filter(item => {
                const itemSkuId = typeof item.skuId === 'object' ? (item.skuId as any)?._id : item.skuId;
                const itemProductId = typeof item.productId === 'object' ? (item.productId as any)?._id : item.productId;

                // Use skuId for identification if it exists, otherwise fallback to productId
                const currentItemKey = itemSkuId || itemProductId;
                return currentItemKey !== targetId;
            });

            const payloadItems = updatedItems.map(i => {
                const pId = typeof i.productId === 'object' ? (i.productId as any)?._id : i.productId;
                const sId = typeof i.skuId === 'object' ? (i.skuId as any)?._id : i.skuId;

                return {
                    productId: pId || '',
                    skuId: sId || (i as any).sku?._id || pId || '',
                    quantity: i.quantity,
                    price: (i as any).sku?.offerPrice || (i as any).sku?.salePrice || (i as any).sku?.basePrice || (i as any).product?.offerPrice || (i as any).product?.salePrice || (i as any).product?.basePrice || 0,
                    salePrice: (i as any).sku?.salePrice || (i as any).product?.salePrice,
                    offerPrice: (i as any).sku?.offerPrice || (i as any).product?.offerPrice
                }
            });

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

    const updateQuantity = async (skuIdOrObj: string | any, quantity: number) => {
        if (!cart) return;

        const targetId = typeof skuIdOrObj === 'object' ? (skuIdOrObj?._id || skuIdOrObj?.id) : skuIdOrObj;

        setLoading(true);
        try {
            if (quantity <= 0) {
                await removeItem(targetId);
                return;
            }

            const updatedItems = cart.items.map(item => {
                const itemSkuId = typeof item.skuId === 'object' ? (item.skuId as any)?._id : item.skuId;
                const itemProductId = typeof item.productId === 'object' ? (item.productId as any)?._id : item.productId;
                const currentItemKey = itemSkuId || itemProductId;

                return currentItemKey === targetId ? { ...item, quantity } : item;
            });

            const payloadItems = updatedItems.map(i => {
                const pId = typeof i.productId === 'object' ? (i.productId as any)?._id : i.productId;
                const sId = typeof i.skuId === 'object' ? (i.skuId as any)?._id : i.skuId;

                return {
                    productId: pId || '',
                    skuId: sId || (i as any).sku?._id || pId || '',
                    quantity: i.quantity,
                    price: (i as any).sku?.offerPrice || (i as any).sku?.salePrice || (i as any).sku?.basePrice || (i as any).product?.offerPrice || (i as any).product?.salePrice || (i as any).product?.basePrice || 0,
                    salePrice: (i as any).sku?.salePrice || (i as any).product?.salePrice,
                    offerPrice: (i as any).sku?.offerPrice || (i as any).product?.offerPrice
                }
            });

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
