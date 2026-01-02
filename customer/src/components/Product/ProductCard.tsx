import React from 'react';
import type { Product } from '../../types/product.types';
import { useNavigate } from 'react-router-dom';

interface ProductCardProps {
    product: Product;
}

const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
    const navigate = useNavigate();

    const displayPrice = product.offerPrice || product.salePrice || product.basePrice;
    const hasDiscount = product.offerPrice || product.salePrice;
    const discountPercentage = hasDiscount
        ? Math.round(((product.basePrice - displayPrice) / product.basePrice) * 100)
        : 0;

    const mainImageUrl = product.media.find(m => m.status === 'ACTIVE')?.url || '/placeholder-product.png';

    const handleClick = () => {
        navigate(`/products/${product.slug}`);
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
                    <div className="absolute top-3 left-3 bg-red-500 text-white px-2 py-1 rounded-md text-xs font-bold">
                        {discountPercentage}% OFF
                    </div>
                )}

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
                    onClick={(e) => {
                        e.stopPropagation();
                        // Will integrate with CartContext later
                        console.log('Add to cart:', product._id);
                    }}
                    disabled={product.stock === 0}
                    className="w-full mt-3 py-2 px-4 bg-primary text-white rounded-lg font-medium hover:bg-primary/90 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
                >
                    {product.stock === 0 ? 'Out of Stock' : 'Add to Cart'}
                </button>
            </div>
        </div>
    );
};

export default ProductCard;
