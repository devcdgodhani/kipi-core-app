import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Toast from 'react-native-toast-message';

export interface CartItem {
    _id: string; // Product ID or SKU ID
    productId: string;
    name: string;
    price: number;
    quantity: number;
    thumbnail?: string;
    skuId?: string;
    maxStock?: number;
}

interface CartContextType {
    items: CartItem[];
    addToCart: (item: CartItem) => Promise<void>;
    removeFromCart: (itemId: string) => Promise<void>;
    updateQuantity: (itemId: string, quantity: number) => Promise<void>;
    clearCart: () => Promise<void>;
    cartTotal: number;
    itemCount: number;
    loading: boolean;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [items, setItems] = useState<CartItem[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadCart();
    }, []);

    const loadCart = async () => {
        try {
            const savedCart = await AsyncStorage.getItem('CART_ITEMS');
            if (savedCart) {
                setItems(JSON.parse(savedCart));
            }
        } catch (error) {
            console.error('Failed to load cart', error);
        } finally {
            setLoading(false);
        }
    };

    const saveCart = async (newItems: CartItem[]) => {
        try {
            await AsyncStorage.setItem('CART_ITEMS', JSON.stringify(newItems));
            setItems(newItems);
        } catch (error) {
            console.error('Failed to save cart', error);
            Toast.show({
                type: 'error',
                text1: 'Error',
                text2: 'Failed to update cart',
            });
        }
    };

    const addToCart = async (newItem: CartItem) => {
        let updatedItems = [...items];
        const existingItemIndex = updatedItems.findIndex(
            (item) => item._id === newItem._id || (item.productId === newItem.productId && item.skuId === newItem.skuId)
        );

        if (existingItemIndex > -1) {
            // Item exists, update quantity
            updatedItems[existingItemIndex].quantity += newItem.quantity;
            // Check max stock if available
            if (newItem.maxStock && updatedItems[existingItemIndex].quantity > newItem.maxStock) {
                updatedItems[existingItemIndex].quantity = newItem.maxStock;
                Toast.show({
                    type: 'info',
                    text1: 'Stock Limit Reached',
                    text2: `Max quantity for ${newItem.name} is ${newItem.maxStock}`,
                });
            }
        } else {
            // Add new item
            updatedItems.push(newItem);
        }

        await saveCart(updatedItems);
        Toast.show({
            type: 'success',
            text1: 'Added to Cart',
            text2: `${newItem.name} added to your cart`,
        });
    };

    const removeFromCart = async (itemId: string) => {
        const updatedItems = items.filter((item) => item._id !== itemId);
        await saveCart(updatedItems);
        Toast.show({
            type: 'success',
            text1: 'Removed',
            text2: 'Item removed from cart',
        });
    };

    const updateQuantity = async (itemId: string, quantity: number) => {
        if (quantity <= 0) {
            return removeFromCart(itemId);
        }

        const updatedItems = items.map((item) => {
            if (item._id === itemId) {
                if (item.maxStock && quantity > item.maxStock) {
                    Toast.show({
                        type: 'info',
                        text1: 'Stock Limit',
                        text2: `Max stock available is ${item.maxStock}`,
                    });
                    return { ...item, quantity: item.maxStock };
                }
                return { ...item, quantity };
            }
            return item;
        });

        await saveCart(updatedItems);
    };

    const clearCart = async () => {
        await saveCart([]);
        Toast.show({
            type: 'success',
            text1: 'Cart Cleared',
        });
    };

    const cartTotal = items.reduce((total, item) => total + item.price * item.quantity, 0);
    const itemCount = items.reduce((count, item) => count + item.quantity, 0);

    return (
        <CartContext.Provider
            value={{
                items,
                addToCart,
                removeFromCart,
                updateQuantity,
                clearCart,
                cartTotal,
                itemCount,
                loading,
            }}
        >
            {children}
        </CartContext.Provider>
    );
};

export const useCart = () => {
    const context = useContext(CartContext);
    if (context === undefined) {
        throw new Error('useCart must be used within a CartProvider');
    }
    return context;
};
