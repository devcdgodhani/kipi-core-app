
import React, { useState, useEffect } from 'react';
import { bannerService } from '../../services/banner.service';
import type { Banner } from '../../types/banner.types';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const BannerSlider: React.FC = () => {
    const [banners, setBanners] = useState<Banner[]>([]);
    const [loading, setLoading] = useState(true);
    const [current, setCurrent] = useState(0);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchBanners = async () => {
            try {
                const data = await bannerService.getActive();
                setBanners(data);
            } catch (error) {
                console.error('Failed to fetch banners', error);
            } finally {
                setLoading(false);
            }
        };
        fetchBanners();
    }, []);

    useEffect(() => {
        if (banners.length > 1) {
            const timer = setInterval(() => {
                setCurrent((prev) => (prev + 1) % banners.length);
            }, 5000);
            return () => clearInterval(timer);
        }
    }, [banners]);

    if (loading || banners.length === 0) return null;

    const next = () => setCurrent((prev) => (prev + 1) % banners.length);
    const prev = () => setCurrent((prev) => (prev - 1 + banners.length) % banners.length);

    return (
        <section className="relative h-[70vh] min-h-[500px] w-full bg-gray-900 overflow-hidden group">
            {banners.map((banner, index) => (
                <div
                    key={banner._id}
                    className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${index === current ? 'opacity-100 z-10' : 'opacity-0 z-0'
                        }`}
                >
                    <img
                        src={banner.imageId || 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?q=80&w=2070&auto=format&fit=crop'}
                        alt={banner.title}
                        className="w-full h-full object-cover opacity-60"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-gray-900/90 via-gray-900/20 to-transparent" />

                    <div className="relative z-10 h-full max-w-7xl mx-auto px-4 md:px-8 flex items-center">
                        <div className={`max-w-2xl space-y-8 transition-all duration-1000 ${index === current ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'
                            }`}>
                            <span className="inline-block px-4 py-1 border border-white/30 rounded-full text-xs font-bold text-white uppercase tracking-[0.2em] backdrop-blur-md">
                                {banner.subtitle || 'Exclusive Collection'}
                            </span>
                            <h1 className="text-5xl md:text-7xl font-black text-white leading-tight uppercase tracking-tight">
                                {banner.title}
                            </h1>
                            <div className="flex gap-4 pt-4">
                                <button
                                    onClick={() => banner.linkValue && navigate(banner.linkValue)}
                                    className="px-8 py-4 bg-white text-gray-900 text-sm font-black uppercase tracking-widest hover:bg-gray-100 transition-colors"
                                >
                                    Shop Now
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            ))}

            {banners.length > 1 && (
                <>
                    <button
                        onClick={prev}
                        className="absolute left-4 top-1/2 -translate-y-1/2 z-20 p-3 bg-white/10 hover:bg-white/20 text-white backdrop-blur-md rounded-full transition-all opacity-0 group-hover:opacity-100"
                    >
                        <ChevronLeft size={24} />
                    </button>
                    <button
                        onClick={next}
                        className="absolute right-4 top-1/2 -translate-y-1/2 z-20 p-3 bg-white/10 hover:bg-white/20 text-white backdrop-blur-md rounded-full transition-all opacity-0 group-hover:opacity-100"
                    >
                        <ChevronRight size={24} />
                    </button>

                    <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 flex gap-2">
                        {banners.map((_, i) => (
                            <button
                                key={i}
                                onClick={() => setCurrent(i)}
                                className={`w-8 h-1 transition-all ${i === current ? 'bg-white' : 'bg-white/30 hover:bg-white/50'
                                    }`}
                            />
                        ))}
                    </div>
                </>
            )}
        </section>
    );
};

export default BannerSlider;
