import React, { useEffect, useState } from 'react';
import type { Product, SKU } from '../../types/product.types';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import WishlistButton from '../Wishlist/WishlistButton';
import { ShoppingCart as CartIcon, Loader2 } from 'lucide-react';


interface ProductCardProps {
    product: Product;
}

const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
    const navigate = useNavigate();
    const { addItem } = useCart();
    const [adding, setAdding] = useState(false);
    // Use embedded SKUs if available, otherwise empty. Backend now provides them.
    const [skus, setSkus] = useState<SKU[]>(product.skus || []);
    const [selectedSku, setSelectedSku] = useState<SKU | null>(null);

    useEffect(() => {
        // Reset/Update SKUs if product changes.
        // If product.skus is present (from updated backend), use it.
        if (product.skus) {
            setSkus(product.skus);
            if (product.skus.length > 0 && !selectedSku) {
                setSelectedSku(product.skus[0]);
            }
        } else {
            // Fallback if skus missing (removed separate call to avoid N+1)
            // If we really need to fetch, we should do it, but User specifically requested to stop calling separate API.
            // We'll trust the list API.
            setSkus([]);
        }
    }, [product._id, product.skus]);

    const displayPrice = selectedSku
        ? (selectedSku.offerPrice || selectedSku.salePrice || selectedSku.price || selectedSku.basePrice || 0)
        : (product.offerPrice || product.salePrice || product.basePrice || 0);

    const basePrice = selectedSku ? selectedSku.basePrice : product.basePrice;
    const hasDiscount = displayPrice < basePrice;

    const discountPercentage = hasDiscount
        ? Math.round(((basePrice - displayPrice) / basePrice) * 100)
        : 0;

    const mainImageUrl = (selectedSku?.media?.[0]?.fileStorageId as any)?.preSignedUrl ||
        selectedSku?.media?.[0]?.url ||
        (product.mainImage as any)?.preSignedUrl ||
        product.mainImage ||
        product.media.find(m => m.status === 'ACTIVE')?.url ||
        (product.media.find(m => m.status === 'ACTIVE')?.fileStorageId as any)?.preSignedUrl ||
        '/placeholder-product.png';

    const handleClick = () => {
        const skuParam = selectedSku ? `?skuId=${selectedSku._id}` : '';
        navigate(`/products/${product.slug}${skuParam}`);
    };

    const handleSkuClick = (e: React.MouseEvent, sku: SKU) => {
        e.stopPropagation();
        setSelectedSku(sku);
        navigate(`/products/${product.slug}?skuId=${sku._id}`);
    };

    const handleAddToCart = async (e: React.MouseEvent) => {
        e.stopPropagation();
        setAdding(true);
        try {
            await addItem({
                productId: product._id,
                skuId: selectedSku?._id || product._id,
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
                skuId: selectedSku?._id || product._id,
                quantity: 1,
                price: displayPrice
            } as any);
            navigate('/checkout');
        } catch (error) {
            console.error('Failed to add to cart:', error);
        } finally {
            setAdding(false);
        }
    };

    const currentStock = selectedSku ? selectedSku.quantity : product.stock;

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
                        <WishlistButton
                            productId={product._id}
                            skuId={selectedSku?._id || (product.skus && product.skus.length > 0 ? product.skus[0]._id : undefined)}
                            size={18}
                        />
                    </div>
                </div>

                {/* Out of Stock Overlay */}
                {currentStock === 0 && (
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

                {/* SKU Variants */}
                {skus.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 py-1">
                        {skus.slice(0, 4).map((sku) => {
                            // Extract meaningful label (e.g. Color or Size)
                            const label = sku.variantAttributes[0]?.value || 'VAR';
                            const isSelected = selectedSku?._id === sku._id;

                            return (
                                <button
                                    key={sku._id}
                                    onClick={(e) => handleSkuClick(e, sku)}
                                    className={`px-2 py-1 text-[10px] font-bold uppercase tracking-wider rounded-md border transition-all ${isSelected
                                        ? 'bg-primary text-background border-primary shadow-sm'
                                        : 'bg-primary/5 text-secondary border-primary/20 hover:border-primary/40 hover:bg-primary/10'
                                        }`}
                                    title={sku.variantAttributes.map(a => `${a.label}: ${a.value}`).join(', ')}
                                >
                                    {label}
                                </button>
                            );
                        })}
                        {skus.length > 4 && (
                            <span className="px-2 py-1 text-[9px] font-bold text-secondary bg-primary/5 rounded-md border border-primary/10">
                                +{skus.length - 4}
                            </span>
                        )}
                    </div>
                )}

                {/* Price */}
                <div className="flex items-baseline gap-2">
                    <span className="text-xl font-bold text-primary">
                        {product.currency} {displayPrice.toFixed(2)}
                    </span>
                    {hasDiscount && (
                        <span className="text-sm text-secondary line-through">
                            {product.currency} {basePrice.toFixed(2)}
                        </span>
                    )}
                </div>

                {/* Stock Status */}
                {currentStock > 0 && currentStock < 10 && (
                    <p className="text-xs text-secondary font-bold">
                        Only {currentStock} left in stock
                    </p>
                )}

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-2 mt-3">
                    <button
                        onClick={handleAddToCart}
                        disabled={currentStock === 0 || adding}
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
                        disabled={currentStock === 0 || adding}
                        className="flex-1 py-2.5 px-3 bg-primary text-background rounded-xl font-bold hover:bg-primary/95 transition-all disabled:bg-secondary/20 disabled:text-secondary disabled:cursor-not-allowed flex items-center justify-center gap-1.5 text-[10px] uppercase tracking-widest shadow-sm hover:shadow-md hover:translate-y-[-1px] active:translate-y-[0px] active:shadow-sm"
                    >
                        {currentStock === 0 ? 'Out of Stock' : 'Buy Now'}
                    </button>
                </div>
            </div>

        </div>
    );
};

export default ProductCard;
