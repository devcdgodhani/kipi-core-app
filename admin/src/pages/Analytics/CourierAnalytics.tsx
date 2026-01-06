import React, { useEffect, useState, useCallback } from 'react';
import {
    Activity,
    Award,
    Download,
    Layers,
    ShieldCheck,
    Zap
} from 'lucide-react';
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Cell
} from 'recharts';
import { analyticsService, type ICourierPerformance } from '../../services/analyticsService';
import { DateRangeFilter, type DateRange } from '../../components/common/DateRangeFilter';
import { subDays, startOfDay, endOfDay } from 'date-fns';
import toast from 'react-hot-toast';

const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

const CourierAnalytics: React.FC = () => {
    const [loading, setLoading] = useState(true);
    const [data, setData] = useState<ICourierPerformance[]>([]);
    const [dateRange, setDateRange] = useState<DateRange>({
        startDate: startOfDay(subDays(new Date(), 30)),
        endDate: endOfDay(new Date()),
        key: '30d'
    });

    const fetchAnalytics = useCallback(async () => {
        try {
            setLoading(true);
            const cData = await analyticsService.getCourierPerformance(dateRange.startDate, dateRange.endDate);
            setData(cData);
        } catch (error) {
            console.error(error);
            toast.error('Failed to load courier performance analytics');
        } finally {
            setLoading(false);
        }
    }, [dateRange]);

    useEffect(() => {
        fetchAnalytics();
    }, [fetchAnalytics]);

    const handleExport = (format: 'xlsx' | 'csv' = 'xlsx') => {
        analyticsService.exportData('couriers', dateRange.startDate, dateRange.endDate, format);
        toast.success(`Exporting ${format.toUpperCase()}...`);
    };

    if (loading) {
        return (
            <div className="p-10 flex flex-col items-center justify-center min-h-[60vh] space-y-4">
                <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
                <p className="text-primary font-bold animate-pulse">Benchmarking Logistics Providers...</p>
            </div>
        );
    }

    const bestPerformer = [...data].sort((a, b) => b.slaAdherence - a.slaAdherence)[0];
    const fastestProvider = [...data].sort((a, b) => a.avgDeliveryTime - b.avgDeliveryTime)[0];

    const PerformanceCard = ({ title, value, provider, icon: Icon, colorClass, bgClass }: any) => (
        <div className="p-1 bg-white rounded-[2.5rem] shadow-xl shadow-gray-100/50 border border-primary/5 group transition-all duration-300 hover:shadow-2xl">
            <div className={`p-6 rounded-[2.2rem] ${bgClass} h-full flex flex-col justify-between`}>
                <div className="flex justify-between items-start">
                    <div className={`w-12 h-12 rounded-2xl bg-white flex items-center justify-center ${colorClass} shadow-sm group-hover:scale-110 transition-transform`}>
                        <Icon size={24} />
                    </div>
                    <div className="bg-white/50 backdrop-blur-sm px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest text-gray-500">
                        Top Ranking
                    </div>
                </div>
                <div className="mt-8">
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">{title}</p>
                    <div className="flex items-baseline gap-2 mt-1">
                        <h3 className="text-3xl font-black text-gray-800 tracking-tight">{value}</h3>
                        <span className="text-xs font-bold text-gray-500">Avg.</span>
                    </div>
                    <p className="text-sm font-bold text-gray-600 mt-2 truncate">
                        <span className="text-primary opacity-50 mr-1">via</span> {provider}
                    </p>
                </div>
            </div>
        </div>
    );

    return (
        <div className="p-6 space-y-8 max-w-[1600px] mx-auto">
            {/* Premium Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-white p-8 rounded-[3rem] border border-primary/5 shadow-sm relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-80 h-80 bg-emerald-500/5 rounded-full -mr-40 -mt-40 blur-3xl group-hover:bg-emerald-500/10 transition-colors duration-1000" />

                <div className="relative z-10 flex items-center gap-6">
                    <div className="w-20 h-20 rounded-[2rem] bg-emerald-500 flex items-center justify-center text-white shadow-2xl shadow-emerald-500/20 -rotate-3 group-hover:rotate-0 transition-transform duration-500">
                        <Award size={40} />
                    </div>
                    <div>
                        <h1 className="text-4xl font-black text-primary tracking-tight uppercase font-mono">Courier Benchmarking</h1>
                        <p className="text-sm text-gray-500 font-medium">Provider performance and SLA adherence scoring</p>
                    </div>
                </div>

                <div className="relative z-10 flex items-center gap-4">
                    <DateRangeFilter onChange={setDateRange} initialRangeKey={dateRange.key} />
                    <button
                        onClick={() => handleExport('xlsx')}
                        className="flex items-center gap-2 px-6 py-3.5 bg-gray-900 text-white rounded-[1.25rem] text-sm font-black uppercase tracking-widest hover:bg-black transition-all shadow-xl shadow-gray-200"
                    >
                        <Download size={18} />
                        Report
                    </button>
                </div>
            </div>

            {/* Top Performers Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <PerformanceCard
                    title="Best SLA Adherence"
                    value={`${bestPerformer?.slaAdherence.toFixed(1)}%`}
                    provider={bestPerformer?.courierName || 'N/A'}
                    icon={ShieldCheck}
                    colorClass="text-emerald-600"
                    bgClass="bg-emerald-50/50"
                />
                <PerformanceCard
                    title="Fastest Delivery"
                    value={`${fastestProvider?.avgDeliveryTime.toFixed(1)}d`}
                    provider={fastestProvider?.courierName || 'N/A'}
                    icon={Zap}
                    colorClass="text-amber-600"
                    bgClass="bg-amber-50/50"
                />
                <PerformanceCard
                    title="Highest Throughput"
                    value={data.reduce((acc, curr) => acc + curr.totalShipments, 0)}
                    provider="Aggregate Logistics"
                    icon={Layers}
                    colorClass="text-blue-600"
                    bgClass="bg-blue-50/50"
                />
            </div>

            {/* Performance Matrix Chart */}
            <div className="bg-white p-10 rounded-[3rem] border border-primary/5 shadow-xl shadow-gray-100/50">
                <div className="flex items-center justify-between mb-12">
                    <div>
                        <h3 className="text-2xl font-black text-gray-800 uppercase tracking-tight">Performance Matrix</h3>
                        <p className="text-xs text-gray-400 font-bold mt-1 uppercase tracking-[0.2em]">Efficiency comparison by Provider</p>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="flex items-center gap-2 px-4 py-2 bg-indigo-50 rounded-xl">
                            <div className="w-3 h-3 rounded-full bg-indigo-500 shadow-sm shadow-indigo-200" />
                            <span className="text-[10px] font-black text-indigo-700 uppercase tracking-widest">SLA %</span>
                        </div>
                    </div>
                </div>

                <div className="h-[500px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                            <XAxis
                                dataKey="courierName"
                                axisLine={false}
                                tickLine={false}
                                tick={{ fill: '#4b5563', fontSize: 10, fontWeight: 800 }}
                                interval={0}
                                angle={-45}
                                textAnchor="end"
                                dy={20}
                            />
                            <YAxis
                                axisLine={false}
                                tickLine={false}
                                tick={{ fill: '#9ca3af', fontSize: 10 }}
                                label={{ value: 'SLA Adherence %', angle: -90, position: 'insideLeft', style: { fill: '#9ca3af', fontSize: 10, fontWeight: 700 } }}
                            />
                            <Tooltip
                                cursor={{ fill: '#f9fafb' }}
                                contentStyle={{ borderRadius: '1.5rem', border: 'none', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)', padding: '1.5rem' }}
                                itemStyle={{ fontWeight: 800, fontSize: '13px' }}
                            />
                            <Bar
                                dataKey="slaAdherence"
                                radius={[12, 12, 0, 0]}
                                barSize={40}
                            >
                                {data.map((_entry, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Detailed Stats Table */}
            <div className="bg-white rounded-[3rem] border border-primary/5 shadow-xl shadow-gray-100/50 overflow-hidden">
                <div className="p-10 border-b border-gray-50 flex items-center justify-between">
                    <h3 className="text-xl font-black text-gray-800 uppercase tracking-tight">Granular Benchmarks</h3>
                    <div className="w-12 h-12 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-500 shadow-sm">
                        <Activity size={24} />
                    </div>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="bg-gray-50/50">
                                <th className="px-8 py-6 text-left text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Provider</th>
                                <th className="px-8 py-6 text-left text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Volume</th>
                                <th className="px-8 py-6 text-left text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">RTO Rate</th>
                                <th className="px-8 py-6 text-left text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">NDR Rate</th>
                                <th className="px-8 py-6 text-left text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Avg Delivery</th>
                                <th className="px-8 py-6 text-left text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">SLA Adherence</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {data.map((courier) => (
                                <tr key={courier.courierId} className="hover:bg-gray-50/30 transition-colors">
                                    <td className="px-8 py-6">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600 font-black text-xs">
                                                {courier.courierName.substring(0, 2).toUpperCase()}
                                            </div>
                                            <span className="text-sm font-black text-gray-700">{courier.courierName}</span>
                                        </div>
                                    </td>
                                    <td className="px-8 py-6 text-sm font-bold text-gray-600">{courier.totalShipments}</td>
                                    <td className="px-8 py-6">
                                        <div className="flex items-center gap-2">
                                            <span className={`text-sm font-black ${courier.rtoRate > 15 ? 'text-red-500' : 'text-emerald-500'}`}>
                                                {courier.rtoRate.toFixed(1)}%
                                            </span>
                                        </div>
                                    </td>
                                    <td className="px-8 py-6 text-sm font-bold text-gray-600">{courier.ndrRate.toFixed(1)}%</td>
                                    <td className="px-8 py-6 text-sm font-bold text-gray-600">{courier.avgDeliveryTime.toFixed(1)} days</td>
                                    <td className="px-8 py-6">
                                        <div className="flex items-center gap-3">
                                            <div className="flex-1 h-2 bg-gray-100 rounded-full max-w-[80px] overflow-hidden">
                                                <div
                                                    className={`h-full rounded-full ${courier.slaAdherence > 90 ? 'bg-emerald-500' : courier.slaAdherence > 70 ? 'bg-amber-500' : 'bg-red-500'}`}
                                                    style={{ width: `${courier.slaAdherence}%` }}
                                                />
                                            </div>
                                            <span className="text-sm font-black text-gray-700">{courier.slaAdherence.toFixed(1)}%</span>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default CourierAnalytics;
