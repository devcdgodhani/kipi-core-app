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

    const mainImageUrl = product.mainImage || product.media.find(m => m.status === 'ACTIVE')?.url || '/placeholder-product.png';

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
            } as any);
        } catch (error) {
            console.error('Failed to add to cart:', error);
        } finally {
            setAdding(false);
        }
    };


    return (
        <div
            onClick={handleClick}
            className="group cursor-pointer bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 border border-gray-100"
        >
            {/* Image Container */}
            <div className="relative aspect-square bg-gray-50 overflow-hidden">
                <img
                    src={mainImageUrl}
                    alt={product.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />

                {/* Discount Badge */}
                {hasDiscount && (
                    <div className="absolute top-3 left-3 bg-red-500 text-white px-2 py-1 rounded-md text-xs font-bold shadow-sm">
                        {discountPercentage}% OFF
                    </div>
                )}

                {/* Wishlist Button Overlay */}
                <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <div className="bg-white/90 backdrop-blur-sm p-1.5 rounded-full shadow-sm hover:bg-white transition-colors">
                        <WishlistButton productId={product._id} size={18} />
                    </div>
                </div>


                {/* Out of Stock Overlay */}
                {product.stock === 0 && (
                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                        <span className="bg-white text-gray-900 px-4 py-2 rounded-lg font-bold">
                            Out of Stock
                        </span>
                    </div>
                )}
            </div>

            {/* Product Info */}
            <div className="p-4 space-y-2">
                <h3 className="font-semibold text-gray-900 line-clamp-2 min-h-[3rem]">
                    {product.name}
                </h3>

                {/* Price */}
                <div className="flex items-baseline gap-2">
                    <span className="text-xl font-bold text-primary">
                        {product.currency} {displayPrice.toFixed(2)}
                    </span>
                    {hasDiscount && (
                        <span className="text-sm text-gray-400 line-through">
                            {product.currency} {product.basePrice.toFixed(2)}
                        </span>
                    )}
                </div>

                {/* Stock Status */}
                {product.stock > 0 && product.stock < 10 && (
                    <p className="text-xs text-orange-600">
                        Only {product.stock} left in stock
                    </p>
                )}

                {/* Add to Cart Button */}
                <button
                    onClick={handleAddToCart}
                    disabled={product.stock === 0 || adding}
                    className="w-full mt-3 py-2.5 px-4 bg-primary text-white rounded-xl font-bold hover:bg-primary/95 transition-all disabled:bg-gray-200 disabled:text-gray-400 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-xs uppercase tracking-widest shadow-sm hover:shadow-md hover:translate-y-[-1px] active:translate-y-[0px] active:shadow-sm"
                >
                    {adding ? (
                        <Loader2 size={16} className="animate-spin" />
                    ) : (
                        <>
                            <CartIcon size={16} />
                            {product.stock === 0 ? 'Out of Stock' : 'Add to Cart'}
                        </>
                    )}
                </button>
            </div>

        </div>
    );
};

export default ProductCard;
