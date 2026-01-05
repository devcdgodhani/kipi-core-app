import React, { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import type { Wishlist } from '../types/wishlist.types';
import { wishlistService } from '../services/wishlist.service';
import { useAppSelector } from '../features/hooks';
import { toast } from 'react-hot-toast';

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

    const refreshWishlist = async () => {
        if (!userId) return;

        setLoading(true);
        try {
            console.log('Fetching wishlist for userId:', userId);
            const userWishlist = await wishlistService.getByUser(userId as string);
            console.log('Wishlist response:', userWishlist);
            setWishlist(userWishlist);
        } catch (error: any) {
            console.error('Wishlist fetch error:', error);
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
        return (wishlist?.products || []).some(item => {
            const id = typeof item.productId === 'object' ? (item.productId as any)?._id || (item.productId as any)?.id : item.productId;
            return id === productId;
        });
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
            const updatedProducts = (wishlist.products || [])
                .map(p => {
                    const id = typeof p.productId === 'object' ? (p.productId as any)?._id || (p.productId as any)?.id : p.productId;
                    return { productId: id as string, addedAt: p.addedAt };
                })
                .filter(item => item.productId && item.productId !== productId);

            await wishlistService.update(wishlist._id, { products: updatedProducts });
            await refreshWishlist();
            toast.success('Removed from wishlist');
        } catch (error) {
            console.error('Failed to remove from wishlist:', error);
            toast.error('Failed to remove item');
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
