import React, { useState, useEffect } from 'react';
import { productService } from '../../services/product.service';
import type { Product } from '../../types/product.types';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '../../routes/routeConfig';
import { ShoppingBag, Sparkles } from 'lucide-react';

interface RecommendationSectionProps {
    type: 'similar' | 'recommended' | 'frequentlyBought';
    productId?: string;
    title: string;
    subtitle?: string;
    limit?: number;
}

const RecommendationSection: React.FC<RecommendationSectionProps> = ({
    type,
    productId,
    title,
    subtitle,
    limit = 4
}) => {
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchProducts = async () => {
            setLoading(true);
            try {
                let data: Product[] = [];
                if (type === 'recommended') {
                    data = await productService.getRecommended(limit);
                } else if (type === 'similar' && productId) {
                    data = await productService.getSimilar(productId, limit);
                } else if (type === 'frequentlyBought' && productId) {
                    data = await productService.getFrequentlyBoughtTogether(productId, limit);
                }
                setProducts(data || []);
            } catch (error) {
                console.error(`Failed to fetch ${type} products`, error);
            } finally {
                setLoading(false);
            }
        };
        fetchProducts();
    }, [type, productId, limit]);

    if (!loading && products.length === 0) return null;

    return (
        <section className="max-w-7xl mx-auto px-4 md:px-8 space-y-12 py-20 border-t border-gray-100">
            <div className="flex items-end justify-between">
                <div>
                    {subtitle && <span className="text-xs font-bold text-accent uppercase tracking-widest mb-2 block">{subtitle}</span>}
                    <div className="flex items-center gap-2">
                        <Sparkles className="text-primary" size={20} />
                        <h2 className="text-3xl font-black text-gray-900 uppercase tracking-tight">{title}</h2>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-x-8 gap-y-12">
                {loading ? (
                    [...Array(limit)].map((_, i) => (
                        <div key={i} className="animate-pulse space-y-4">
                            <div className="aspect-[3/4] bg-gray-100 rounded-sm" />
                            <div className="h-4 bg-gray-100 w-3/4 rounded" />
                            <div className="h-4 bg-gray-100 w-1/2 rounded" />
                        </div>
                    ))
                ) : (
                    products.map((product) => (
                        <div
                            key={product._id}
                            className="group cursor-pointer space-y-4"
                            onClick={() => {
                                navigate(ROUTES.PRODUCTS.DETAILS.replace(':id', product.slug || product._id));
                                window.scrollTo(0, 0);
                            }}
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
                            </div>

                            <div>
                                <h3 className="text-sm font-bold text-gray-900 group-hover:text-primary transition-colors line-clamp-1 uppercase tracking-wide">
                                    {product.name}
                                </h3>
                                <p className="text-sm font-medium text-gray-500 mt-1">
                                    ₹ {product.basePrice}
                                </p>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </section>
    );
};

export default RecommendationSection;
