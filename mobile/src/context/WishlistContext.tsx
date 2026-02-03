import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Toast from 'react-native-toast-message';
import { Product } from '../types/product.types';
import { wishlistService } from '../services/wishlist.service';
import { useAuth } from './AuthContext';

interface WishlistContextType {
    wishlistItems: Product[];
    addToWishlist: (product: Product) => Promise<void>;
    removeFromWishlist: (productId: string) => Promise<void>;
    isInWishlist: (productId: string) => boolean;
    loading: boolean;
}

const WishlistContext = createContext<WishlistContextType | undefined>(undefined);

export const WishlistProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { user } = useAuth();
    const [wishlistItems, setWishlistItems] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadWishlist();
    }, [user]);

    const loadWishlist = async () => {
        try {
            setLoading(true);
            const savedWishlist = await AsyncStorage.getItem('WISHLIST_ITEMS');
            if (savedWishlist) {
                setWishlistItems(JSON.parse(savedWishlist));
            }

            const token = await AsyncStorage.getItem('ACCESS_TOKEN');
            if (token) {
                const wishlist = await wishlistService.getMyWishlist();
                if (wishlist && Array.isArray(wishlist.products)) {
                    // Extract products from the wishlist object
                    const remoteItems = wishlist.products
                        .map((p: any) => p.productId)
                        .filter((p: any) => p != null && typeof p === 'object');

                    setWishlistItems(remoteItems);
                    await AsyncStorage.setItem('WISHLIST_ITEMS', JSON.stringify(remoteItems));
                }
            }
        } catch (error) {
            console.error('Failed to load wishlist:', error);
        } finally {
            setLoading(false);
        }
    };

    const addToWishlist = async (product: Product) => {
        try {
            const token = await AsyncStorage.getItem('ACCESS_TOKEN');
            if (token) {
                await wishlistService.addToWishlist(product._id);
            }

            const isAlreadyIn = wishlistItems.some(item => item._id === product._id);
            if (!isAlreadyIn) {
                const newWishlist = [...wishlistItems, product];
                setWishlistItems(newWishlist);
                await AsyncStorage.setItem('WISHLIST_ITEMS', JSON.stringify(newWishlist));
            }

            Toast.show({
                type: 'success',
                text1: 'Added to Wishlist',
                text2: `${product.name} has been added to your wishlist`,
            });
        } catch (error) {
            console.error('Failed to add to wishlist:', error);
        }
    };

    const removeFromWishlist = async (productId: string) => {
        try {
            const token = await AsyncStorage.getItem('ACCESS_TOKEN');
            if (token) {
                await wishlistService.removeFromWishlist(productId);
            }

            const newWishlist = wishlistItems.filter(item => item._id !== productId);
            setWishlistItems(newWishlist);
            await AsyncStorage.setItem('WISHLIST_ITEMS', JSON.stringify(newWishlist));

            Toast.show({
                type: 'info',
                text1: 'Removed from Wishlist',
            });
        } catch (error) {
            console.error('Failed to remove from wishlist:', error);
        }
    };

    const isInWishlist = (productId: string) => {
        return wishlistItems.some(item => item._id === productId);
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
