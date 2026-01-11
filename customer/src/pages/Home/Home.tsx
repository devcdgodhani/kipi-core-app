import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Star, ShoppingBag, Truck, ShieldCheck, RefreshCw } from 'lucide-react';
import { productService } from '../../services/product.service';
import type { Product } from '../../types/product.types';
import { ROUTES } from '../../routes/routeConfig';
import { toast } from 'react-hot-toast';
import BannerSlider from '../../components/Banner/BannerSlider';
import RecentlyViewed from '../../components/Product/RecentlyViewed';
import RecommendationSection from '../../components/Product/RecommendationSection';


const Home: React.FC = () => {
    const navigate = useNavigate();
    const [newArrivals, setNewArrivals] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                // Fetch latest products
                const response = await productService.getWithPagination({ limit: 8 });
                if (response && response.data) {
                    setNewArrivals(response.data);
                }
            } catch (error) {
                console.error('Failed to fetch products', error);
            } finally {
                setLoading(false);
            }
        };
        fetchProducts();
    }, []);

    const handleAddToCart = async (e: React.MouseEvent, product: Product) => {
        e.stopPropagation();
        try {
            // Redirect to details for simple handling
            navigate(ROUTES.PRODUCTS.DETAILS.replace(':id', product._id));
        } catch (error) {
            toast.error('Could not add to cart');
        }
    };

    return (
        <div className="space-y-24 pb-12">
            {/* Hero Section - Replaced with dynamic Banner Slider */}
            <BannerSlider />


            {/* Features / Value Props */}
            <section className="max-w-7xl mx-auto px-4 md:px-8 grid grid-cols-1 md:grid-cols-3 gap-8">
                {[
                    { icon: Truck, title: 'Global Shipping', desc: 'Free express delivery on all orders over $200' },
                    { icon: ShieldCheck, title: 'Secure Payment', desc: '100% secure transaction with encrypted checkout' },
                    { icon: RefreshCw, title: 'Easy Returns', desc: '30-day return policy for a hassle-free experience' }
                ].map((feature, idx) => (
                    <div key={idx} className="flex gap-4 p-6 border border-gray-100 bg-white hover:shadow-lg hover:border-gray-200 transition-all duration-300 group">
                        <div className="w-12 h-12 bg-gray-50 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-colors duration-300">
                            <feature.icon size={24} />
                        </div>
                        <div>
                            <h3 className="font-bold text-sm uppercase tracking-wider text-gray-900 mb-1">{feature.title}</h3>
                            <p className="text-xs text-gray-500 leading-relaxed">{feature.desc}</p>
                        </div>
                    </div>
                ))}
            </section>

            {/* Trending / New Arrivals */}
            <section className="max-w-7xl mx-auto px-4 md:px-8 space-y-12">
                <div className="flex items-end justify-between border-b border-gray-100 pb-6">
                    <div>
                        <span className="text-xs font-bold text-accent uppercase tracking-widest mb-2 block">Fresh Drops</span>
                        <h2 className="text-3xl font-black text-gray-900 uppercase tracking-tight">Trending Now</h2>
                    </div>
                    <button
                        onClick={() => navigate(ROUTES.PRODUCTS.ROOT)}
                        className="group flex items-center gap-2 text-sm font-bold text-gray-500 hover:text-primary transition-colors"
                    >
                        View All <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                    </button>
                </div>

                {loading ? (
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
                        {[1, 2, 3, 4].map(n => (
                            <div key={n} className="space-y-4 animate-pulse">
                                <div className="aspect-[3/4] bg-gray-100 w-full" />
                                <div className="h-4 bg-gray-100 w-2/3" />
                                <div className="h-4 bg-gray-100 w-1/3" />
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-x-8 gap-y-12">
                        {newArrivals.map((product) => (
                            <div
                                key={product._id}
                                className="group cursor-pointer space-y-4"
                                onClick={() => navigate(ROUTES.PRODUCTS.DETAILS.replace(':id', product._id))}
                            >
                                <div className="aspect-[3/4] bg-gray-100 relative overflow-hidden">
                                    {product.media?.[0]?.url ? (
                                        <img
                                            src={product.media[0].url}
                                            alt={product.name}
                                            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                                        />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center bg-gray-50 text-gray-200">
                                            <ShoppingBag size={48} />
                                        </div>
                                    )}

                                    {/* Quick Actions Hover */}
                                    <div className="absolute inset-x-4 bottom-4 translate-y-full group-hover:translate-y-0 transition-transform duration-300 flex flex-col gap-2">
                                        <button
                                            onClick={(e) => handleAddToCart(e, product)}
                                            className="w-full py-3 bg-white text-gray-900 text-xs font-black uppercase tracking-widest hover:bg-primary hover:text-white transition-colors shadow-lg"
                                        >
                                            View Details
                                        </button>
                                    </div>

                                    {/* Badges */}
                                    {product.status === 'ACTIVE' && product.stock > 0 && (
                                        <span className="absolute top-4 left-4 bg-primary text-white text-[10px] font-bold px-2 py-1 uppercase tracking-widest">
                                            Trending
                                        </span>
                                    )}
                                </div>

                                <div>
                                    <h3 className="text-sm font-bold text-gray-900 group-hover:text-primary transition-colors line-clamp-1 uppercase tracking-wide">
                                        {product.name}
                                    </h3>
                                    <div className="flex items-center justify-between mt-1">
                                        <p className="text-sm font-medium text-gray-500">
                                            ₹ {product.basePrice}
                                        </p>
                                        <div className="flex items-center gap-1 text-amber-400">
                                            <Star size={12} fill="currentColor" />
                                            <span className="text-[10px] font-bold text-gray-400">4.8</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </section>

            {/* Recently Viewed */}
            <RecentlyViewed />

            {/* Personalized Recommendations */}
            <RecommendationSection
                type="recommended"
                title="Recommended for You"
                subtitle="Based on your style"
                limit={4}
            />
        </div>
    );
};

export default Home;
