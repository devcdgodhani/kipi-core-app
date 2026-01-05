import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Star, ShoppingBag, Truck, ShieldCheck, RefreshCw } from 'lucide-react';
import { productService } from '../../services/product.service';
import type { Product } from '../../types/product.types';
import { ROUTES } from '../../routes/routeConfig';
import { useCart } from '../../context/CartContext';
import { toast } from 'react-hot-toast';

const Home: React.FC = () => {
    const navigate = useNavigate();
    const { addToCart } = useCart();
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
            // Default to first SKU if available, or just add product wrapper logic if needed by context
            // Assuming context handles product addition or we need SKU. 
            // For Quick Add, we might need to open modal or pick default SKU.
            // Simplified: Redirect to detailed view for options or add if simple.
            navigate(ROUTES.PRODUCTS.DETAILS.replace(':id', product._id));
        } catch (error) {
            toast.error('Could not add to cart');
        }
    };

    return (
        <div className="space-y-24 pb-12">
            {/* Hero Section */}
            <section className="relative h-[85vh] min-h-[600px] w-full bg-gray-900 overflow-hidden flex items-center">
                {/* Background Image - Using a high-quality fashion placeholder */}
                <div className="absolute inset-0 z-0">
                    <img
                        src="https://images.unsplash.com/photo-1490481651871-ab68de25d43d?q=80&w=2070&auto=format&fit=crop"
                        alt="Hero"
                        className="w-full h-full object-cover opacity-60"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-gray-900/90 via-gray-900/20 to-transparent" />
                </div>

                <div className="relative z-10 max-w-7xl mx-auto px-4 md:px-8 w-full">
                    <div className="max-w-2xl space-y-8 animate-in slide-in-from-bottom-10 duration-1000 fade-in">
                        <span className="inline-block px-4 py-1 border border-white/30 rounded-full text-xs font-bold text-white uppercase tracking-[0.2em] backdrop-blur-md">
                            New Collection 2026
                        </span>
                        <h1 className="text-5xl md:text-7xl font-black text-white leading-tight uppercase tracking-tight">
                            Redefine <br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-400">Your Style</span>
                        </h1>
                        <p className="text-lg text-gray-300 leading-relaxed max-w-lg">
                            Discover the new era of fashion with our sustainable, premium crafted collection designed for the modern individual.
                        </p>
                        <div className="flex gap-4 pt-4">
                            <button
                                onClick={() => navigate(ROUTES.PRODUCTS.ROOT)}
                                className="px-8 py-4 bg-white text-gray-900 text-sm font-black uppercase tracking-widest hover:bg-gray-100 transition-colors"
                            >
                                Shop Collection
                            </button>
                            <button
                                onClick={() => navigate(ROUTES.PRODUCTS.ROOT)}
                                className="px-8 py-4 bg-transparent border border-white text-white text-sm font-black uppercase tracking-widest hover:bg-white/10 transition-colors backdrop-blur-sm"
                            >
                                View Lookbook
                            </button>
                        </div>
                    </div>
                </div>
            </section>

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
                                    {product.images?.[0] ? (
                                        <img
                                            src={product.images[0]}
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
                                    {product.isNew && (
                                        <span className="absolute top-4 left-4 bg-primary text-white text-[10px] font-bold px-2 py-1 uppercase tracking-widest">
                                            New
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

            {/* Categories Grid (Static for visuals) */}
            <section className="bg-gray-50 py-24">
                <div className="max-w-7xl mx-auto px-4 md:px-8 space-y-12">
                    <div className="text-center max-w-2xl mx-auto">
                        <span className="text-xs font-bold text-accent uppercase tracking-widest mb-2 block">Curated For You</span>
                        <h2 className="text-3xl md:text-4xl font-black text-gray-900 uppercase tracking-tight mb-4">Shop By Category</h2>
                        <p className="text-gray-500">Explore our finest selections categorized for your convenience.</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 h-[600px]">
                        <div className="relative group overflow-hidden cursor-pointer h-full" onClick={() => navigate(ROUTES.PRODUCTS.ROOT)}>
                            <img
                                src="https://images.unsplash.com/photo-1539109136881-3be0616acf4b?q=80&w=1887&auto=format&fit=crop"
                                alt="Men"
                                className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105"
                            />
                            <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-colors" />
                            <div className="absolute bottom-12 left-12 text-white">
                                <h3 className="text-4xl font-black uppercase tracking-tight mb-4 transform translate-y-4 group-hover:translate-y-0 transition-transform duration-500">Men</h3>
                                <span className="inline-flex items-center gap-2 text-sm font-bold uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity duration-500 delay-100">
                                    Shop Now <ArrowRight size={16} />
                                </span>
                            </div>
                        </div>
                        <div className="grid grid-rows-2 gap-4 h-full">
                            <div className="relative group overflow-hidden cursor-pointer h-full" onClick={() => navigate(ROUTES.PRODUCTS.ROOT)}>
                                <img
                                    src="https://images.unsplash.com/photo-1549570652-c2aeb37a9f8f?q=80&w=1974&auto=format&fit=crop"
                                    alt="Women"
                                    className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105"
                                />
                                <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-colors" />
                                <div className="absolute bottom-8 left-8 text-white">
                                    <h3 className="text-3xl font-black uppercase tracking-tight mb-2 transform translate-y-4 group-hover:translate-y-0 transition-transform duration-500">Women</h3>
                                </div>
                            </div>
                            <div className="relative group overflow-hidden cursor-pointer h-full" onClick={() => navigate(ROUTES.PRODUCTS.ROOT)}>
                                <img
                                    src="https://images.unsplash.com/photo-1596704017254-9b121068fb31?q=80&w=2070&auto=format&fit=crop"
                                    alt="Accessories"
                                    className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105"
                                />
                                <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-colors" />
                                <div className="absolute bottom-8 left-8 text-white">
                                    <h3 className="text-3xl font-black uppercase tracking-tight mb-2 transform translate-y-4 group-hover:translate-y-0 transition-transform duration-500">Accessories</h3>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default Home;
