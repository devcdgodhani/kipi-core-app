import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Zap, Clock, ChevronRight, Loader2 } from 'lucide-react';
import { flashDealService } from '../../services/flashDeal.service';
import type { FlashDeal } from '../../types/flashDeal.types';
import type { Product } from '../../types/product.types';
import ProductCard from './ProductCard';
import { ROUTES } from '../../routes/routeConfig';

const FlashDealSection: React.FC = () => {
    const navigate = useNavigate();
    const [deals, setDeals] = useState<FlashDeal[]>([]);
    const [loading, setLoading] = useState(true);
    const [timeLeft, setTimeLeft] = useState<string>('');

    useEffect(() => {
        const fetchDeals = async () => {
            try {
                const activeDeals = await flashDealService.getActive();
                if (activeDeals && activeDeals.length > 0) {
                    setDeals(activeDeals);
                }
            } catch (error) {
                console.error('Failed to fetch flash deals', error);
            } finally {
                setLoading(false);
            }
        };

        fetchDeals();
    }, []);

    useEffect(() => {
        if (deals.length === 0) return;

        // Use the first deal's end time for the countdown for simplicity
        const endTime = new Date(deals[0].endTime).getTime();

        const timer = setInterval(() => {
            const now = new Date().getTime();
            const distance = endTime - now;

            if (distance < 0) {
                clearInterval(timer);
                setTimeLeft('EXPIRED');
                return;
            }

            const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
            const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
            const seconds = Math.floor((distance % (1000 * 60)) / 1000);

            setTimeLeft(`${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`);
        }, 1000);

        return () => clearInterval(timer);
    }, [deals]);

    if (loading) {
        return (
            <div className="max-w-7xl mx-auto px-4 md:px-8 py-12 flex items-center justify-center">
                <Loader2 className="animate-spin text-accent" size={32} />
            </div>
        );
    }

    if (deals.length === 0) return null;

    // Apply flash deal discount to products for display
    const deal = deals[0];
    const dealProducts = (deal.productIds as Product[]).map(product => {
        let offerPrice = product.basePrice;
        if (deal.discountType === 'PERCENTAGE') {
            offerPrice = product.basePrice * (1 - deal.discountValue / 100);
        } else {
            offerPrice = Math.max(0, product.basePrice - deal.discountValue);
        }

        return {
            ...product,
            offerPrice: offerPrice,
            // Add a flag to indicate it's a flash deal product
            isFlashDeal: true
        };
    });

    return (
        <section className="bg-primary/5 py-12">
            <div className="max-w-7xl mx-auto px-4 md:px-8 space-y-8">
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-gray-200 pb-6">
                    <div>
                        <div className="flex items-center gap-2 text-red-600 mb-2">
                            <Zap size={20} fill="currentColor" />
                            <span className="text-xs font-bold uppercase tracking-widest">Limited Time Offers</span>
                        </div>
                        <h2 className="text-3xl font-black text-gray-900 uppercase tracking-tight flex items-center gap-3">
                            Flash Deals
                        </h2>
                    </div>

                    <div className="flex items-center gap-6">
                        <div className="flex items-center gap-3 bg-white px-4 py-2 rounded-lg shadow-sm border border-gray-100">
                            <Clock size={18} className="text-gray-400" />
                            <div className="flex flex-col">
                                <span className="text-[10px] text-gray-400 uppercase font-bold leading-none">Ending In</span>
                                <span className="text-lg font-mono font-bold text-gray-900 leading-tight tracking-tighter">
                                    {timeLeft}
                                </span>
                            </div>
                        </div>
                        <button
                            onClick={() => navigate(ROUTES.PRODUCTS.ROOT)}
                            className="hidden md:flex items-center gap-1 text-sm font-bold text-gray-500 hover:text-primary transition-colors"
                        >
                            View All <ChevronRight size={16} />
                        </button>
                    </div>
                </div>

                <div className="grid grid-cols-2 lg:grid-cols-4 gap-x-8 gap-y-12">
                    {dealProducts.slice(0, 4).map((product) => (
                        <div key={product._id} className="relative group/flash">
                            <ProductCard product={product as any} />
                            <div className="absolute top-0 right-0 bg-red-600 text-white text-[10px] font-black px-3 py-1.5 rounded-bl-xl shadow-md z-10 uppercase tracking-tighter flex items-center gap-1 animate-pulse">
                                <Zap size={10} fill="currentColor" />
                                Flash Sale
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default FlashDealSection;
