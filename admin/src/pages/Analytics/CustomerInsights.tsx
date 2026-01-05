import React, { useEffect, useState, useCallback } from 'react';
import {
    PieChart,
    Pie,
    Cell,
    Tooltip,
    ResponsiveContainer
} from 'recharts';
import {
    Users,
    AlertTriangle,
    Download,
    TrendingUp
} from 'lucide-react';
import { analyticsService } from '../../services/analyticsService';
import type { ICustomerAnalytics } from '../../services/analyticsService';
import toast from 'react-hot-toast';

const CustomerInsights: React.FC = () => {
    const [loading, setLoading] = useState(true);
    const [customerData, setCustomerData] = useState<ICustomerAnalytics | null>(null);
    const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d'>('30d');

    const fetchAnalytics = useCallback(async () => {
        try {
            setLoading(true);
            const endDate = new Date();
            const startDate = new Date();

            if (timeRange === '7d') startDate.setDate(endDate.getDate() - 7);
            if (timeRange === '30d') startDate.setDate(endDate.getDate() - 30);
            if (timeRange === '90d') startDate.setDate(endDate.getDate() - 90);

            const cData = await analyticsService.getCustomerAnalytics(startDate, endDate);
            setCustomerData(cData);
        } catch (error) {
            console.error(error);
            toast.error('Failed to load customer analytics');
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

        const url = `/api/v1/admin/analytics/export/customers?startDate=${startDate.toISOString()}&endDate=${endDate.toISOString()}&format=${format}`;
        const token = localStorage.getItem('token');

        fetch(url, {
            headers: { Authorization: `Bearer ${token}` }
        })
            .then(res => res.blob())
            .then(blob => {
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `customer-analytics-${Date.now()}.${format}`;
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
        return <div className="p-10 flex justify-center text-primary font-bold">Loading Customer Insights...</div>;
    }

    return (
        <div className="p-6 space-y-8">
            {/* Premium Hero Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-white p-8 rounded-[2.5rem] border border-primary/5 shadow-sm relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full -mr-32 -mt-32 blur-3xl group-hover:bg-primary/10 transition-colors duration-1000" />
                <div className="relative z-10 flex items-center gap-6">
                    <div className="w-16 h-16 rounded-[1.5rem] bg-purple-500 flex items-center justify-center text-white shadow-xl shadow-purple-500/20">
                        <Users size={32} />
                    </div>
                    <div>
                        <h1 className="text-3xl font-black text-primary tracking-tight uppercase font-mono">Customer Insights</h1>
                        <p className="text-sm text-gray-500 font-medium">Behavior analysis and retention metrics</p>
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
                            {customerData?.churnRisk.map((user) => (
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
        </div>
    );
};

export default CustomerInsights;
