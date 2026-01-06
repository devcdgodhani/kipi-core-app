import React, { useEffect, useState, useCallback } from 'react';
import {
    Activity,
    AlertTriangle,
    Clock,
    Download,
    PieChart as PieChartIcon,
    Truck,
    TrendingDown,
    RefreshCw
} from 'lucide-react';
import {
    PieChart,
    Pie,
    Cell,
    Tooltip,
    ResponsiveContainer,
    Legend,
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid
} from 'recharts';
import { analyticsService, type ILogisticsAnalytics } from '../../services/analyticsService';
import { DateRangeFilter, type DateRange } from '../../components/common/DateRangeFilter';
import { subDays, startOfDay, endOfDay } from 'date-fns';
import toast from 'react-hot-toast';

const COLORS = ['#ef4444', '#f59e0b', '#3b82f6', '#10b981', '#8b5cf6', '#ec4899'];

const LogisticsAnalytics: React.FC = () => {
    const [loading, setLoading] = useState(true);
    const [data, setData] = useState<ILogisticsAnalytics | null>(null);
    const [dateRange, setDateRange] = useState<DateRange>({
        startDate: startOfDay(subDays(new Date(), 30)),
        endDate: endOfDay(new Date()),
        key: '30d'
    });

    const fetchAnalytics = useCallback(async () => {
        try {
            setLoading(true);
            const lData = await analyticsService.getLogisticsAnalytics(dateRange.startDate, dateRange.endDate);
            setData(lData);
        } catch (error) {
            console.error(error);
            toast.error('Failed to load logistics analytics');
        } finally {
            setLoading(false);
        }
    }, [dateRange]);

    useEffect(() => {
        fetchAnalytics();
    }, [fetchAnalytics]);

    const handleExport = (format: 'xlsx' | 'csv' = 'xlsx') => {
        analyticsService.exportData('logistics', dateRange.startDate, dateRange.endDate, format);
        toast.success(`Exporting ${format.toUpperCase()}...`);
    };

    if (loading) {
        return (
            <div className="p-10 flex flex-col items-center justify-center min-h-[60vh] space-y-4">
                <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
                <p className="text-primary font-bold animate-pulse">Analyzing Logistics Patterns...</p>
            </div>
        );
    }

    const KPICard = ({ title, value, subtitle, icon: Icon, colorClass, borderClass, bgClass }: any) => (
        <div className={`p-6 rounded-[2.5rem] bg-white border-2 ${borderClass} shadow-xl shadow-gray-100/50 flex flex-col justify-between h-44 group relative overflow-hidden transition-all duration-300 hover:scale-[1.02]`}>
            <div className={`absolute top-0 right-0 w-32 h-32 ${bgClass} rounded-full -mr-16 -mt-16 blur-2xl opacity-50 group-hover:scale-125 transition-transform duration-1000`} />

            <div className="flex justify-between items-start relative z-10">
                <div>
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">{title}</p>
                    <h3 className="text-4xl font-black text-gray-800 mt-2 tracking-tight">{value}</h3>
                </div>
                <div className={`w-14 h-14 rounded-2xl ${bgClass} flex items-center justify-center ${colorClass} shadow-lg group-hover:rotate-12 transition-transform duration-500`}>
                    <Icon size={28} />
                </div>
            </div>

            <div className="relative z-10 flex items-center gap-2 text-xs font-bold text-gray-500">
                <span>{subtitle}</span>
            </div>
        </div>
    );

    return (
        <div className="p-6 space-y-8 max-w-[1600px] mx-auto">
            {/* Premium Hero Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-white p-8 rounded-[3rem] border border-primary/5 shadow-sm relative group">
                <div className="absolute inset-0 overflow-hidden rounded-[3rem] pointer-events-none">
                    <div className="absolute top-0 right-0 w-96 h-96 bg-primary/5 rounded-full -mr-48 -mt-48 blur-3xl group-hover:bg-primary/10 transition-colors duration-1000" />
                </div>

                <div className="relative z-10 flex items-center gap-6">
                    <div className="w-20 h-20 rounded-[2rem] bg-indigo-600 flex items-center justify-center text-white shadow-2xl shadow-indigo-600/20 rotate-3 group-hover:rotate-0 transition-transform duration-500">
                        <Truck size={40} />
                    </div>
                    <div>
                        <h1 className="text-4xl font-black text-primary tracking-tight uppercase font-mono">Logistics Intel</h1>
                        <p className="text-sm text-gray-500 font-medium">Return patterns and NDR performance analysis</p>
                    </div>
                </div>

                <div className="relative z-10 flex items-center gap-4">
                    <DateRangeFilter onChange={setDateRange} initialRangeKey={dateRange.key} />
                    <div className="flex bg-gray-50 p-1.5 rounded-2xl border border-gray-100">
                        <button
                            onClick={() => handleExport('xlsx')}
                            className="p-2.5 text-gray-600 hover:text-emerald-600 hover:bg-white rounded-xl transition-all duration-300 group/btn"
                            title="Export Excel"
                        >
                            <Download size={20} />
                        </button>
                        <button
                            onClick={() => handleExport('csv')}
                            className="p-2.5 text-gray-600 hover:text-blue-600 hover:bg-white rounded-xl transition-all duration-300"
                            title="Export CSV"
                        >
                            <Activity size={20} />
                        </button>
                    </div>
                </div>
            </div>

            {/* KPI Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
                <KPICard
                    title="RTO Rate"
                    value={`${data?.rtoRate.toFixed(1)}%`}
                    subtitle={`${data?.rtoCount} Shipments Returned`}
                    icon={TrendingDown}
                    colorClass="text-red-600"
                    bgClass="bg-red-50"
                    borderClass="border-red-100"
                />
                <KPICard
                    title="NDR Incident Rate"
                    value={`${((data?.ndrCount || 0) / (data?.totalShipments || 1) * 100).toFixed(1)}%`}
                    subtitle={`${data?.ndrCount} NDR Attempts`}
                    icon={AlertTriangle}
                    colorClass="text-amber-600"
                    bgClass="bg-amber-50"
                    borderClass="border-amber-100"
                />
                <KPICard
                    title="NDR Recovery"
                    value={`${data?.ndrConversionRate.toFixed(1)}%`}
                    subtitle="Closed after successful NDR"
                    icon={RefreshCw}
                    colorClass="text-emerald-600"
                    bgClass="bg-emerald-50"
                    borderClass="border-emerald-100"
                />
                <KPICard
                    title="Avg Return Cycle"
                    value={`${data?.avgRtoAge.toFixed(1)}d`}
                    subtitle="Initiated to Restocked"
                    icon={Clock}
                    colorClass="text-indigo-600"
                    bgClass="bg-indigo-50"
                    borderClass="border-indigo-100"
                />
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* RTO Reasons Pie Chart */}
                <div className="bg-white p-10 rounded-[3rem] border border-primary/5 shadow-xl shadow-gray-100/50 relative overflow-hidden">
                    <div className="flex items-center justify-between mb-10">
                        <div>
                            <h3 className="text-2xl font-black text-gray-800">Return Origins</h3>
                            <p className="text-xs text-gray-400 font-medium mt-1 uppercase tracking-widest">Reason Distribution</p>
                        </div>
                        <div className="w-12 h-12 rounded-2xl bg-red-50 flex items-center justify-center text-red-500">
                            <PieChartIcon size={24} />
                        </div>
                    </div>

                    <div className="h-[400px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={data?.rtoReasons || []}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={80}
                                    outerRadius={140}
                                    paddingAngle={8}
                                    dataKey="count"
                                    nameKey="reason"
                                >
                                    {(data?.rtoReasons || []).map((_entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip
                                    contentStyle={{ borderRadius: '1.5rem', border: 'none', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)' }}
                                />
                                <Legend verticalAlign="bottom" height={36} />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Efficiency Bar Chart */}
                <div className="bg-white p-10 rounded-[3rem] border border-primary/5 shadow-xl shadow-gray-100/50">
                    <div className="flex items-center justify-between mb-10">
                        <div>
                            <h3 className="text-2xl font-black text-gray-800">Operational Funnel</h3>
                            <p className="text-xs text-gray-400 font-medium mt-1 uppercase tracking-widest">Volume Breakdown</p>
                        </div>
                        <div className="w-12 h-12 rounded-2xl bg-blue-50 flex items-center justify-center text-blue-500">
                            <Activity size={24} />
                        </div>
                    </div>

                    <div className="h-[400px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart
                                layout="vertical"
                                data={[
                                    { name: 'Total Shipments', value: data?.totalShipments },
                                    { name: 'NDR Occurrences', value: data?.ndrCount },
                                    { name: 'Total RTOs', value: data?.rtoCount }
                                ]}
                                margin={{ left: 40, right: 40 }}
                            >
                                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f3f4f6" />
                                <XAxis type="number" hide />
                                <YAxis
                                    dataKey="name"
                                    type="category"
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fill: '#4b5563', fontSize: 12, fontWeight: 700 }}
                                />
                                <Tooltip
                                    cursor={{ fill: 'transparent' }}
                                    contentStyle={{ borderRadius: '1rem', border: 'none', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)' }}
                                />
                                <Bar
                                    dataKey="value"
                                    fill="#6366f1"
                                    radius={[0, 20, 20, 0]}
                                    barSize={40}
                                />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LogisticsAnalytics;
