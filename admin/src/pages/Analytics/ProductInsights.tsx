import React, { useEffect, useState, useCallback } from 'react';
import {
    Package,
    AlertTriangle,
    Download,
    TrendingUp
} from 'lucide-react';
import { analyticsService } from '../../services/analyticsService';
import type { IProductAnalytics } from '../../services/analyticsService';
import toast from 'react-hot-toast';

const ProductInsights: React.FC = () => {
    const [loading, setLoading] = useState(true);
    const [productData, setProductData] = useState<IProductAnalytics | null>(null);
    const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d'>('30d');

    const fetchAnalytics = useCallback(async () => {
        try {
            setLoading(true);
            const endDate = new Date();
            const startDate = new Date();

            if (timeRange === '7d') startDate.setDate(endDate.getDate() - 7);
            if (timeRange === '30d') startDate.setDate(endDate.getDate() - 30);
            if (timeRange === '90d') startDate.setDate(endDate.getDate() - 90);

            const pData = await analyticsService.getProductAnalytics(startDate, endDate);
            setProductData(pData);
        } catch (error) {
            console.error(error);
            toast.error('Failed to load product analytics');
        } finally {
            setLoading(false);
        }
    }, [timeRange]);

    useEffect(() => {
        fetchAnalytics();
    }, [fetchAnalytics]);

    const handleExport = (format: 'xlsx' | 'csv' = 'xlsx') => {
        const endDate = new Date();
        const startDate = new Date();
        if (timeRange === '7d') startDate.setDate(endDate.getDate() - 7);
        if (timeRange === '30d') startDate.setDate(endDate.getDate() - 30);
        if (timeRange === '90d') startDate.setDate(endDate.getDate() - 90);

        const url = `/api/v1/admin/analytics/export/products?startDate=${startDate.toISOString()}&endDate=${endDate.toISOString()}&format=${format}`;
        const token = localStorage.getItem('token');

        fetch(url, {
            headers: { Authorization: `Bearer ${token}` }
        })
            .then(res => res.blob())
            .then(blob => {
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `product-analytics-${Date.now()}.${format}`;
                document.body.appendChild(a);
                a.click();
                a.remove();
                window.URL.revokeObjectURL(url);
                toast.success('Export downloaded successfully');
            })
            .catch(err => {
                console.error(err);
                toast.error('Failed to export data');
            });
    };

    if (loading) {
        return <div className="p-10 flex justify-center text-primary font-bold">Loading Product Insights...</div>;
    }

    return (
        <div className="p-6 space-y-8">
            {/* Premium Hero Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-white p-8 rounded-[2.5rem] border border-primary/5 shadow-sm relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full -mr-32 -mt-32 blur-3xl group-hover:bg-primary/10 transition-colors duration-1000" />
                <div className="relative z-10 flex items-center gap-6">
                    <div className="w-16 h-16 rounded-[1.5rem] bg-amber-500 flex items-center justify-center text-white shadow-xl shadow-amber-500/20">
                        <Package size={32} />
                    </div>
                    <div>
                        <h1 className="text-3xl font-black text-primary tracking-tight uppercase font-mono">Product Insights</h1>
                        <p className="text-sm text-gray-500 font-medium">Performance metrics and return analysis</p>
                    </div>
                </div>

                <div className="flex items-center gap-3 relative z-10">
                    <div className="flex bg-gray-50 p-1.5 rounded-[1.5rem] border border-gray-100">
                        {(['7d', '30d', '90d'] as const).map((range) => (
                            <button
                                key={range}
                                onClick={() => setTimeRange(range)}
                                className={`px-6 py-2.5 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${timeRange === range
                                    ? 'bg-white text-primary shadow-lg shadow-gray-100 scale-100'
                                    : 'text-gray-400 hover:text-gray-600 hover:bg-gray-100'
                                    }`}
                            >
                                Last {range.replace('d', ' Days')}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Export Buttons */}
            <div className="flex gap-2">
                <button
                    onClick={() => handleExport('xlsx')}
                    className="flex items-center gap-2 px-4 py-2 bg-emerald-500 text-white rounded-xl text-sm font-bold hover:bg-emerald-600 transition-colors shadow-lg shadow-emerald-500/20"
                >
                    <Download size={16} />
                    Export Excel
                </button>
                <button
                    onClick={() => handleExport('csv')}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-xl text-sm font-bold hover:bg-blue-600 transition-colors shadow-lg shadow-blue-500/20"
                >
                    <Download size={16} />
                    Export CSV
                </button>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
                {/* Top Performers */}
                <div className="bg-white p-8 rounded-[2.5rem] border border-primary/5 shadow-xl shadow-gray-100/50">
                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <h3 className="text-lg font-black text-gray-800">Top Performers</h3>
                            <p className="text-xs text-gray-400 font-medium mt-1">Highest revenue generating products</p>
                        </div>
                        <div className="w-10 h-10 rounded-full bg-amber-50 flex items-center justify-center text-amber-500">
                            <Package size={20} />
                        </div>
                    </div>
                    <div className="space-y-4">
                        {productData?.topProducts.map((product, index) => (
                            <div key={product._id} className="flex items-center p-4 rounded-2xl bg-gray-50 border border-gray-100 hover:border-amber-200 transition-colors group">
                                <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center font-black text-gray-300 mr-4 shadow-sm border border-gray-100 group-hover:text-amber-500 transition-colors">#{index + 1}</div>
                                <div className="flex-1">
                                    <h4 className="font-bold text-gray-800 text-sm">{product.name}</h4>
                                    <p className="text-[10px] text-gray-400 font-mono mt-0.5">{product.skuCode || 'N/A'}</p>
                                </div>
                                <div className="text-right">
                                    <p className="font-black text-gray-800">₹{product.totalRevenue.toLocaleString()}</p>
                                    <p className="text-[10px] text-gray-500 font-medium">{product.totalSold} sold</p>
                                </div>
                            </div>
                        ))}
                        {(!productData?.topProducts || productData.topProducts.length === 0) && (
                            <div className="text-center py-10 text-gray-400 font-medium text-sm">No sales data available</div>
                        )}
                    </div>
                </div>

                {/* Return Risks */}
                <div className="bg-white p-8 rounded-[2.5rem] border border-primary/5 shadow-xl shadow-gray-100/50">
                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <h3 className="text-lg font-black text-gray-800">Return Risks</h3>
                            <p className="text-xs text-gray-400 font-medium mt-1">Products with highest return volume</p>
                        </div>
                        <div className="w-10 h-10 rounded-full bg-rose-50 flex items-center justify-center text-rose-500">
                            <AlertTriangle size={20} />
                        </div>
                    </div>
                    <div className="space-y-4">
                        {productData?.topReturns.map((product, index) => (
                            <div key={product._id} className="flex items-center p-4 rounded-2xl bg-rose-50/50 border border-rose-100 hover:bg-rose-50 transition-colors">
                                <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center font-black text-rose-300 mr-4 shadow-sm border border-rose-100">#{index + 1}</div>
                                <div className="flex-1">
                                    <h4 className="font-bold text-gray-800 text-sm">{product.name}</h4>
                                    <p className="text-[10px] text-gray-400 font-mono mt-0.5">{product.skuCode || 'N/A'}</p>
                                </div>
                                <div className="text-right">
                                    <p className="font-black text-rose-600">{product.returnCount} Returns</p>
                                    <p className="text-[10px] text-rose-400 font-medium">Investigate quality</p>
                                </div>
                            </div>
                        ))}
                        {(!productData?.topReturns || productData.topReturns.length === 0) && (
                            <div className="text-center py-10 text-gray-400 font-medium text-sm">No return data available</div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProductInsights;
