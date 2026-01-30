import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import * as LucideIcons from 'lucide-react';
import { productService } from '../../services/product.service';
import type { Product } from '../../types/product.types';
import { ROUTES } from '../../routes/routeConfig';
import { toast } from 'react-hot-toast';
import BannerSlider from '../../components/Banner/BannerSlider';
import RecentlyViewed from '../../components/Product/RecentlyViewed';
import RecommendationSection from '../../components/Product/RecommendationSection';
import FlashDealSection from '../../components/Product/FlashDealSection';
import { useCustomerAppSettings } from '../../context/CustomerAppSettingsContext';
import type { HomePageSection } from '../../types/customerAppSettings.types';

const Home: React.FC = () => {
    const navigate = useNavigate();
    const { getVisibleSections, getFeatures, isLoading: isSettingsLoading } = useCustomerAppSettings();
    const [newArrivals, setNewArrivals] = useState<Product[]>([]);
    const [isProductsLoading, setIsProductsLoading] = useState(true);

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
                setIsProductsLoading(false);
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

    if (isSettingsLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
            </div>
        );
    }

    const renderFeatureIcon = (iconName: string) => {
        const Icon = (LucideIcons as any)[iconName] || LucideIcons.Star;
        return <Icon size={24} />;
    };

    const renderSection = (section: HomePageSection) => {
        switch (section.sectionId) {
            case 'BANNER':
                return <BannerSlider key={section.sectionId} />;

            case 'FLASH_DEALS':
                return (
                    <FlashDealSection
                        key={section.sectionId}
                        title={section.title}
                        subtitle={section.subtitle}
                    />
                );

            case 'FEATURES':
                const features = getFeatures();
                if (features.length === 0) return null;
                return (
                    <section key={section.sectionId} className="max-w-7xl mx-auto px-4 md:px-8 grid grid-cols-1 md:grid-cols-3 gap-8">
                        {features.map((feature, idx) => (
                            <div key={idx} className="flex gap-4 p-6 border border-primary/5 bg-background hover:shadow-lg hover:border-primary/20 transition-all duration-300 group">
                                <div className="w-12 h-12 bg-primary/5 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-background transition-colors duration-300">
                                    {renderFeatureIcon(feature.icon)}
                                </div>
                                <div>
                                    <h3 className="font-bold text-sm uppercase tracking-wider text-primary mb-1">{feature.title}</h3>
                                    <p className="text-xs text-secondary leading-relaxed">{feature.description}</p>
                                </div>
                            </div>
                        ))}
                    </section>
                );

            case 'NEW_ARRIVALS':
                return (
                    <section key={section.sectionId} className="max-w-7xl mx-auto px-4 md:px-8 space-y-12">
                        <div className="flex items-end justify-between border-b border-primary/10 pb-6">
                            <div>
                                <span className="text-xs font-bold text-accent uppercase tracking-widest mb-2 block">{section.subtitle || 'Fresh Drops'}</span>
                                <h2 className="text-3xl font-black text-primary uppercase tracking-tight">{section.title || 'Trending Now'}</h2>
                            </div>
                            {section.viewAllLink && (
                                <button
                                    onClick={() => navigate(section.viewAllLink || ROUTES.PRODUCTS.ROOT)}
                                    className="group flex items-center gap-2 text-sm font-bold text-secondary hover:text-primary transition-colors"
                                >
                                    {section.viewAllText || 'View All'} <LucideIcons.ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                                </button>
                            )}
                        </div>

                        {isProductsLoading ? (
                            <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
                                {[1, 2, 3, 4].map(n => (
                                    <div key={n} className="space-y-4 animate-pulse">
                                        <div className="aspect-[3/4] bg-primary/5 w-full" />
                                        <div className="h-4 bg-primary/5 w-2/3" />
                                        <div className="h-4 bg-primary/5 w-1/3" />
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="grid grid-cols-2 lg:grid-cols-4 gap-x-8 gap-y-12">
                                    {newArrivals.slice(0, section.limit || 8).map((product) => (
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
                                                        <div className="w-full h-full flex items-center justify-center bg-primary/5 text-primary/20">
                                                        <LucideIcons.ShoppingBag size={48} />
                                                    </div>
                                                )}

                                                {/* Quick Actions Hover */}
                                                <div className="absolute inset-x-4 bottom-4 translate-y-full group-hover:translate-y-0 transition-transform duration-300 flex flex-col gap-2">
                                                    <button
                                                        onClick={(e) => handleAddToCart(e, product)}
                                                        className="w-full py-3 bg-background text-primary text-xs font-black uppercase tracking-widest hover:bg-primary hover:text-background transition-colors shadow-lg"
                                                    >
                                                        View Details
                                                    </button>
                                                </div>

                                                {/* Badges */}
                                                {product.status === 'ACTIVE' && product.stock > 0 && (
                                                    <span className="absolute top-4 left-4 bg-primary text-background text-[10px] font-bold px-2 py-1 uppercase tracking-widest">
                                                        Trending
                                                    </span>
                                                )}
                                            </div>

                                            <div>
                                                <h3 className="text-sm font-bold text-primary group-hover:text-primary transition-colors line-clamp-1 uppercase tracking-wide">
                                                    {product.name}
                                                </h3>
                                                <div className="flex items-center justify-between mt-1">
                                                    <p className="text-sm font-medium text-secondary">
                                                        ₹ {product.basePrice}
                                                    </p>
                                                    <div className="flex items-center gap-1 text-amber-400">
                                                        <LucideIcons.Star size={12} fill="currentColor" />
                                                        <span className="text-[10px] font-bold text-secondary">4.8</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                            </div>
                        )}
                    </section>
                );

            case 'RECENTLY_VIEWED':
                return <RecentlyViewed key={section.sectionId} />;

            case 'RECOMMENDATIONS':
                return (
                    <RecommendationSection
                        key={section.sectionId}
                        type="recommended"
                        title={section.title || "Recommended for You"}
                        subtitle={section.subtitle || "Based on your style"}
                        limit={section.limit || 4}
                    />
                );

            default:
                return null;
        }
    };

    return (
        <div className="space-y-24 pb-12">
            {getVisibleSections().map(renderSection)}
        </div>
    );
};

export default Home;
