import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Toast from 'react-native-toast-message';
import { Product } from '../types/product.types';
import { wishlistService } from '../services/wishlist.service';
import { useAuth } from './AuthContext';

interface WishlistContextType {
    wishlistItems: Product[];
    addToWishlist: (product: Product, skuId?: string) => Promise<void>;
    removeFromWishlist: (productId: string, skuId?: string) => Promise<void>;
    isInWishlist: (productId: string, skuId?: string) => boolean;
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
                    // Extract products from the wishlist object and preserve skuId
                    const remoteItems = wishlist.products
                        .map((p: any) => {
                            if (!p.productId || typeof p.productId !== 'object') return null;
                            return {
                                ...p.productId,
                                skuId: p.skuId?._id || p.skuId
                            };
                        })
                        .filter((p: any) => p != null);

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

    const addToWishlist = async (product: Product, skuId?: string) => {
        try {
            const token = await AsyncStorage.getItem('ACCESS_TOKEN');
            if (token) {
                await wishlistService.addToWishlist(product._id, skuId);
            }

            const isAlreadyIn = wishlistItems.some(item => {
                const pId = item._id;
                const sId = (item as any).skuId;
                if (skuId) return pId === product._id && sId === skuId;
                return pId === product._id;
            });

            if (!isAlreadyIn) {
                const newItem = { ...product, skuId };
                const newWishlist = [...wishlistItems, newItem as any];
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

    const removeFromWishlist = async (productId: string, skuId?: string) => {
        try {
            const token = await AsyncStorage.getItem('ACCESS_TOKEN');
            if (token) {
                await wishlistService.removeFromWishlist(productId, skuId);
            }

            const newWishlist = wishlistItems.filter(item => {
                const pId = item._id;
                const sId = (item as any).skuId;
                if (skuId) return !(pId === productId && sId === skuId);
                return pId !== productId;
            });
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

    const isInWishlist = (productId: string, skuId?: string) => {
        return wishlistItems.some(item => {
            const pId = item._id;
            const sId = (item as any).skuId;
            if (skuId) return pId === productId && sId === skuId;
            return pId === productId;
        });
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
