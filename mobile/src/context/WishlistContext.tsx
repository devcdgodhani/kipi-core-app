import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Toast from 'react-native-toast-message';
import { Product } from '../types/product.types';
import { wishlistService } from '../services/wishlist.service';

interface WishlistContextType {
    wishlistItems: Product[];
    addToWishlist: (product: Product) => Promise<void>;
    removeFromWishlist: (productId: string) => Promise<void>;
    isInWishlist: (productId: string) => boolean;
    loading: boolean;
}

const WishlistContext = createContext<WishlistContextType | undefined>(undefined);

export const WishlistProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [wishlistItems, setWishlistItems] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadWishlist();
    }, []);

    const loadWishlist = async () => {
        try {
            const savedWishlist = await AsyncStorage.getItem('WISHLIST_ITEMS');
            if (savedWishlist) {
                setWishlistItems(JSON.parse(savedWishlist));
            }

            // If user is logged in, we should ideally sync with server
            // For now, we rely on local first or fetch from server if implemented fully
            // const user = await AsyncStorage.getItem('user');
            // if (user) { ... fetch from API ... }
        } catch (error) {
            console.error('Failed to load wishlist', error);
        } finally {
            setLoading(false);
        }
    };

    const saveWishlist = async (newItems: Product[]) => {
        try {
            await AsyncStorage.setItem('WISHLIST_ITEMS', JSON.stringify(newItems));
            setWishlistItems(newItems);
        } catch (error) {
            console.error('Failed to save wishlist', error);
        }
    };

    const addToWishlist = async (product: Product) => {
        if (isInWishlist(product._id)) {
            Toast.show({
                type: 'info',
                text1: 'Already in Wishlist',
                text2: `${product.name} is already in your wishlist`,
            });
            return;
        }

        const newItems = [...wishlistItems, product];
        await saveWishlist(newItems);

        // Sync with API if needed (optional for this stage)
        try {
            const userStr = await AsyncStorage.getItem('user');
            if (userStr) {
                const user = JSON.parse(userStr);
                await wishlistService.create({
                    userId: user._id,
                    products: [{ productId: product._id, addedAt: new Date().toISOString() }]
                });
            }
        } catch (error) {
            console.warn('Failed to sync wishlist with server', error);
            // Fail silently for server sync, local update is successful
        }

        Toast.show({
            type: 'success',
            text1: 'Added to Wishlist',
            text2: `${product.name} added to your wishlist`,
        });
    };

    const removeFromWishlist = async (productId: string) => {
        const newItems = wishlistItems.filter((item) => item._id !== productId);
        await saveWishlist(newItems);

        Toast.show({
            type: 'success',
            text1: 'Removed',
            text2: 'Item removed from wishlist',
        });
    };

    const isInWishlist = (productId: string) => {
        return wishlistItems.some((item) => item._id === productId);
    };

    return (
        <WishlistContext.Provider
            value={{
                wishlistItems,
                addToWishlist,
                removeFromWishlist,
                isInWishlist,
                loading,
            }}
        >
            {children}
        </WishlistContext.Provider>
    );
};

export const useWishlist = () => {
    const context = useContext(WishlistContext);
    if (context === undefined) {
        throw new Error('useWishlist must be used within a WishlistProvider');
    }
    return context;
};
