import React, { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import type { Wishlist } from '../types/wishlist.types';
import { wishlistService } from '../services/wishlist.service';

interface WishlistContextType {
    wishlist: Wishlist | null;
    loading: boolean;
    isInWishlist: (productId: string) => boolean;
    addToWishlist: (productId: string) => Promise<void>;
    removeFromWishlist: (productId: string) => Promise<void>;
    refreshWishlist: () => Promise<void>;
}

const WishlistContext = createContext<WishlistContextType | undefined>(undefined);

export const WishlistProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [wishlist, setWishlist] = useState<Wishlist | null>(null);
    const [loading, setLoading] = useState(false);

    const userId = localStorage.getItem('USER_ID') || '';

    const refreshWishlist = async () => {
        if (!userId) return;

        setLoading(true);
        try {
            const userWishlist = await wishlistService.getByUser(userId);
            setWishlist(userWishlist);
        } catch (error: any) {
            // If 404, user might not have a wishlist yet, which is fine
            console.log('Wishlist fetch status:', error);
            setWishlist(null);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (userId) {
            refreshWishlist();
        }
    }, [userId]);

    const isInWishlist = (productId: string) => {
        return wishlist?.products.some(item =>
            // Handle both populated object and string ID
            (typeof item.productId === 'string' ? item.productId : (item.productId as any)._id) === productId
        ) || false;
    };

    const addToWishlist = async (productId: string) => {
        setLoading(true);
        try {
            if (wishlist) {
                // Check if already in wishlist
                if (isInWishlist(productId)) return; // Already present

                const updatedProducts = [
                    ...wishlist.products.map(p => ({ productId: typeof p.productId === 'string' ? p.productId : (p.productId as any)._id, addedAt: p.addedAt })),
                    { productId, addedAt: new Date().toISOString() }
                ];

                await wishlistService.update(wishlist._id, { products: updatedProducts });
            } else {
                // Create new
                await wishlistService.create({
                    userId,
                    products: [{ productId, addedAt: new Date().toISOString() }]
                });
            }
            await refreshWishlist();
        } catch (error) {
            console.error('Failed to add to wishlist:', error);
            throw error;
        } finally {
            setLoading(false);
        }
    };

    const removeFromWishlist = async (productId: string) => {
        if (!wishlist) return;

        setLoading(true);
        try {
            const updatedProducts = wishlist.products
                .map(p => ({ productId: typeof p.productId === 'string' ? p.productId : (p.productId as any)._id, addedAt: p.addedAt }))
                .filter(item => item.productId !== productId);

            await wishlistService.update(wishlist._id, { products: updatedProducts });
            await refreshWishlist();
        } catch (error) {
            console.error('Failed to remove from wishlist:', error);
            throw error;
        } finally {
            setLoading(false);
        }
    };

    return (
        <WishlistContext.Provider value={{ wishlist, loading, isInWishlist, addToWishlist, removeFromWishlist, refreshWishlist }}>
            {children}
        </WishlistContext.Provider>
    );
};

export const useWishlist = () => {
    const context = useContext(WishlistContext);
    if (!context) {
        throw new Error('useWishlist must be used within a WishlistProvider');
    }
    return context;
};
