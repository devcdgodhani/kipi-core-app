import React, { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import type { Cart, CartItem } from '../types/cart.types';
import { cartService } from '../services/cart.service';
import { wishlistService } from '../services/wishlist.service';
import { useAppSelector } from '../features/hooks';
import { toast } from 'react-hot-toast';

interface CartContextType {
    cart: Cart | null;
    loading: boolean;
    isCartOpen: boolean;
    selectedItems: string[];
    openCart: () => void;
    closeCart: () => void;
    addItem: (item: CartItem) => Promise<void>;
    removeItem: (skuId: string) => Promise<void>;
    updateQuantity: (skuId: string, quantity: number) => Promise<void>;
    clearCart: () => Promise<void>;
    refreshCart: () => Promise<void>;
    toggleSelection: (itemId: string) => void;
    selectAll: () => void;
    clearSelection: () => void;
    isItemSelected: (itemId: string) => boolean;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [cart, setCart] = useState<Cart | null>(null);
    const [loading, setLoading] = useState(false);
    const [isCartOpen, setIsCartOpen] = useState(false);
    const [selectedItems, setSelectedItems] = useState<string[]>([]);
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

    // Helper to safely extract ID
    const getId = (obj: any): string => {
        if (!obj) return '';
        if (typeof obj === 'string') return obj;
        return obj._id || obj.id || '';
    };

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
                const newCart = { ...userCart, items: mappedItems };
                setCart(newCart);

                // Initialize selected items if empty (first load)
                if (selectedItems.length === 0 && mappedItems.length > 0) {
                    const allIds = mappedItems.map(item => getId(item.skuId) || getId(item.productId));
                    setSelectedItems(allIds);
                }
            } else {
                setCart(userCart);
            }
        } catch (error) {
            // If getByUser fails (e.g. 404), cart is null. 
            // We don't error out, just set null so next add creates one.
            setCart(null);
        }
    };

    const toggleSelection = (itemId: string) => {
        setSelectedItems(prev => {
            if (prev.includes(itemId)) {
                return prev.filter(id => id !== itemId);
            } else {
                return [...prev, itemId];
            }
        });
    };

    const selectAll = () => {
        if (!cart) return;
        const allIds = cart.items.map(item => getId(item.skuId) || getId(item.productId));
        setSelectedItems(allIds);
    };

    const clearSelection = () => {
        setSelectedItems([]);
    };

    const isItemSelected = (itemId: string) => {
        return selectedItems.includes(itemId);
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
                    const iSkuId = getId(i.skuId);
                    const itemSkuId = getId(item.skuId);
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
                const payloadItems = updatedItems
                    .map(i => {
                        const pId = getId(i.productId) || getId((i as any).product);
                        const sId = getId(i.skuId) || getId((i as any).sku);

                        // If we still don't have a productId, fallback to skuId if they are same (rare) or skip
                        if (!pId) {
                            console.warn('CartContext: Found item without productId, skipping', i);
                            return null;
                        }

                        return {
                            productId: pId,
                            skuId: sId || pId, // Fallback to product ID if SKU ID missing
                            quantity: i.quantity,
                            price: (i as any).sku?.offerPrice || (i as any).sku?.salePrice || (i as any).sku?.basePrice || (i as any).product?.offerPrice || (i as any).product?.salePrice || (i as any).product?.basePrice || 0,
                            salePrice: (i as any).sku?.salePrice || (i as any).product?.salePrice,
                            offerPrice: (i as any).sku?.offerPrice || (i as any).product?.offerPrice
                        };
                    })
                    .filter(i => i !== null) as any[];

                console.log('CartContext: Sending update payload:', payloadItems);
                if (payloadItems.length === 0) {
                    console.error('CartContext: No valid items to update');
                    throw new Error('Invalid cart state');
                }
                await cartService.update(currentCart._id, { items: payloadItems });
            } else {
                console.log('CartContext: Creating new cart');
                // Create new cart
                const pId = getId(item.productId) || getId((item as any).product);
                const sId = getId(item.skuId) || getId((item as any).sku);

                if (!pId) throw new Error('Cannot add item: invalid product ID');

                const newItem = {
                    productId: pId,
                    skuId: sId || pId,
                    quantity: item.quantity,
                    price: item.sku?.basePrice || item.product?.basePrice || 0,
                    salePrice: item.sku?.salePrice || item.product?.salePrice,
                    offerPrice: item.sku?.offerPrice || item.product?.offerPrice
                };
                console.log('CartContext: Sending create payload:', newItem);
                await cartService.create({ userId, items: [newItem] });
            }
            console.log('CartContext: Refreshing cart state...');

            // Explicitly select the new item
            const newItemId = getId(item.skuId) || getId(item.productId);
            if (newItemId) {
                setSelectedItems(prev => prev.includes(newItemId) ? prev : [...prev, newItemId]);
            }

            await refreshCart();

            // Remove from wishlist if present
            try {
                const productId = getId(item.productId) || getId((item as any).product);
                if (productId) {
                    const userWishlist = await wishlistService.getByUser(userId);
                    if (userWishlist && userWishlist.products) {
                        const isInWishlist = userWishlist.products.some(p => {
                            const id = getId(p.productId);
                            return id === productId;
                        });

                        if (isInWishlist) {
                            const updatedProducts = userWishlist.products
                                .map(p => ({ productId: getId(p.productId), addedAt: p.addedAt }))
                                .filter(p => p.productId !== productId);
                            await wishlistService.update(userWishlist._id, { products: updatedProducts });
                        }
                    }
                }
            } catch (error) {
                // Silently fail wishlist removal - cart addition is more important
                console.log('Failed to remove from wishlist:', error);
            }

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
        const targetId = getId(skuIdOrObj);

        setLoading(true);
        try {
            const updatedItems = cart.items.filter(item => {
                const itemSkuId = getId(item.skuId);
                const itemProductId = getId(item.productId);

                // Use skuId for identification if it exists, otherwise fallback to productId
                const currentItemKey = itemSkuId || itemProductId;
                return currentItemKey !== targetId;
            });

            const payloadItems = updatedItems
                .map(i => {
                    const pId = getId(i.productId) || getId((i as any).product);
                    const sId = getId(i.skuId) || getId((i as any).sku);

                    if (!pId) return null;

                    return {
                        productId: pId,
                        skuId: sId || pId,
                        quantity: i.quantity,
                        price: (i as any).sku?.offerPrice || (i as any).sku?.salePrice || (i as any).sku?.basePrice || (i as any).product?.offerPrice || (i as any).product?.salePrice || (i as any).product?.basePrice || 0,
                        salePrice: (i as any).sku?.salePrice || (i as any).product?.salePrice,
                        offerPrice: (i as any).sku?.offerPrice || (i as any).product?.offerPrice
                    };
                })
                .filter(i => i !== null) as any[];

            await cartService.update(cart._id, { items: payloadItems });
            setSelectedItems(prev => prev.filter(id => id !== targetId));
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

        const targetId = getId(skuIdOrObj);

        setLoading(true);
        try {
            if (quantity <= 0) {
                await removeItem(targetId);
                return;
            }

            const updatedItems = cart.items.map(item => {
                const itemSkuId = getId(item.skuId);
                const itemProductId = getId(item.productId);
                const currentItemKey = itemSkuId || itemProductId;

                return currentItemKey === targetId ? { ...item, quantity } : item;
            });

            const payloadItems = updatedItems
                .map(i => {
                    const pId = getId(i.productId) || getId((i as any).product);
                    const sId = getId(i.skuId) || getId((i as any).sku);

                    if (!pId) return null;

                    return {
                        productId: pId,
                        skuId: sId || pId,
                        quantity: i.quantity,
                        price: (i as any).sku?.offerPrice || (i as any).sku?.salePrice || (i as any).sku?.basePrice || (i as any).product?.offerPrice || (i as any).product?.salePrice || (i as any).product?.basePrice || 0,
                        salePrice: (i as any).sku?.salePrice || (i as any).product?.salePrice,
                        offerPrice: (i as any).sku?.offerPrice || (i as any).product?.offerPrice
                    };
                })
                .filter(i => i !== null) as any[];

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
            setSelectedItems([]);
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
        <CartContext.Provider value={{
            cart,
            loading,
            isCartOpen,
            selectedItems,
            openCart,
            closeCart,
            addItem,
            removeItem,
            updateQuantity,
            clearCart,
            refreshCart,
            toggleSelection,
            selectAll,
            clearSelection,
            isItemSelected
        }}>
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
