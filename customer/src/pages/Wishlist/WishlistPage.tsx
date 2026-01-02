import React from 'react';
import { useWishlist } from '../../context/WishlistContext';
import { Heart, ShoppingBag, Trash2, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const WishlistPage: React.FC = () => {
    const { wishlist, loading, removeFromWishlist } = useWishlist();
    const navigate = useNavigate();

    const moveToCart = async (product: any) => {
        try {
            navigate(`/products/${product.slug || product._id}`);
        } catch (error) {
            console.error('Failed to move to cart', error);
        }
    };

    if (loading && !wishlist) {
        return <div className="min-h-screen pt-24 text-center">Loading wishlist...</div>
    }

    const items = wishlist?.products || [];

    return (
        <div className="min-h-screen bg-gray-50 py-12">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center gap-3 mb-8">
                    <Heart className="fill-red-500 text-red-500" size={32} />
                    <h1 className="text-3xl font-bold text-gray-900">My Wishlist</h1>
                    <span className="text-gray-500 text-lg font-medium">({items.length} items)</span>
                </div>

                {items.length === 0 ? (
                    <div className="bg-white rounded-2xl p-12 text-center shadow-sm">
                        <div className="w-24 h-24 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-6">
                            <Heart size={48} className="text-red-300" />
                        </div>
                        <h2 className="text-2xl font-bold text-gray-900 mb-2">Your wishlist is empty</h2>
                        <p className="text-gray-500 mb-8">Saving items for later helps you sort your shopping.</p>
                        <button
                            onClick={() => navigate('/products')}
                            className="inline-flex items-center gap-2 px-8 py-3 bg-primary text-white rounded-xl font-bold hover:bg-primary/90 transition-all"
                        >
                            Start Shopping <ArrowRight size={20} />
                        </button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {items.map((item: any) => {
                            const product = item.productId as unknown as any;
                            if (!product || !product.name) return null;

                            const price = product.offerPrice || product.salePrice || product.basePrice;

                            return (
                                <div key={product._id} className="bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow group">
                                    <div
                                        className="relative aspect-square bg-gray-100 cursor-pointer overflow-hidden"
                                        onClick={() => navigate(`/products/${product.slug || product._id}`)}
                                    >
                                        <img
                                            src={product.mainImage || '/placeholder-product.png'}
                                            alt={product.name}
                                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                        />
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                removeFromWishlist(product._id);
                                            }}
                                            className="absolute top-3 right-3 p-2 bg-white/90 backdrop-blur-sm rounded-full text-gray-400 hover:text-red-500 transition-colors shadow-sm"
                                        >
                                            <Trash2 size={18} />
                                        </button>
                                    </div>

                                    <div className="p-4">
                                        <h3
                                            className="font-semibold text-gray-900 mb-1 truncate cursor-pointer hover:text-primary transition-colors"
                                            onClick={() => navigate(`/products/${product.slug || product._id}`)}
                                        >
                                            {product.name}
                                        </h3>
                                        <p className="text-primary font-bold mb-4">
                                            $ {price?.toFixed(2)}
                                        </p>

                                        <button
                                            onClick={() => moveToCart(product)}
                                            className="w-full py-2 border border-primary text-primary rounded-lg font-semibold hover:bg-primary hover:text-white transition-all flex items-center justify-center gap-2 text-sm"
                                        >
                                            <ShoppingBag size={16} /> Add to Cart
                                        </button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
};

export default WishlistPage;
