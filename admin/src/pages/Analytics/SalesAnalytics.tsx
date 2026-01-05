import React, { useEffect, useState, useCallback } from 'react';
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    AreaChart,
    Area
} from 'recharts';
import {
    TrendingUp,
    DollarSign,
    ShoppingBag,
    CreditCard,
    Download
} from 'lucide-react';
import { analyticsService } from '../../services/analyticsService';
import type { IRevenueAnalytics } from '../../services/analyticsService';
import toast from 'react-hot-toast';

const SalesAnalytics: React.FC = () => {
    const [loading, setLoading] = useState(true);
    const [revenueData, setRevenueData] = useState<IRevenueAnalytics | null>(null);
    const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d'>('30d');

    const fetchAnalytics = useCallback(async () => {
        try {
            setLoading(true);
            const endDate = new Date();
            const startDate = new Date();

            if (timeRange === '7d') startDate.setDate(endDate.getDate() - 7);
            if (timeRange === '30d') startDate.setDate(endDate.getDate() - 30);
            if (timeRange === '90d') startDate.setDate(endDate.getDate() - 90);

            const rData = await analyticsService.getSalesAnalytics(startDate, endDate);
            setRevenueData(rData);
        } catch (error) {
            console.error(error);
            toast.error('Failed to load sales analytics');
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

        const url = `/api/v1/admin/analytics/export/sales?startDate=${startDate.toISOString()}&endDate=${endDate.toISOString()}&format=${format}`;
        const token = localStorage.getItem('token');

        fetch(url, {
            headers: { Authorization: `Bearer ${token}` }
        })
            .then(res => res.blob())
            .then(blob => {
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `sales-analytics-${Date.now()}.${format}`;
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
        return <div className="p-10 flex justify-center text-primary font-bold">Loading Sales Analytics...</div>;
    }

    const KPICard = ({ title, value, icon: Icon, colorClass, borderClass, bgClass }: any) => (
        <div className={`p-6 rounded-[2rem] bg-white border-2 ${borderClass} shadow-xl shadow-gray-100/50 flex flex-col justify-between h-40 group relative overflow-hidden`}>
            <div className={`absolute top-0 right-0 w-32 h-32 ${bgClass} rounded-full -mr-16 -mt-16 blur-2xl opacity-50 group-hover:scale-110 transition-transform duration-700`} />

            <div className="flex justify-between items-start relative z-10">
                <div>
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">{title}</p>
                    <h3 className="text-3xl font-black text-gray-800 mt-2 tracking-tight">{value}</h3>
                </div>
                <div className={`w-12 h-12 rounded-2xl ${bgClass} flex items-center justify-center ${colorClass} shadow-lg`}>
                    <Icon size={24} />
                </div>
            </div>

            <div className="flex items-center gap-2 text-[10px] font-bold text-green-500 bg-green-50 w-fit px-2 py-1 rounded-lg">
                <TrendingUp size={12} />
                <span>+12.5% vs last period</span>
            </div>
        </div>
    );

    return (
        <div className="p-6 space-y-8">
            {/* Premium Hero Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-white p-8 rounded-[2.5rem] border border-primary/5 shadow-sm relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full -mr-32 -mt-32 blur-3xl group-hover:bg-primary/10 transition-colors duration-1000" />
                <div className="relative z-10 flex items-center gap-6">
                    <div className="w-16 h-16 rounded-[1.5rem] bg-emerald-500 flex items-center justify-center text-white shadow-xl shadow-emerald-500/20">
                        <DollarSign size={32} />
                    </div>
                    <div>
                        <h1 className="text-3xl font-black text-primary tracking-tight uppercase font-mono">Sales Analytics</h1>
                        <p className="text-sm text-gray-500 font-medium">Revenue monitoring and sales performance</p>
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

            {/* KPI Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <KPICard
                    title="Total Revenue"
                    value={`₹${revenueData?.revenue?.toLocaleString() || 0}`}
                    icon={DollarSign}
                    colorClass="text-emerald-600"
                    bgClass="bg-emerald-50"
                    borderClass="border-emerald-100"
                />
                <KPICard
                    title="Total Orders"
                    value={revenueData?.orders || 0}
                    icon={ShoppingBag}
                    colorClass="text-blue-600"
                    bgClass="bg-blue-50"
                    borderClass="border-blue-100"
                />
                <KPICard
                    title="Avg. Order Value"
                    value={`₹${revenueData?.aov?.toLocaleString() || 0}`}
                    icon={CreditCard}
                    colorClass="text-amber-600"
                    bgClass="bg-amber-50"
                    borderClass="border-amber-100"
                />
            </div>

            {/* Charts Grid */}
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
                {/* Revenue Chart */}
                <div className="bg-white p-8 rounded-[2.5rem] border border-primary/5 shadow-xl shadow-gray-100/50">
                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <h3 className="text-lg font-black text-gray-800">Revenue Trend</h3>
                            <p className="text-xs text-gray-400 font-medium mt-1">Daily income visualization</p>
                        </div>
                        <div className="w-10 h-10 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-500">
                            <DollarSign size={20} />
                        </div>
                    </div>
                    <div className="h-[300px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={revenueData?.timeline || []}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                                <XAxis
                                    dataKey="date"
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fill: '#9ca3af', fontSize: 10 }}
                                    tickFormatter={(value) => new Date(value).toLocaleDateString(undefined, { day: 'numeric', month: 'short' })}
                                    dy={10}
                                />
                                <YAxis
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fill: '#9ca3af', fontSize: 10 }}
                                    tickFormatter={(value) => `₹${value / 1000}k`}
                                />
                                <Tooltip
                                    cursor={{ fill: '#f9fafb' }}
                                    contentStyle={{ borderRadius: '1rem', border: 'none', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)' }}
                                />
                                <Bar
                                    dataKey="revenue"
                                    fill="#10b981"
                                    radius={[4, 4, 0, 0]}
                                    barSize={20}
                                />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Order Volume Chart */}
                <div className="bg-white p-8 rounded-[2.5rem] border border-primary/5 shadow-xl shadow-gray-100/50">
                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <h3 className="text-lg font-black text-gray-800">Order Density</h3>
                            <p className="text-xs text-gray-400 font-medium mt-1">Transaction volume over time</p>
                        </div>
                        <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-500">
                            <ShoppingBag size={20} />
                        </div>
                    </div>
                    <div className="h-[300px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={revenueData?.timeline || []}>
                                <defs>
                                    <linearGradient id="colorOrders" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.1} />
                                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                                <XAxis
                                    dataKey="date"
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fill: '#9ca3af', fontSize: 10 }}
                                    tickFormatter={(value) => new Date(value).toLocaleDateString(undefined, { day: 'numeric', month: 'short' })}
                                    dy={10}
                                />
                                <YAxis
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fill: '#9ca3af', fontSize: 10 }}
                                />
                                <Tooltip
                                    contentStyle={{ borderRadius: '1rem', border: 'none', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)' }}
                                />
                                <Area
                                    type="monotone"
                                    dataKey="orders"
                                    stroke="#3b82f6"
                                    fillOpacity={1}
                                    fill="url(#colorOrders)"
                                    strokeWidth={3}
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SalesAnalytics;
