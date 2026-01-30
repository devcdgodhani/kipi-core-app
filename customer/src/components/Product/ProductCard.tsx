import React from 'react';
import type { Product } from '../../types/product.types';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import WishlistButton from '../Wishlist/WishlistButton';
import { ShoppingCart as CartIcon, Loader2 } from 'lucide-react';
import { useState } from 'react';

interface ProductCardProps {
    product: Product;
}

const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
    const navigate = useNavigate();
    const { addItem } = useCart();
    const [adding, setAdding] = useState(false);

    const displayPrice = product.offerPrice || product.salePrice || product.basePrice || 0;
    const hasDiscount = !!((product.offerPrice || product.salePrice) && (product.offerPrice || product.salePrice || 0) < product.basePrice);

    const discountPercentage = hasDiscount
        ? Math.round(((product.basePrice - displayPrice) / product.basePrice) * 100)
        : 0;

    const mainImageUrl = (product.mainImage as any)?.preSignedUrl || product.mainImage ||
        product.media.find(m => m.status === 'ACTIVE')?.url ||
        (product.media.find(m => m.status === 'ACTIVE')?.fileStorageId as any)?.preSignedUrl ||
        '/placeholder-product.png';

    const handleClick = () => {
        navigate(`/products/${product.slug}`);
    };

    const handleAddToCart = async (e: React.MouseEvent) => {
        e.stopPropagation();
        setAdding(true);
        try {
            await addItem({
                productId: product._id,
                skuId: product._id, // Fallback to product._id if skuId is not available
                quantity: 1,
                price: displayPrice
            } as any);
        } catch (error) {
            console.error('Failed to add to cart:', error);
        } finally {
            setAdding(false);
        }
    };

    const handleBuyNow = async (e: React.MouseEvent) => {
        e.stopPropagation();
        setAdding(true);
        try {
            await addItem({
                productId: product._id,
                skuId: product._id,
                quantity: 1,
                price: displayPrice
            } as any);
            // Navigate to checkout after adding to cart
            navigate('/checkout');
        } catch (error) {
            console.error('Failed to add to cart:', error);
        } finally {
            setAdding(false);
        }
    };



    return (
        <div
            onClick={handleClick}
            className="group cursor-pointer bg-background rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 border border-primary/5"
        >
            {/* Image Container */}
            <div className="relative aspect-square bg-primary/5 overflow-hidden">
                <img
                    src={mainImageUrl}
                    alt={product.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />

                {/* Discount Badge */}
                {hasDiscount && (
                    <div className="absolute top-3 left-3 bg-primary text-background px-2 py-1 rounded-md text-xs font-bold shadow-sm">
                        {discountPercentage}% OFF
                    </div>
                )}

                {/* Wishlist Button Overlay */}
                <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <div className="bg-background/90 backdrop-blur-sm p-1.5 rounded-full shadow-sm hover:bg-background transition-colors">
                        <WishlistButton productId={product._id} size={18} />
                    </div>
                </div>


                {/* Out of Stock Overlay */}
                {product.stock === 0 && (
                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                        <span className="bg-background text-primary px-4 py-2 rounded-lg font-bold">
                            Out of Stock
                        </span>
                    </div>
                )}
            </div>

            {/* Product Info */}
            <div className="p-4 space-y-2">
                <h3 className="font-semibold text-primary line-clamp-2 min-h-[3rem]">
                    {product.name}
                </h3>

                {/* Price */}
                <div className="flex items-baseline gap-2">
                    <span className="text-xl font-bold text-primary">
                        {product.currency} {displayPrice.toFixed(2)}
                    </span>
                    {hasDiscount && (
                        <span className="text-sm text-secondary line-through">
                            {product.currency} {product.basePrice.toFixed(2)}
                        </span>
                    )}
                </div>

                {/* Stock Status */}
                {product.stock > 0 && product.stock < 10 && (
                    <p className="text-xs text-secondary font-bold">
                        Only {product.stock} left in stock
                    </p>
                )}

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-2 mt-3">
                    <button
                        onClick={handleAddToCart}
                        disabled={product.stock === 0 || adding}
                        className="flex-1 py-2.5 px-3 bg-background text-primary border-2 border-primary rounded-xl font-bold hover:bg-primary/5 transition-all disabled:bg-secondary/20 disabled:text-secondary disabled:border-secondary/20 disabled:cursor-not-allowed flex items-center justify-center gap-1.5 text-[10px] uppercase tracking-widest shadow-sm hover:shadow-md"
                    >
                        {adding ? (
                            <Loader2 size={14} className="animate-spin" />
                        ) : (
                            <>
                                    <CartIcon size={14} />
                                    <span className="sm:inline">Cart</span>
                            </>
                        )}
                    </button>
                    <button
                        onClick={handleBuyNow}
                        disabled={product.stock === 0 || adding}
                        className="flex-1 py-2.5 px-3 bg-primary text-background rounded-xl font-bold hover:bg-primary/95 transition-all disabled:bg-secondary/20 disabled:text-secondary disabled:cursor-not-allowed flex items-center justify-center gap-1.5 text-[10px] uppercase tracking-widest shadow-sm hover:shadow-md hover:translate-y-[-1px] active:translate-y-[0px] active:shadow-sm"
                    >
                        {product.stock === 0 ? 'Out of Stock' : 'Buy Now'}
                    </button>
                </div>
            </div>

        </div>
    );
};

export default ProductCard;
