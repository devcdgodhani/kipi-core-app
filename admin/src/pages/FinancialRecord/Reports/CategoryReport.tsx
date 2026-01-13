import React, { useEffect, useState } from 'react';
import {
    PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend
} from 'recharts';
import { PieChart as PieChartIcon, TrendingUp } from 'lucide-react';
import { financialRecordService } from '../../../services/financialRecord.service';
import { DateRangeFilter, type DateRange } from '../../../components/common/DateRangeFilter';
import { subMonths, startOfDay, endOfDay } from 'date-fns';

const CategoryReport: React.FC = () => {
    const [loading, setLoading] = useState(false);
    const [data, setData] = useState<any>(null);
    const [dateRange, setDateRange] = useState<DateRange>({
        startDate: startOfDay(subMonths(new Date(), 1)),
        endDate: endOfDay(new Date()),
        key: '30d'
    });

    useEffect(() => {
        fetchReport();
    }, [dateRange]);

    const fetchReport = async () => {
        setLoading(true);
        try {
            const response = await financialRecordService.getReports('TYPE_BREAKDOWN', dateRange.startDate, dateRange.endDate);
            setData(response.data);
        } catch (error) {
            console.error("Failed to fetch report", error);
        } finally {
            setLoading(false);
        }
    };

    const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];

    return (
        <div className="p-6 space-y-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm">
                <div className="flex items-center gap-6">
                    <div className="w-16 h-16 rounded-[1.5rem] bg-orange-500 flex items-center justify-center text-white shadow-xl shadow-orange-500/20">
                        <PieChartIcon size={32} />
                    </div>
                    <div>
                        <h1 className="text-3xl font-black text-gray-900 uppercase tracking-tight">Category Breakdown</h1>
                        <p className="text-sm text-gray-500 font-medium">Detailed analysis by source and type</p>
                    </div>
                </div>
                <DateRangeFilter onChange={setDateRange} initialRangeKey={dateRange.key} />
            </div>

            {loading ? (
                <div className="h-96 flex items-center justify-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Income Breakdown */}
                    <div className="bg-white p-8 rounded-[2rem] border border-gray-100 shadow-xl">
                        <h3 className="text-xl font-black text-gray-900 mb-6 uppercase tracking-tight flex items-center gap-2">
                            <TrendingUp className="text-green-500" size={24} /> Income Sources
                        </h3>
                        <div className="h-[300px] w-full flex items-center justify-center">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={data?.income || []}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={60}
                                        outerRadius={100}
                                        paddingAngle={5}
                                        dataKey="total"
                                        nameKey="_id"
                                    >
                                        {(data?.income || []).map((entry: any, index: number) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip contentStyle={{ borderRadius: '12px' }} />
                                    <Legend />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                        <div className="mt-6 space-y-4">
                            {(data?.income || []).map((item: any) => (
                                <div key={item._id} className="p-4 bg-gray-50 rounded-2xl">
                                    <div className="flex justify-between items-center mb-2">
                                        <span className="font-bold text-gray-900">{item._id.replace('_', ' ')}</span>
                                        <span className="font-black text-green-600">₹{item.total.toLocaleString()}</span>
                                    </div>
                                    {item.platforms && item.platforms.length > 0 && (
                                        <div className="pl-4 border-l-2 border-gray-200 space-y-1">
                                            {item.platforms.map((p: any, i: number) => (
                                                <div key={i} className="flex justify-between text-xs text-gray-500">
                                                    <span>{p.platform}</span>
                                                    <span>₹{p.amount.toLocaleString()}</span>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Expense Breakdown */}
                    <div className="bg-white p-8 rounded-[2rem] border border-gray-100 shadow-xl">
                        <h3 className="text-xl font-black text-gray-900 mb-6 uppercase tracking-tight flex items-center gap-2">
                            <TrendingUp className="text-red-500 rotate-180" size={24} /> Expense Breakdown
                        </h3>
                        <div className="h-[300px] w-full flex items-center justify-center">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={data?.expense || []}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={60}
                                        outerRadius={100}
                                        paddingAngle={5}
                                        dataKey="amount"
                                        nameKey="_id.subtype"
                                    >
                                        {(data?.expense || []).map((entry: any, index: number) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip contentStyle={{ borderRadius: '12px' }} />
                                    <Legend />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                        <div className="mt-6 space-y-3">
                            {(data?.expense || []).map((item: any) => (
                                <div key={item._id.subtype} className="flex justify-between items-center p-4 bg-gray-50 rounded-xl">
                                    <span className="font-bold text-gray-700 text-sm">{item._id.subtype.replace('_', ' ')}</span>
                                    <span className="font-black text-red-600">₹{item.amount.toLocaleString()}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CategoryReport;
