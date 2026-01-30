
import React, { useState, useEffect } from 'react';
import { recentlyViewedService } from '../../services/recentlyViewed.service';
import type { Product } from '../../types/product.types';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '../../routes/routeConfig';
import { ShoppingBag } from 'lucide-react';

const RecentlyViewed: React.FC = () => {
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchRecentlyViewed = async () => {
            try {
                const response = await recentlyViewedService.getRecentlyViewed(8);
                setProducts(response.products);
            } catch (error) {
                console.error('Failed to fetch recently viewed', error);
            } finally {
                setLoading(false);
            }
        };
        fetchRecentlyViewed();
    }, []);

    if (loading || !products || products.length === 0) return null;

    return (
        <section className="max-w-7xl mx-auto px-4 md:px-8 space-y-12 py-20 border-t border-primary/10">
            <div className="flex items-end justify-between">
                <div>
                    <span className="text-xs font-bold text-accent uppercase tracking-widest mb-2 block">Pick up where you left off</span>
                    <h2 className="text-3xl font-black text-primary uppercase tracking-tight">Recently Viewed</h2>
                </div>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-x-8 gap-y-12">
                {products.map((product) => (
                    <div
                        key={product._id}
                        className="group cursor-pointer space-y-4"
                        onClick={() => navigate(ROUTES.PRODUCTS.DETAILS.replace(':id', product._id))}
                    >
                        <div className="aspect-[3/4] bg-primary/5 relative overflow-hidden">
                            {product.media?.[0]?.url ? (
                                <img
                                    src={(product.media[0].fileStorageId as any)?.preSignedUrl || product.media[0].url}
                                    alt={product.name}
                                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                                />
                            ) : (
                                    <div className="w-full h-full flex items-center justify-center bg-primary/5 text-secondary/30">
                                    <ShoppingBag size={48} />
                                </div>
                            )}
                        </div>

                        <div>
                            <h3 className="text-sm font-bold text-primary group-hover:text-primary transition-colors line-clamp-1 uppercase tracking-wide">
                                {product.name}
                            </h3>
                            <p className="text-sm font-medium text-secondary mt-1">
                                ₹ {product.basePrice}
                            </p>
                        </div>
                    </div>
                ))}
            </div>
        </section>
    );
};

export default RecentlyViewed;
