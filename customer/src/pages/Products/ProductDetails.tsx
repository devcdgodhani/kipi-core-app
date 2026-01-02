import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import type { Product, SKU } from '../../types/product.types';
import { productService } from '../../services/product.service';
import { useCart } from '../../context/CartContext';
import ProductReviews from '../../components/Review/ProductReviews';
import { Loader2, ShoppingCart, Minus, Plus } from 'lucide-react';
import RatingStars from '../../components/Review/RatingStars';
import WishlistButton from '../../components/Wishlist/WishlistButton';

const ProductDetails: React.FC = () => {
    const { id } = useParams<{ id: string }>(); // This 'id' is actually the slug based on our routing
    const navigate = useNavigate();
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

    const loadProductData = async (slugOrId: string) => {
        setLoading(true);
        try {
            // Try fetching by slug first since that's what we navigate with
            let productData = await productService.getBySlug(slugOrId);

            // Fallback: If fetch by slug fails or returns nothing (might be ID), try getById
            // Note: In a real app, backend usually handles this or we have separate logic.
            // For now, assuming slug because of ProductCard navigation

            if (productData) {
                setProduct(productData);
                // Set default active image
                const mainImg = productData.media.find(m => m.status === 'ACTIVE');
                setActiveImage(mainImg?.url || '/placeholder-product.png');

                // Load SKUs
                const skusData = await productService.getProductSKUs(productData._id);
                setSkus(skusData);

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

    const handleAddToCart = async () => {
        if (!product || !selectedSku) return;

        setAddingToCart(true);
        try {
            await addItem({
                productId: product._id,
                skuId: selectedSku._id,
                quantity,
                price: selectedSku.basePrice || product.basePrice,
                salePrice: selectedSku.salePrice || product.salePrice,
                offerPrice: selectedSku.offerPrice || product.offerPrice
            });
            // Allow visual feedback or toast
            alert('Added to cart!');
        } catch (error) {
            console.error('Failed to add to cart:', error);
            alert('Failed to add to cart');
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
                <h2 className="text-2xl font-bold text-gray-900">Product Not Found</h2>
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
        <div className="bg-white min-h-screen py-8">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

                {/* Breadcrumb */}
                <div className="mb-6 text-sm text-gray-500">
                    <span className="cursor-pointer hover:text-primary" onClick={() => navigate('/')}>Home</span>
                    <span className="mx-2">/</span>
                    <span className="cursor-pointer hover:text-primary" onClick={() => navigate('/products')}>Products</span>
                    <span className="mx-2">/</span>
                    <span className="text-gray-900 font-medium">{product.name}</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-16">
                    {/* Image Gallery */}
                    <div className="space-y-4">
                        <div className="aspect-square bg-gray-50 rounded-2xl overflow-hidden border border-gray-100">
                            <img
                                src={activeImage}
                                alt={product.name}
                                className="w-full h-full object-contain"
                            />
                        </div>
                        {/* Thumbnails */}
                        <div className="flex gap-4 overflow-x-auto pb-2">
                            {product.media.map((media, idx) => (
                                <button
                                    key={idx}
                                    onClick={() => setActiveImage(media.url)}
                                    className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-all ${activeImage === media.url ? 'border-primary' : 'border-transparent hover:border-gray-200'
                                        }`}
                                >
                                    <img src={media.url} alt="" className="w-full h-full object-cover" />
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Product Info */}
                    <div className="space-y-8">
                        <div>
                            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
                                {product.name}
                            </h1>

                            {/* Reviews Preview (Static rating for now or fetch average) */}
                            <div className="flex items-center gap-2 mb-4">
                                <RatingStars rating={4.5} />
                                <span className="text-sm text-gray-500">(24 reviews)</span>
                            </div>

                            <div className="flex items-baseline gap-4 mb-4">
                                <span className="text-3xl font-bold text-primary">
                                    {product.currency} {currentPrice?.toFixed(2)}
                                </span>
                                {hasDiscount && (
                                    <span className="text-xl text-gray-400 line-through">
                                        {product.currency} {basePrice?.toFixed(2)}
                                    </span>
                                )}
                            </div>
                        </div>

                        <div className="prose text-gray-600 max-w-none">
                            <p>{product.description}</p>
                        </div>

                        {/* SKU Selector (Simple version) */}
                        {skus.length > 1 && (
                            <div>
                                <h3 className="font-semibold text-gray-900 mb-3">Variants</h3>
                                <div className="flex flex-wrap gap-2">
                                    {skus.map(sku => (
                                        <button
                                            key={sku._id}
                                            onClick={() => setSelectedSku(sku)}
                                            className={`px-4 py-2 rounded-lg border text-sm font-medium transition-all ${selectedSku?._id === sku._id
                                                ? 'border-primary bg-primary/5 text-primary'
                                                : 'border-gray-200 text-gray-600 hover:border-gray-300'
                                                }`}
                                        >
                                            {/* Simple display logic for variant attributes */}
                                            {sku.variantAttributes.map(attr => attr.value).join(' / ')}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Actions */}
                        <div className="pt-6 border-t border-gray-100 space-y-4">
                            <div className="flex items-center gap-4">
                                {/* Quantity */}
                                <div className="flex items-center border border-gray-300 rounded-xl">
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

                                {/* Add to Cart */}
                                <button
                                    onClick={handleAddToCart}
                                    disabled={addingToCart || !selectedSku}
                                    className="flex-1 py-3 px-6 bg-primary text-white rounded-xl font-bold hover:bg-primary/90 transition-all flex items-center justify-center gap-2 shadow-lg hover:shadow-primary/25 disabled:opacity-70 disabled:cursor-not-allowed"
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

                                {/* Wishlist */}
                                <div className="p-3 border-2 border-gray-200 rounded-xl hover:bg-gray-50 transition-all flex items-center justify-center">
                                    <WishlistButton productId={product._id} />
                                </div>
                            </div>
                        </div>

                        {/* Features/Meta */}
                        <div className="space-y-2 text-sm text-gray-500 pt-4">
                            <div className="flex gap-2">
                                <span className="font-semibold text-gray-900">SKU:</span>
                                {selectedSku?.skuCode || product.productCode}
                            </div>
                            <div className="flex gap-2">
                                <span className="font-semibold text-gray-900">Category:</span>
                                {/* Assuming we populated category names, otherwise show IDs for now or fetch categories */}
                                {product.categoryIds.length > 0 ? 'Premium Collection' : 'Uncategorized'}
                            </div>
                        </div>

                    </div>
                </div>

                {/* Reviews Section */}
                <div className="border-t border-gray-200 pt-16">
                    <ProductReviews productId={product._id} />
                </div>

            </div>
        </div>
    );
};

export default ProductDetails;
