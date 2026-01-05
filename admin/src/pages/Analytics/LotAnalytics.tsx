import React, { useEffect, useState, useCallback } from 'react';
import {
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    AreaChart,
    Area
} from 'recharts';
import {
    Package,
    AlertTriangle,
    TrendingUp,
    Calendar,
    ArrowUpRight,
    ArrowDownRight,
    Clock
} from 'lucide-react';
import { analyticsService, type ILotAnalytics } from '../../services/analyticsService';
import { DateRangeFilter, type DateRange } from '../../components/common/DateRangeFilter';
import { subDays, startOfDay, endOfDay } from 'date-fns';
import toast from 'react-hot-toast';

const LotAnalytics: React.FC = () => {
    const [loading, setLoading] = useState(true);
    const [lotData, setLotData] = useState<ILotAnalytics | null>(null);
    const [dateRange, setDateRange] = useState<DateRange>({
        startDate: startOfDay(subDays(new Date(), 30)),
        endDate: endOfDay(new Date()),
        key: '30d'
    });

    const fetchAnalytics = useCallback(async () => {
        try {
            setLoading(true);
            const data = await analyticsService.getLotAnalytics(dateRange.startDate, dateRange.endDate);
            setLotData(data);
        } catch (error) {
            console.error(error);
            toast.error('Failed to load lot intelligence');
        } finally {
            setLoading(false);
        }
    }, [dateRange]);

    useEffect(() => {
        fetchAnalytics();
    }, [fetchAnalytics]);

    const KPICard = ({ title, value, subValue, icon: Icon, colorClass, borderClass, bgClass, status }: any) => (
        <div className={`p-6 rounded-[2rem] bg-white border-2 ${borderClass} shadow-xl shadow-gray-100/50 flex flex-col justify-between h-44 group relative overflow-hidden`}>
            <div className={`absolute top-0 right-0 w-32 h-32 ${bgClass} rounded-full -mr-16 -mt-16 blur-2xl opacity-50 group-hover:scale-110 transition-transform duration-700`} />

            <div className="flex justify-between items-start relative z-10">
                <div>
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">{title}</p>
                    <h3 className="text-3xl font-black text-gray-800 mt-2 tracking-tight">{value}</h3>
                    <p className="text-xs text-gray-500 font-medium mt-1">{subValue}</p>
                </div>
                <div className={`w-12 h-12 rounded-2xl ${bgClass} flex items-center justify-center ${colorClass} shadow-lg`}>
                    <Icon size={24} />
                </div>
            </div>

            {status && (
                <div className={`flex items-center gap-2 text-[10px] font-bold ${status.color} ${status.bg} w-fit px-3 py-1.5 rounded-xl mt-4 relative z-10`}>
                    {status.icon && <status.icon size={12} />}
                    <span>{status.text}</span>
                </div>
            )}
        </div>
    );

    if (loading && !lotData) {
        return <div className="p-10 flex justify-center text-primary font-bold">Loading Lot Intelligence...</div>;
    }

    return (
        <div className="p-6 space-y-8">
            {/* Premium Hero Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-white p-8 rounded-[2.5rem] border border-primary/5 shadow-sm relative group z-40">
                {/* Decorative Background Elements */}
                <div className="absolute inset-0 overflow-hidden rounded-[2.5rem] pointer-events-none">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full -mr-32 -mt-32 blur-3xl group-hover:bg-primary/10 transition-colors duration-1000" />
                </div>

                <div className="relative z-10 flex items-center gap-6">
                    <div className="w-16 h-16 rounded-[1.5rem] bg-indigo-600 flex items-center justify-center text-white shadow-xl shadow-indigo-600/20">
                        <Package size={32} />
                    </div>
                    <div>
                        <h1 className="text-3xl font-black text-primary tracking-tight uppercase font-mono">Lot Intelligence</h1>
                        <p className="text-sm text-gray-500 font-medium">Stock health, movement analysis & expiry tracking</p>
                    </div>
                </div>

                <div className="relative z-10">
                    <DateRangeFilter onChange={setDateRange} initialRangeKey={dateRange.key} />
                </div>
            </div>

            {/* KPI Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <KPICard
                    title="Stock Value"
                    value={`₹${lotData?.stockOverview.totalValue.toLocaleString() || 0}`}
                    subValue={`${lotData?.stockOverview.totalStock.toLocaleString() || 0} items in stock`}
                    icon={TrendingUp}
                    colorClass="text-emerald-600"
                    bgClass="bg-emerald-50"
                    borderClass="border-emerald-100"
                    status={{ text: 'Inventory Value', color: 'text-emerald-500', bg: 'bg-emerald-50' }}
                />
                <KPICard
                    title="Low Stock"
                    value={lotData?.stockOverview.lowStockItems || 0}
                    subValue="Items below threshold"
                    icon={AlertTriangle}
                    colorClass="text-amber-600"
                    bgClass="bg-amber-50"
                    borderClass="border-amber-100"
                    status={{ text: 'Needs Restock', color: 'text-amber-500', bg: 'bg-amber-50', icon: Clock }}
                />
                <KPICard
                    title="Out of Stock"
                    value={lotData?.stockOverview.outOfStockItems || 0}
                    subValue="Available for re-order"
                    icon={Package}
                    colorClass="text-rose-600"
                    bgClass="bg-rose-50"
                    borderClass="border-rose-100"
                    status={{ text: 'Critical Alert', color: 'text-rose-500', bg: 'bg-rose-50', icon: AlertTriangle }}
                />
                <KPICard
                    title="Expired Items"
                    value={lotData?.expiryRisks.expired || 0}
                    subValue="Loss estimation ongoing"
                    icon={Calendar}
                    colorClass="text-gray-600"
                    bgClass="bg-gray-50"
                    borderClass="border-gray-100"
                    status={{ text: 'Removal Pending', color: 'text-gray-500', bg: 'bg-gray-50' }}
                />
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
                {/* Movement Trend */}
                <div className="xl:col-span-2 bg-white p-8 rounded-[2.5rem] border border-primary/5 shadow-xl shadow-gray-100/50">
                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <h3 className="text-lg font-black text-gray-800">Stock Movements</h3>
                            <p className="text-xs text-gray-400 font-medium mt-1">Received vs Sold units trend</p>
                        </div>
                        <div className="flex gap-4">
                            <div className="flex items-center gap-2">
                                <div className="w-3 h-3 rounded-full bg-indigo-500" />
                                <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Received</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="w-3 h-3 rounded-full bg-emerald-500" />
                                <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Sold</span>
                            </div>
                        </div>
                    </div>
                    <div className="h-[350px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={lotData?.lotMovements || []}>
                                <defs>
                                    <linearGradient id="colorReceived" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#6366f1" stopOpacity={0.1} />
                                        <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                                    </linearGradient>
                                    <linearGradient id="colorSold" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.1} />
                                        <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                                <XAxis
                                    dataKey="date"
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fill: '#9ca3af', fontSize: 10 }}
                                    tickFormatter={(val) => new Date(val).toLocaleDateString(undefined, { day: 'numeric', month: 'short' })}
                                    dy={10}
                                />
                                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#9ca3af', fontSize: 10 }} />
                                <Tooltip
                                    contentStyle={{ borderRadius: '1.5rem', border: 'none', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)' }}
                                />
                                <Area
                                    type="monotone"
                                    dataKey="received"
                                    stroke="#6366f1"
                                    fillOpacity={1}
                                    fill="url(#colorReceived)"
                                    strokeWidth={3}
                                />
                                <Area
                                    type="monotone"
                                    dataKey="sold"
                                    stroke="#10b981"
                                    fillOpacity={1}
                                    fill="url(#colorSold)"
                                    strokeWidth={3}
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Expiry Risk Alerts */}
                <div className="bg-white p-8 rounded-[2.5rem] border border-primary/5 shadow-xl shadow-gray-100/50">
                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <h3 className="text-lg font-black text-gray-800">Expiry Risk Analysis</h3>
                            <p className="text-xs text-gray-400 font-medium mt-1">Forecast for upcoming deadlines</p>
                        </div>
                        <div className="w-10 h-10 rounded-full bg-rose-50 flex items-center justify-center text-rose-500">
                            <Clock size={20} />
                        </div>
                    </div>

                    <div className="space-y-6">
                        <div className="p-5 rounded-2xl bg-rose-50 border border-rose-100 relative overflow-hidden group hover:scale-[1.02] transition-transform">
                            <div className="relative z-10">
                                <div className="flex justify-between items-center mb-2">
                                    <span className="text-rose-600 text-[10px] font-black uppercase tracking-widest">Immediate Risk</span>
                                    <ArrowUpRight size={14} className="text-rose-400" />
                                </div>
                                <div className="flex items-baseline gap-2">
                                    <h4 className="text-2xl font-black text-rose-700">{lotData?.expiryRisks.expiringNext30Days || 0}</h4>
                                    <span className="text-xs text-rose-500 font-bold uppercase">Within 30 Days</span>
                                </div>
                            </div>
                        </div>

                        <div className="p-5 rounded-2xl bg-amber-50 border border-amber-100 relative overflow-hidden group hover:scale-[1.02] transition-transform">
                            <div className="relative z-10">
                                <div className="flex justify-between items-center mb-2">
                                    <span className="text-amber-600 text-[10px] font-black uppercase tracking-widest">Moderate Risk</span>
                                    <Clock size={14} className="text-amber-400" />
                                </div>
                                <div className="flex items-baseline gap-2">
                                    <h4 className="text-2xl font-black text-amber-700">{lotData?.expiryRisks.expiringNext90Days || 0}</h4>
                                    <span className="text-xs text-amber-500 font-bold uppercase">Within 90 Days</span>
                                </div>
                            </div>
                        </div>

                        <div className="p-5 rounded-2xl bg-gray-50 border border-gray-100 relative overflow-hidden group hover:scale-[1.02] transition-transform">
                            <div className="relative z-10">
                                <div className="flex justify-between items-center mb-2">
                                    <span className="text-gray-500 text-[10px] font-black uppercase tracking-widest">Loss Incurred</span>
                                    <ArrowDownRight size={14} className="text-gray-400" />
                                </div>
                                <div className="flex items-baseline gap-2">
                                    <h4 className="text-2xl font-black text-gray-700">{lotData?.expiryRisks.expired || 0}</h4>
                                    <span className="text-xs text-gray-500 font-bold uppercase">Expired Total</span>
                                </div>
                            </div>
                        </div>

                        <div className="pt-4 border-t border-gray-100 mt-6 text-center">
                            <p className="text-[10px] text-gray-400 font-medium leading-relaxed italic">
                                * Expiry risks are calculated based on lot end dates and current inventory levels.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LotAnalytics;
