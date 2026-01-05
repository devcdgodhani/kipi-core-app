import React, { useEffect, useState } from 'react';
import {
    DollarSign,
    ShoppingBag,
    Users,
    Package,
    TrendingUp,
    AlertTriangle,
    ArrowRight,
    BarChart3
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { analyticsService } from '../../services/analyticsService';
import toast from 'react-hot-toast';

const Dashboard: React.FC = () => {
    const [loading, setLoading] = useState(true);
    const [dashboardData, setDashboardData] = useState<any>(null);

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const fetchDashboardData = async () => {
        try {
            setLoading(true);
            const endDate = new Date();
            const startDate = new Date();
            startDate.setDate(endDate.getDate() - 30);

            // Fetch all analytics data
            const [salesData, productData, customerData] = await Promise.all([
                analyticsService.getSalesAnalytics(startDate, endDate),
                analyticsService.getProductAnalytics(startDate, endDate),
                analyticsService.getCustomerAnalytics(startDate, endDate)
            ]);

            setDashboardData({
                sales: salesData,
                products: productData,
                customers: customerData
            });
        } catch (error) {
            console.error(error);
            toast.error('Failed to load dashboard data');
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="p-10 flex justify-center items-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                    <p className="text-gray-500 font-medium">Loading Dashboard...</p>
                </div>
            </div>
        );
    }

    const KPICard = ({ title, value, subtitle, icon: Icon, colorClass, bgClass, borderClass, link }: any) => (
        <Link to={link} className="block group">
            <div className={`p-6 rounded-[2rem] bg-white border-2 ${borderClass} shadow-xl shadow-gray-100/50 flex flex-col justify-between h-40 relative overflow-hidden transition-all duration-300 hover:shadow-2xl hover:scale-[1.02]`}>
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

                <div className="flex items-center justify-between">
                    <p className="text-xs text-gray-500 font-medium">{subtitle}</p>
                    <ArrowRight size={16} className="text-gray-400 group-hover:text-primary transition-colors" />
                </div>
            </div>
        </Link>
    );

    return (
        <div className="p-6 space-y-8">
            {/* Hero Header */}
            <div className="bg-gradient-to-r from-primary/10 via-primary/5 to-transparent p-8 rounded-[2.5rem] border border-primary/10 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full -mr-32 -mt-32 blur-3xl" />
                <div className="relative z-10">
                    <h1 className="text-4xl font-black text-gray-900 tracking-tight mb-2">Dashboard Overview</h1>
                    <p className="text-gray-600 font-medium">Welcome back! Here's what's happening with your business today.</p>
                </div>
            </div>

            {/* KPI Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
                <KPICard
                    title="Total Revenue"
                    value={`₹${dashboardData?.sales?.revenue?.toLocaleString() || 0}`}
                    subtitle="Last 30 days"
                    icon={DollarSign}
                    colorClass="text-emerald-600"
                    bgClass="bg-emerald-50"
                    borderClass="border-emerald-100"
                    link="/intelligence/sales"
                />
                <KPICard
                    title="Total Orders"
                    value={dashboardData?.sales?.orders || 0}
                    subtitle="Last 30 days"
                    icon={ShoppingBag}
                    colorClass="text-blue-600"
                    bgClass="bg-blue-50"
                    borderClass="border-blue-100"
                    link="/orders"
                />
                <KPICard
                    title="Avg Order Value"
                    value={`₹${dashboardData?.sales?.aov?.toLocaleString() || 0}`}
                    subtitle="Per transaction"
                    icon={TrendingUp}
                    colorClass="text-amber-600"
                    bgClass="bg-amber-50"
                    borderClass="border-amber-100"
                    link="/intelligence/sales"
                />
                <KPICard
                    title="Active Customers"
                    value={dashboardData?.customers?.acquisition?.newCustomers?.count + dashboardData?.customers?.acquisition?.returningCustomers?.count || 0}
                    subtitle="Last 30 days"
                    icon={Users}
                    colorClass="text-purple-600"
                    bgClass="bg-purple-50"
                    borderClass="border-purple-100"
                    link="/intelligence/customers"
                />
            </div>

            {/* Quick Insights Grid */}
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
                {/* Top Products */}
                <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-xl shadow-gray-100/50">
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h3 className="text-lg font-black text-gray-800">Top Performers</h3>
                            <p className="text-xs text-gray-400 font-medium mt-1">Best selling products</p>
                        </div>
                        <Link to="/intelligence/products" className="text-primary hover:text-primary/80 transition-colors">
                            <div className="flex items-center gap-2 text-sm font-bold">
                                <span>View All</span>
                                <ArrowRight size={16} />
                            </div>
                        </Link>
                    </div>
                    <div className="space-y-3">
                        {dashboardData?.products?.topProducts?.slice(0, 5).map((product: any, index: number) => (
                            <div key={product._id} className="flex items-center p-3 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors">
                                <div className="w-6 h-6 rounded-full bg-amber-100 flex items-center justify-center font-black text-amber-600 text-xs mr-3">
                                    {index + 1}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h4 className="font-bold text-gray-800 text-sm truncate">{product.name}</h4>
                                    <p className="text-[10px] text-gray-400 font-mono">{product.skuCode || 'N/A'}</p>
                                </div>
                                <div className="text-right ml-4">
                                    <p className="font-black text-gray-800 text-sm">₹{product.totalRevenue.toLocaleString()}</p>
                                    <p className="text-[10px] text-gray-500">{product.totalSold} sold</p>
                                </div>
                            </div>
                        ))}
                        {(!dashboardData?.products?.topProducts || dashboardData.products.topProducts.length === 0) && (
                            <div className="text-center py-8 text-gray-400 text-sm">No sales data available</div>
                        )}
                    </div>
                </div>

                {/* Alerts & Warnings */}
                <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-xl shadow-gray-100/50">
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h3 className="text-lg font-black text-gray-800">Attention Required</h3>
                            <p className="text-xs text-gray-400 font-medium mt-1">Items needing your review</p>
                        </div>
                        <div className="w-10 h-10 rounded-full bg-red-50 flex items-center justify-center text-red-500">
                            <AlertTriangle size={20} />
                        </div>
                    </div>
                    <div className="space-y-4">
                        {/* Churn Risk Alert */}
                        {dashboardData?.customers?.churnRisk?.length > 0 && (
                            <Link to="/intelligence/customers" className="block p-4 rounded-xl bg-red-50 border border-red-100 hover:bg-red-100 transition-colors">
                                <div className="flex items-start gap-3">
                                    <div className="w-8 h-8 rounded-lg bg-red-500 flex items-center justify-center text-white flex-shrink-0">
                                        <Users size={16} />
                                    </div>
                                    <div className="flex-1">
                                        <h4 className="font-bold text-gray-800 text-sm">Churn Risk Detected</h4>
                                        <p className="text-xs text-gray-600 mt-1">{dashboardData.customers.churnRisk.length} high-value customers haven't ordered recently</p>
                                    </div>
                                    <ArrowRight size={16} className="text-red-400 mt-1" />
                                </div>
                            </Link>
                        )}

                        {/* Return Risk Alert */}
                        {dashboardData?.products?.topReturns?.length > 0 && (
                            <Link to="/intelligence/products" className="block p-4 rounded-xl bg-amber-50 border border-amber-100 hover:bg-amber-100 transition-colors">
                                <div className="flex items-start gap-3">
                                    <div className="w-8 h-8 rounded-lg bg-amber-500 flex items-center justify-center text-white flex-shrink-0">
                                        <Package size={16} />
                                    </div>
                                    <div className="flex-1">
                                        <h4 className="font-bold text-gray-800 text-sm">High Return Rate</h4>
                                        <p className="text-xs text-gray-600 mt-1">{dashboardData.products.topReturns.length} products with elevated return volume</p>
                                    </div>
                                    <ArrowRight size={16} className="text-amber-400 mt-1" />
                                </div>
                            </Link>
                        )}

                        {/* No Alerts */}
                        {(!dashboardData?.customers?.churnRisk || dashboardData.customers.churnRisk.length === 0) &&
                            (!dashboardData?.products?.topReturns || dashboardData.products.topReturns.length === 0) && (
                                <div className="text-center py-8">
                                    <div className="w-12 h-12 rounded-full bg-green-50 flex items-center justify-center mx-auto mb-3">
                                        <TrendingUp size={24} className="text-green-500" />
                                    </div>
                                    <p className="text-sm font-bold text-gray-800">All Clear!</p>
                                    <p className="text-xs text-gray-500 mt-1">No critical issues detected</p>
                                </div>
                            )}
                    </div>
                </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-xl shadow-gray-100/50">
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h3 className="text-lg font-black text-gray-800">Quick Actions</h3>
                        <p className="text-xs text-gray-400 font-medium mt-1">Navigate to key sections</p>
                    </div>
                    <BarChart3 size={20} className="text-gray-400" />
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <Link to="/intelligence/sales" className="p-4 rounded-xl bg-emerald-50 border border-emerald-100 hover:bg-emerald-100 transition-colors group">
                        <DollarSign size={24} className="text-emerald-600 mb-2" />
                        <p className="font-bold text-gray-800 text-sm">Sales Analytics</p>
                        <p className="text-xs text-gray-500 mt-1">View revenue trends</p>
                    </Link>
                    <Link to="/orders" className="p-4 rounded-xl bg-blue-50 border border-blue-100 hover:bg-blue-100 transition-colors group">
                        <ShoppingBag size={24} className="text-blue-600 mb-2" />
                        <p className="font-bold text-gray-800 text-sm">Manage Orders</p>
                        <p className="text-xs text-gray-500 mt-1">Process fulfillment</p>
                    </Link>
                    <Link to="/products" className="p-4 rounded-xl bg-amber-50 border border-amber-100 hover:bg-amber-100 transition-colors group">
                        <Package size={24} className="text-amber-600 mb-2" />
                        <p className="font-bold text-gray-800 text-sm">Product Catalog</p>
                        <p className="text-xs text-gray-500 mt-1">Manage inventory</p>
                    </Link>
                    <Link to="/intelligence/financial" className="p-4 rounded-xl bg-purple-50 border border-purple-100 hover:bg-purple-100 transition-colors group">
                        <BarChart3 size={24} className="text-purple-600 mb-2" />
                        <p className="font-bold text-gray-800 text-sm">Reports</p>
                        <p className="text-xs text-gray-500 mt-1">Export & analyze</p>
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
