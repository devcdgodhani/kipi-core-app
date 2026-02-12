import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import type { Product, SKU } from '../../types/product.types';
import { productService } from '../../services/product.service';
import { useCart } from '../../context/CartContext';
import ProductReviews from '../../components/Review/ProductReviews';
import { Loader2, ShoppingCart, Minus, Plus } from 'lucide-react';
import RatingStars from '../../components/Review/RatingStars';
import WishlistButton from '../../components/Wishlist/WishlistButton';
import RecentlyViewed from '../../components/Product/RecentlyViewed';
import ETAChecker from '../../components/Product/ETAChecker';
import RecommendationSection from '../../components/Product/RecommendationSection';
import { recentlyViewedService } from '../../services/recentlyViewed.service';


const ProductDetails: React.FC = () => {
    const { id } = useParams<{ id: string }>(); // This 'id' is actually the slug based on our routing
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const { addItem } = useCart();

    const [product, setProduct] = useState<Product | null>(null);
    const [skus, setSkus] = useState<SKU[]>([]);
    const [selectedSku, setSelectedSku] = useState<SKU | null>(null);
    const [loading, setLoading] = useState(true);
    const [quantity, setQuantity] = useState(1);
    const [activeImage, setActiveImage] = useState('');
    const [addingToCart, setAddingToCart] = useState(false);

    useEffect(() => {
        if (id) {
            loadProductData(id);
        }
    }, [id]);

    // Handle SKU selection from URL parameter
    useEffect(() => {
        const skuIdParam = searchParams.get('skuId');
        if (skuIdParam && skus.length > 0) {
            const skuFromParam = skus.find(s => s._id === skuIdParam);
            if (skuFromParam) {
                setSelectedSku(skuFromParam);
            }
        }
    }, [searchParams, skus]);

    const loadProductData = async (slugOrId: string) => {
        setLoading(true);
        try {
            // Try fetching by slug first since that's what we navigate with
            let productData;
            try {
                productData = await productService.getBySlug(slugOrId);
            } catch (error) {
                console.log('Fetch by slug failed, trying ID fallback...');
            }

            if (!productData) {
                try {
                    productData = await productService.getById(slugOrId);
                } catch (error) {
                    console.error('Fetch by ID failed as well');
                }
            }

            if (productData) {
                setProduct(productData);
                // Set default active image
                const activeMedia = productData.media.find(m => m.status === 'ACTIVE');
                const initialImageUrl = (activeMedia?.fileStorageId as any)?.preSignedUrl || activeMedia?.url || '/placeholder-product.png';
                setActiveImage(initialImageUrl);

                // Load SKUs from product data
                const skusData = productData.skus || [];
                setSkus(skusData);

                // Track View
                try {
                    await recentlyViewedService.trackView(productData._id);
                } catch (error) {
                    console.error('Failed to track view', error);
                }

                // Select default SKU (e.g. first one or base product if no variants)
                // If skus exist, select first one
                if (skusData.length > 0) {
                    setSelectedSku(skusData[0]);
                }
            }
        } catch (error) {
            console.error('Failed to load product:', error);
        } finally {
            setLoading(false);
        }
    };

    // Update active image when selected SKU changes
    useEffect(() => {
        if (selectedSku) {
            const skuImage = (selectedSku.media?.[0]?.fileStorageId as any)?.preSignedUrl || selectedSku.media?.[0]?.url;
            if (skuImage) {
                setActiveImage(skuImage);
            } else if (product) {
                const activeMedia = product.media.find(m => m.status === 'ACTIVE');
                const initialImageUrl = (activeMedia?.fileStorageId as any)?.preSignedUrl || activeMedia?.url || '/placeholder-product.png';
                setActiveImage(initialImageUrl);
            }
        }
    }, [selectedSku, product]);

    const handleAddToCart = async () => {
        if (!product || !selectedSku) return;

        console.log('ProductDetails: handleAddToCart', { product, selectedSku });
        setAddingToCart(true);
        try {
            await addItem({
                productId: product._id,
                skuId: selectedSku._id,
                quantity,
                price: selectedSku.price || selectedSku.offerPrice || selectedSku.salePrice || selectedSku.basePrice || 0,
                product: product,
                sku: {
                    ...selectedSku,
                    price: selectedSku.price || selectedSku.offerPrice || selectedSku.salePrice || selectedSku.basePrice || 0
                } as any
            });
            // Success handled by CartContext toast
        } catch (error) {
            console.error('Failed to add to cart:', error);
            // Error handled by CartContext toast
        } finally {
            setAddingToCart(false);
        }
    };

    const handleBuyNow = async () => {
        if (!product || !selectedSku) return;

        setAddingToCart(true);
        try {
            await addItem({
                productId: product._id,
                skuId: selectedSku._id,
                quantity,
                price: selectedSku.price || selectedSku.offerPrice || selectedSku.salePrice || selectedSku.basePrice || 0,
                product: product,
                sku: {
                    ...selectedSku,
                    price: selectedSku.price || selectedSku.offerPrice || selectedSku.salePrice || selectedSku.basePrice || 0
                } as any
            });
            // Navigate to checkout after adding to cart
            navigate('/checkout');
        } catch (error) {
            console.error('Failed to add to cart:', error);
        } finally {
            setAddingToCart(false);
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-[60vh]">
                <Loader2 className="w-10 h-10 animate-spin text-primary" />
            </div>
        );
    }

    if (!product) {
        return (
            <div className="text-center py-20">
                <h2 className="text-2xl font-bold text-primary">Product Not Found</h2>
                <button
                    onClick={() => navigate('/products')}
                    className="mt-4 text-primary underline"
                >
                    Back to Products
                </button>
            </div>
        );
    }

    const currentPrice = selectedSku
        ? (selectedSku.offerPrice || selectedSku.salePrice || selectedSku.basePrice)
        : (product.offerPrice || product.salePrice || product.basePrice);

    const basePrice = selectedSku
        ? selectedSku.basePrice
        : product.basePrice;

    const hasDiscount = currentPrice !== basePrice;

    return (
        <div className="bg-background min-h-screen py-8">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

                {/* Breadcrumb */}
                <div className="mb-6 text-sm text-secondary">
                    <span className="cursor-pointer hover:text-primary" onClick={() => navigate('/')}>Home</span>
                    <span className="mx-2">/</span>
                    <span className="cursor-pointer hover:text-primary" onClick={() => navigate('/products')}>Products</span>
                    <span className="mx-2">/</span>
                    <span className="text-primary font-medium">{product.name}</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-16">
                    {/* Image Gallery */}
                    <div className="space-y-4">
                        <div className="aspect-square bg-primary/5 rounded-2xl overflow-hidden border border-primary/10">
                            <img
                                src={activeImage}
                                alt={product.name}
                                className="w-full h-full object-contain"
                            />
                        </div>
                        {/* Thumbnails */}
                        <div className="flex gap-4 overflow-x-auto pb-2">
                            {/* Merge SKU and Product media */}
                            {[
                                ...(selectedSku?.media || []),
                                ...product.media
                            ].map((media, idx) => {
                                const imageUrl = (media.fileStorageId as any)?.preSignedUrl || media.url;
                                if (!imageUrl) return null;

                                return (
                                    <button
                                        key={idx}
                                        onClick={() => setActiveImage(imageUrl)}
                                        className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-all ${activeImage === imageUrl ? 'border-primary' : 'border-transparent hover:border-primary/20'
                                            }`}
                                    >
                                        <img src={imageUrl} alt="" className="w-full h-full object-cover" />
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {/* Product Info */}
                    <div className="space-y-8">
                        <div>
                            <h1 className="text-3xl md:text-4xl font-bold text-primary mb-2">
                                {product.name}
                            </h1>

                            {/* Reviews Preview (Static rating for now or fetch average) */}
                            <div className="flex items-center gap-2 mb-4">
                                <RatingStars rating={4.5} />
                                <span className="text-sm text-secondary">(24 reviews)</span>
                            </div>

                            <div className="flex items-baseline gap-4 mb-4">
                                <span className="text-3xl font-bold text-primary">
                                    {product.currency} {currentPrice?.toFixed(2)}
                                </span>
                                {hasDiscount && (
                                    <span className="text-xl text-secondary line-through">
                                        {product.currency} {basePrice?.toFixed(2)}
                                    </span>
                                )}
                            </div>
                        </div>

                        <div className="prose text-secondary/80 max-w-none">
                            <p>{product.description}</p>
                        </div>

                        {/* SKU Selector (Enhanced version) */}
                        {skus.length > 0 && (
                            <div className="border-t border-primary/10 pt-6">
                                <h3 className="text-sm font-black uppercase tracking-widest text-primary mb-4">
                                    Select Variant {selectedSku && `(${skus.indexOf(selectedSku) + 1}/${skus.length})`}
                                </h3>
                                <div className="flex flex-wrap gap-3">
                                    {skus.map(sku => {
                                        const isSelected = selectedSku?._id === sku._id;
                                        const isOutOfStock = sku.quantity === 0;
                                        const variantLabel = sku.variantAttributes.map(a => a.label || a.value).join(' / ');

                                        return (
                                            <button
                                                key={sku._id}
                                                onClick={() => !isOutOfStock && setSelectedSku(sku)}
                                                disabled={isOutOfStock}
                                                className={`relative px-5 py-3 rounded-xl border-2 text-sm font-bold transition-all ${isSelected
                                                        ? 'border-primary bg-primary/10 text-primary shadow-lg shadow-primary/20'
                                                        : isOutOfStock
                                                            ? 'border-secondary/20 bg-secondary/5 text-secondary/40 cursor-not-allowed'
                                                            : 'border-primary/20 text-secondary hover:border-primary/60 hover:bg-primary/5'
                                                }`}
                                                title={variantLabel}
                                            >
                                                <span className="block">{variantLabel}</span>
                                                {isOutOfStock && (
                                                    <span className="absolute inset-0 flex items-center justify-center">
                                                        <span className="text-[8px] font-black uppercase bg-secondary/10 px-2 py-0.5 rounded">
                                                            Out of Stock
                                                        </span>
                                                    </span>
                                                )}
                                                {isSelected && !isOutOfStock && (
                                                    <div className="absolute -top-1 -right-1 w-5 h-5 bg-primary rounded-full flex items-center justify-center">
                                                        <svg className="w-3 h-3 text-background" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                                        </svg>
                                                    </div>
                                                )}
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>
                        )}

                        {/* Actions */}
                        <div className="pt-6 border-t border-primary/10 space-y-4">
                            <div className="flex items-center gap-4">
                                {/* Quantity */}
                                <div className="flex items-center border border-primary/20 rounded-xl">
                                    <button
                                        onClick={() => setQuantity(Math.max(1, quantity - 1))}
                                        className="p-3 hover:text-primary transition-colors"
                                    >
                                        <Minus size={20} />
                                    </button>
                                    <span className="w-12 text-center font-semibold text-lg">{quantity}</span>
                                    <button
                                        onClick={() => setQuantity(quantity + 1)}
                                        className="p-3 hover:text-primary transition-colors"
                                    >
                                        <Plus size={20} />
                                    </button>
                                </div>

                                {/* Wishlist */}
                                <div className="p-3 border-2 border-primary/10 rounded-xl hover:bg-primary/5 transition-all flex items-center justify-center">
                                    <WishlistButton
                                        productId={product._id}
                                        skuId={selectedSku?._id || (skus && skus.length > 0 ? skus[0]._id : undefined)}
                                    />
                                </div>
                            </div>

                            {/* Add to Cart and Buy Now Buttons */}
                            <div className="flex gap-3">
                                <button
                                    onClick={handleAddToCart}
                                    disabled={addingToCart || !selectedSku}
                                    className="flex-1 py-3 px-6 bg-background text-primary border-2 border-primary rounded-xl font-bold hover:bg-primary/5 transition-all flex items-center justify-center gap-2 shadow-sm hover:shadow-md disabled:opacity-70 disabled:cursor-not-allowed"
                                >
                                    {addingToCart ? (
                                        <Loader2 className="w-5 h-5 animate-spin" />
                                    ) : (
                                        <>
                                            <ShoppingCart size={20} />
                                            Add to Cart
                                        </>
                                    )}
                                </button>

                                <button
                                    onClick={handleBuyNow}
                                    disabled={addingToCart || !selectedSku}
                                    className="flex-1 py-3 px-6 bg-primary text-background rounded-xl font-bold hover:bg-primary/95 transition-all flex items-center justify-center gap-2 shadow-lg hover:shadow-primary/25 hover:translate-y-[-1px] active:translate-y-[0px] active:shadow-sm disabled:opacity-70 disabled:cursor-not-allowed"
                                >
                                    Buy Now
                                </button>
                            </div>
                        </div>

                        {/* Features/Meta */}
                        <div className="space-y-2 text-sm text-secondary pt-4">
                            <div className="flex gap-2">
                                <span className="font-semibold text-primary">SKU:</span>
                                {selectedSku?.skuCode || product.productCode}
                            </div>
                            <div className="flex gap-2">
                                <span className="font-semibold text-primary">Category:</span>
                                {/* Assuming we populated category names, otherwise show IDs for now or fetch categories */}
                                {product.categoryIds.length > 0 ? 'Premium Collection' : 'Uncategorized'}
                            </div>
                        </div>

                        {/* ETA Checker */}
                        <div className="pt-6 border-t border-primary/10">
                            <ETAChecker />
                        </div>

                    </div>

                </div>

                {/* Reviews Section */}
                <div className="border-t border-primary/10 pt-16">
                    <ProductReviews productId={product._id} />
                </div>

                {/* Recently Viewed */}
                <div className="mt-16">
                    <RecentlyViewed />
                </div>

                {/* Similar Products */}
                <RecommendationSection
                    type="similar"
                    productId={product._id}
                    title="Similar Products"
                    subtitle="Customers also bought"
                />

                {/* Frequently Bought Together */}
                <RecommendationSection
                    type="frequentlyBought"
                    productId={product._id}
                    title="Frequently Bought Together"
                    subtitle="Complete the set"
                    limit={4}
                />


            </div>
        </div>
    );
};

export default ProductDetails;
