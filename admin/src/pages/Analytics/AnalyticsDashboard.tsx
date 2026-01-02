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
    Area,
    PieChart,
    Pie,
    Cell
} from 'recharts';
import {
    TrendingUp,
    DollarSign,
    ShoppingBag,
    CreditCard,
    Package,
    AlertTriangle,
    Users,
    Download,
    Receipt
} from 'lucide-react';
import { analyticsService } from '../../services/analyticsService';
import type { IRevenueAnalytics, IProductAnalytics, ICustomerAnalytics } from '../../services/analyticsService';
import toast from 'react-hot-toast';

const AnalyticsDashboard: React.FC = () => {
    const [loading, setLoading] = useState(true);
    const [revenueData, setRevenueData] = useState<IRevenueAnalytics | null>(null);
    const [productData, setProductData] = useState<IProductAnalytics | null>(null);
    const [customerData, setCustomerData] = useState<ICustomerAnalytics | null>(null);
    const [taxData, setTaxData] = useState<any>(null);
    const [activeTab, setActiveTab] = useState<'overview' | 'products' | 'customers'>('overview');
    const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d'>('30d');

    const fetchAnalytics = useCallback(async () => {
        try {
            setLoading(true);
            const endDate = new Date();
            const startDate = new Date();

            if (timeRange === '7d') startDate.setDate(endDate.getDate() - 7);
            if (timeRange === '30d') startDate.setDate(endDate.getDate() - 30);
            if (timeRange === '90d') startDate.setDate(endDate.getDate() - 90);

            const [rData, pData, cData, tData] = await Promise.all([
                analyticsService.getSalesAnalytics(startDate, endDate),
                analyticsService.getProductAnalytics(startDate, endDate),
                analyticsService.getCustomerAnalytics(startDate, endDate),
                fetch(`/api/v1/admin/analytics/tax-summary?startDate=${startDate.toISOString()}&endDate=${endDate.toISOString()}`, {
                    headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
                }).then(r => r.json()).then(d => d.data)
            ]);

            setRevenueData(rData);
            setProductData(pData);
            setCustomerData(cData);
            setTaxData(tData);
        } catch (error) {
            console.error(error);
            toast.error('Failed to load analytics data');
        } finally {
            setLoading(false);
        }
    }, [timeRange]);

    useEffect(() => {
        fetchAnalytics();
    }, [fetchAnalytics]);

    if (loading) {
        return <div className="p-10 flex justify-center text-primary font-bold">Loading Intelligence Data...</div>;
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

    const handleExport = (type: 'sales' | 'products' | 'customers', format: 'xlsx' | 'csv' = 'xlsx') => {
        const endDate = new Date();
        const startDate = new Date();
        if (timeRange === '7d') startDate.setDate(endDate.getDate() - 7);
        if (timeRange === '30d') startDate.setDate(endDate.getDate() - 30);
        if (timeRange === '90d') startDate.setDate(endDate.getDate() - 90);

        const url = `/api/v1/admin/analytics/export/${type}?startDate=${startDate.toISOString()}&endDate=${endDate.toISOString()}&format=${format}`;
        const token = localStorage.getItem('token');

        fetch(url, {
            headers: { Authorization: `Bearer ${token}` }
        })
            .then(res => res.blob())
            .then(blob => {
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `${type}-analytics-${Date.now()}.${format}`;
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

    return (
        <div className="p-6 space-y-8">
            {/* Premium Hero Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-white p-8 rounded-[2.5rem] border border-primary/5 shadow-sm relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full -mr-32 -mt-32 blur-3xl group-hover:bg-primary/10 transition-colors duration-1000" />
                <div className="relative z-10 flex items-center gap-6">
                    <div className="w-16 h-16 rounded-[1.5rem] bg-indigo-500 flex items-center justify-center text-white shadow-xl shadow-indigo-500/20">
                        <TrendingUp size={32} />
                    </div>
                    <div>
                        <h1 className="text-3xl font-black text-primary tracking-tight uppercase font-mono">Sales Intelligence</h1>
                        <p className="text-sm text-gray-500 font-medium">Real-time revenue monitoring and financial insights</p>
                    </div>
                </div>

                <div className="flex bg-gray-50 p-1.5 rounded-[1.5rem] border border-gray-100 relative z-10">
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

            <div className="flex bg-white p-1 rounded-2xl w-fit shadow-sm border border-gray-100 mb-6">
                <button
                    onClick={() => setActiveTab('overview')}
                    className={`px-6 py-2.5 rounded-xl text-sm font-bold transition-all ${activeTab === 'overview' ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'text-gray-500 hover:bg-gray-50'
                        }`}
                >
                    Sales Overview
                </button>
                <button
                    onClick={() => setActiveTab('products')}
                    className={`px-6 py-2.5 rounded-xl text-sm font-bold transition-all ${activeTab === 'products' ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'text-gray-500 hover:bg-gray-50'
                        }`}
                >
                    Product Insights
                </button>
                <button
                    onClick={() => setActiveTab('customers')}
                    className={`px-6 py-2.5 rounded-xl text-sm font-bold transition-all ${activeTab === 'customers' ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'text-gray-500 hover:bg-gray-50'
                        }`}
                >
                    Customer Insights
                </button>
            </div>

            {/* Export Button */}
            <div className="flex gap-2">
                <button
                    onClick={() => handleExport(activeTab === 'overview' ? 'sales' : activeTab, 'xlsx')}
                    className="flex items-center gap-2 px-4 py-2 bg-emerald-500 text-white rounded-xl text-sm font-bold hover:bg-emerald-600 transition-colors shadow-lg shadow-emerald-500/20"
                >
                    <Download size={16} />
                    Export Excel
                </button>
                <button
                    onClick={() => handleExport(activeTab === 'overview' ? 'sales' : activeTab, 'csv')}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-xl text-sm font-bold hover:bg-blue-600 transition-colors shadow-lg shadow-blue-500/20"
                >
                    <Download size={16} />
                    Export CSV
                </button>
            </div>

            {activeTab === 'customers' && (
                <div className="space-y-8">
                    {/* Acquisition Strategies */}
                    <div className="bg-white p-8 rounded-[2.5rem] border border-primary/5 shadow-xl shadow-gray-100/50">
                        <div className="flex items-center justify-between mb-8">
                            <div>
                                <h3 className="text-lg font-black text-gray-800">Acquisition vs Retention</h3>
                                <p className="text-xs text-gray-400 font-medium mt-1">Revenue split by customer segment</p>
                            </div>
                            <div className="w-10 h-10 rounded-full bg-purple-50 flex items-center justify-center text-purple-500">
                                <Users size={20} />
                            </div>
                        </div>
                        <div className="flex flex-col md:flex-row items-center justify-around">
                            <div className="h-[250px] w-[250px] relative">
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie
                                            data={[
                                                { name: 'New Customers', value: customerData?.acquisition.newCustomers.revenue || 0 },
                                                { name: 'Returning', value: customerData?.acquisition.returningCustomers.revenue || 0 },
                                            ]}
                                            cx="50%"
                                            cy="50%"
                                            innerRadius={60}
                                            outerRadius={80}
                                            paddingAngle={5}
                                            dataKey="value"
                                        >
                                            <Cell fill="#8b5cf6" />
                                            <Cell fill="#10b981" />
                                        </Pie>
                                        <Tooltip
                                            formatter={(value: number) => `₹${value.toLocaleString()}`}
                                            contentStyle={{ borderRadius: '1rem', border: 'none', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)' }}
                                        />
                                    </PieChart>
                                </ResponsiveContainer>
                                <div className="absolute inset-0 flex items-center justify-center flex-col">
                                    <span className="text-xs text-gray-400 font-medium uppercase tracking-widest">Total</span>
                                    <span className="text-xl font-black text-gray-800">₹{((customerData?.acquisition.newCustomers.revenue || 0) + (customerData?.acquisition.returningCustomers.revenue || 0)).toLocaleString()}</span>
                                </div>
                            </div>
                            <div className="space-y-6">
                                <div className="flex items-center gap-4">
                                    <div className="w-3 h-3 rounded-full bg-purple-500" />
                                    <div>
                                        <p className="text-sm font-bold text-gray-800">New Customers</p>
                                        <div className="flex gap-4 text-xs mt-1">
                                            <span className="text-gray-500">Revenue: <strong className="text-gray-900">₹{customerData?.acquisition.newCustomers.revenue.toLocaleString()}</strong></span>
                                            <span className="text-gray-500">Count: <strong className="text-gray-900">{customerData?.acquisition.newCustomers.count}</strong></span>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-4">
                                    <div className="w-3 h-3 rounded-full bg-emerald-500" />
                                    <div>
                                        <p className="text-sm font-bold text-gray-800">Returning Customers</p>
                                        <div className="flex gap-4 text-xs mt-1">
                                            <span className="text-gray-500">Revenue: <strong className="text-gray-900">₹{customerData?.acquisition.returningCustomers.revenue.toLocaleString()}</strong></span>
                                            <span className="text-gray-500">Count: <strong className="text-gray-900">{customerData?.acquisition.returningCustomers.count}</strong></span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
                        {/* Platinum Users */}
                        <div className="bg-white p-8 rounded-[2.5rem] border border-primary/5 shadow-xl shadow-gray-100/50">
                            <div className="flex items-center justify-between mb-8">
                                <div>
                                    <h3 className="text-lg font-black text-gray-800">Platinum Users</h3>
                                    <p className="text-xs text-gray-400 font-medium mt-1">Top spenders by lifetime value</p>
                                </div>
                                <div className="w-10 h-10 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-500">
                                    <Users size={20} />
                                </div>
                            </div>
                            <div className="space-y-4">
                                {customerData?.topSpenders.map((user, index) => (
                                    <div key={user._id} className="flex items-center p-4 rounded-2xl bg-gray-50 border border-gray-100 hover:border-indigo-200 transition-colors group">
                                        <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center font-black text-indigo-300 mr-4 shadow-sm border border-gray-100 group-hover:text-indigo-500 transition-colors">#{index + 1}</div>
                                        <div className="flex-1">
                                            <h4 className="font-bold text-gray-800 text-sm">{user.name}</h4>
                                            <p className="text-[10px] text-gray-400 font-mono mt-0.5">{user.email}</p>
                                        </div>
                                        <div className="text-right">
                                            <p className="font-black text-gray-800">₹{user.totalSpend.toLocaleString()}</p>
                                            <p className="text-[10px] text-gray-500 font-medium">{user.orderCount} orders</p>
                                        </div>
                                    </div>
                                ))}
                                {(!customerData?.topSpenders || customerData.topSpenders.length === 0) && (
                                    <div className="text-center py-10 text-gray-400 font-medium text-sm">No data available</div>
                                )}
                            </div>
                        </div>

                        {/* Churn Risk */}
                        <div className="bg-white p-8 rounded-[2.5rem] border border-primary/5 shadow-xl shadow-gray-100/50">
                            <div className="flex items-center justify-between mb-8">
                                <div>
                                    <h3 className="text-lg font-black text-gray-800">Retention Alert</h3>
                                    <p className="text-xs text-gray-400 font-medium mt-1">High-value users at risk of churning</p>
                                </div>
                                <div className="w-10 h-10 rounded-full bg-red-50 flex items-center justify-center text-red-500">
                                    <AlertTriangle size={20} />
                                </div>
                            </div>
                            <div className="space-y-4">
                                {customerData?.churnRisk.map((user, index) => (
                                    <div key={user._id} className="flex items-center p-4 rounded-2xl bg-red-50/50 border border-red-100 hover:bg-red-50 transition-colors">
                                        <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center font-black text-red-300 mr-4 shadow-sm border border-red-100">!</div>
                                        <div className="flex-1">
                                            <h4 className="font-bold text-gray-800 text-sm">{user.name}</h4>
                                            <p className="text-[10px] text-red-400 font-mono mt-0.5">Last ordered: {new Date(user.lastOrderDate).toLocaleDateString()}</p>
                                        </div>
                                        <div className="text-right">
                                            <p className="font-black text-gray-800">₹{user.totalSpend.toLocaleString()}</p>
                                            <p className="text-[10px] text-gray-500 font-medium">LTV</p>
                                        </div>
                                    </div>
                                ))}
                                {(!customerData?.churnRisk || customerData.churnRisk.length === 0) && (
                                    <div className="text-center py-10 text-gray-400 font-medium text-sm">No at-risk users found</div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {activeTab === 'overview' ? (
                <>
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

                    {/* Tax Summary Card */}
                    <div className="bg-white p-8 rounded-[2.5rem] border border-primary/5 shadow-xl shadow-gray-100/50">
                        <div className="flex items-center justify-between mb-6">
                            <div>
                                <h3 className="text-lg font-black text-gray-800">Tax Summary</h3>
                                <p className="text-xs text-gray-400 font-medium mt-1">GST collection overview</p>
                            </div>
                            <div className="w-10 h-10 rounded-full bg-purple-50 flex items-center justify-center text-purple-500">
                                <Receipt size={20} />
                            </div>
                        </div>
                        <div className="space-y-4">
                            <div className="flex justify-between items-center p-4 bg-gray-50 rounded-xl">
                                <span className="text-sm font-medium text-gray-600">Total Revenue</span>
                                <span className="text-lg font-black text-gray-800">₹{taxData?.totalRevenue?.toLocaleString() || 0}</span>
                            </div>
                            <div className="flex justify-between items-center p-4 bg-purple-50 rounded-xl">
                                <span className="text-sm font-medium text-purple-600">Tax Collected ({taxData?.taxRate || 18}%)</span>
                                <span className="text-lg font-black text-purple-600">₹{taxData?.taxCollected?.toLocaleString() || 0}</span>
                            </div>
                            <div className="flex justify-between items-center p-4 bg-emerald-50 rounded-xl">
                                <span className="text-sm font-medium text-emerald-600">Net Revenue</span>
                                <span className="text-lg font-black text-emerald-600">₹{taxData?.netRevenue?.toLocaleString() || 0}</span>
                            </div>
                        </div>
                    </div>
                </>
            ) : null}

            {activeTab === 'products' ? (
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
            ) : null}
        </div>
    );
};

export default AnalyticsDashboard;
