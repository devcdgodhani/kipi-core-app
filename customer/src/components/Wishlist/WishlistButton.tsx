import React, { useState } from 'react';
import { Heart } from 'lucide-react';
import { useWishlist } from '../../context/WishlistContext';
import { Loader2 } from 'lucide-react';

interface WishlistButtonProps {
    productId: string;
    size?: number;
    className?: string;
    filledClassName?: string;
    outlineClassName?: string;
}

const WishlistButton: React.FC<WishlistButtonProps> = ({
    productId,
    size = 24,
    className = '',
    filledClassName = 'fill-red-500 text-red-500',
    outlineClassName = 'text-gray-400',
}) => {
    const { isInWishlist, addToWishlist, removeFromWishlist } = useWishlist();
    const [loading, setLoading] = useState(false);

    const inWishlist = isInWishlist(productId);

    const handleClick = async (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();

        setLoading(true);
        try {
            if (inWishlist) {
                await removeFromWishlist(productId);
            } else {
                await addToWishlist(productId);
            }
        } catch (error) {
            console.error('Wishlist action failed', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className={`flex items-center justify-center ${className}`}>
                <Loader2 size={size} className="animate-spin text-primary" />
            </div>
        );
    }

    return (
        <button
            onClick={handleClick}
            className={`hover:scale-110 transition-transform ${className}`}
            title={inWishlist ? "Remove from wishlist" : "Add to wishlist"}
        >
            <Heart
                size={size}
                className={(inWishlist ? filledClassName : outlineClassName) + " transition-colors"}
            />
        </button>
    );
};

export default WishlistButton;
