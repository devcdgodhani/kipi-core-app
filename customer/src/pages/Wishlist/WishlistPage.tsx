import React from 'react';
import { useWishlist } from '../../context/WishlistContext';
import { Heart, ShoppingBag, Trash2, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../../context/CartContext';

const WishlistPage: React.FC = () => {
    const { wishlist, loading, removeFromWishlist } = useWishlist();
    const navigate = useNavigate();
    const { addItem } = useCart();

    const moveToCart = async (product: any) => {
        const price = product.offerPrice || product.salePrice || product.basePrice || 0;
        try {
            await addItem({
                productId: product._id,
                skuId: product._id,
                quantity: 1,
                price: price,
                product: product,
                sku: {
                    _id: product._id,
                    basePrice: product.basePrice,
                    salePrice: product.salePrice,
                    offerPrice: product.offerPrice,
                    price: price
                } as any
            });
            removeFromWishlist(product._id);
        } catch (error) {
            console.error('Failed to move to cart', error);
        }
    };

    const buyNow = async (product: any) => {
        const price = product.offerPrice || product.salePrice || product.basePrice || 0;
        try {
            await addItem({
                productId: product._id,
                skuId: product._id,
                quantity: 1,
                price: price,
                product: product,
                sku: {
                    _id: product._id,
                    basePrice: product.basePrice,
                    salePrice: product.salePrice,
                    offerPrice: product.offerPrice,
                    price: price
                } as any
            });
            removeFromWishlist(product._id);
            navigate('/checkout');
        } catch (error) {
            console.error('Failed to buy now', error);
        }
    };

    if (loading && !wishlist) {
        return <div className="text-center py-20 text-secondary">Loading wishlist...</div>
    }

    const items = wishlist?.products || [];

    return (
        <div className="space-y-8">
            <div className="flex justify-between items-center mb-8">
                <div className="flex items-center gap-3">
                    <Heart className="fill-red-500 text-red-500" size={32} />
                    <h1 className="text-2xl font-black text-primary uppercase tracking-tight">Saved Essentials</h1>
                    <span className="text-secondary text-lg font-medium">({items.length})</span>
                </div>
            </div>

            {items.length === 0 ? (
                <div className="bg-background rounded-2xl p-12 text-center shadow-sm border border-primary/10">
                    <div className="w-24 h-24 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
                        <Heart size={48} className="text-red-300" />
                    </div>
                    <h2 className="text-2xl font-bold text-primary mb-2">Your wishlist is empty</h2>
                    <p className="text-secondary mb-8">Saving items for later helps you sort your shopping.</p>
                    <button
                        onClick={() => navigate('/products')}
                        className="inline-flex items-center gap-2 px-8 py-3 bg-primary text-background rounded-xl font-bold hover:bg-primary/90 transition-all"
                    >
                        Start Shopping <ArrowRight size={20} />
                    </button>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {items.map((item: any) => {
                        const product = item.productId as any;

                        if (typeof product === 'string') {
                            return (
                                <div key={product} className="bg-background rounded-xl overflow-hidden shadow-sm p-4 border border-primary/10">
                                    <p className="text-secondary">Item ID: {product} (Unavailable)</p>
                                    <button
                                        onClick={() => removeFromWishlist(product)}
                                        className="text-red-500 text-sm mt-2"
                                    >
                                        Remove
                                    </button>
                                </div>
                            );
                        }

                        if (!product || !product.name) return null;

                        const price = product.offerPrice || product.salePrice || product.basePrice;
                        const skuId = (item as any).skuId?._id || (item as any).skuId || ((item as any).skuId && typeof (item as any).skuId === 'string' ? (item as any).skuId : undefined);
                        const productUrl = `/products/${product.slug || product._id}${skuId ? `?skuId=${skuId}` : ''}`;

                        return (
                            <div key={product._id} className="bg-background rounded-[2rem] overflow-hidden shadow-sm hover:shadow-xl transition-all duration-500 group border border-primary/5">
                                <div
                                    className="relative aspect-square bg-primary/5 cursor-pointer overflow-hidden"
                                    onClick={() => navigate(productUrl)}
                                >
                                    <img
                                        src={(product.mainImage as any)?.preSignedUrl || product.mainImage || '/placeholder-product.png'}
                                        alt={product.name}
                                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                                    />
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            removeFromWishlist(product._id);
                                        }}
                                        className="absolute top-4 right-4 p-3 bg-background/90 backdrop-blur-md rounded-2xl text-secondary hover:text-red-500 transition-all shadow-sm transform hover:rotate-12"
                                    >
                                        <Trash2 size={18} />
                                    </button>
                                </div>

                                <div className="p-6">
                                    <h3
                                        className="font-bold text-primary mb-1 truncate cursor-pointer hover:text-primary transition-colors"
                                        onClick={() => navigate(productUrl)}
                                    >
                                        {product.name}
                                    </h3>
                                    <p className="text-lg font-black text-primary mb-6">
                                        ₹{price?.toLocaleString()}
                                    </p>

                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => moveToCart(product)}
                                            className="flex-1 py-4 bg-background text-primary border-2 border-primary rounded-2xl font-black uppercase text-[10px] tracking-widest hover:bg-primary/5 transition-all flex items-center justify-center gap-2"
                                        >
                                            <ShoppingBag size={14} /> Add to Cart
                                        </button>
                                        <button
                                            onClick={() => buyNow(product)}
                                            className="flex-1 py-4 bg-primary text-background rounded-2xl font-black uppercase text-[10px] tracking-widest hover:bg-primary/90 transition-all flex items-center justify-center gap-2"
                                        >
                                            Buy Now
                                        </button>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
};

export default WishlistPage;
