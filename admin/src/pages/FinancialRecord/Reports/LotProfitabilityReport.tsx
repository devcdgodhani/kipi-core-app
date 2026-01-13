import React, { useEffect, useState } from 'react';
import { Layers } from 'lucide-react';
import { financialRecordService } from '../../../services/financialRecord.service';
import { DateRangeFilter, type DateRange } from '../../../components/common/DateRangeFilter';
import { subMonths, startOfDay, endOfDay } from 'date-fns';

const LotProfitabilityReport: React.FC = () => {
    const [loading, setLoading] = useState(false);
    const [data, setData] = useState<any[]>([]);
    const [dateRange, setDateRange] = useState<DateRange>({
        startDate: startOfDay(subMonths(new Date(), 3)), // Longer default range for lots
        endDate: endOfDay(new Date()),
        key: '90d'
    });

    useEffect(() => {
        fetchReport();
    }, [dateRange]);

    const fetchReport = async () => {
        setLoading(true);
        try {
            const response = await financialRecordService.getReports('LOT_PROFITABILITY', dateRange.startDate, dateRange.endDate);
            setData(response.data);
        } catch (error) {
            console.error("Failed to fetch report", error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="p-6 space-y-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm">
                <div className="flex items-center gap-6">
                    <div className="w-16 h-16 rounded-[1.5rem] bg-blue-500 flex items-center justify-center text-white shadow-xl shadow-blue-500/20">
                        <Layers size={32} />
                    </div>
                    <div>
                        <h1 className="text-3xl font-black text-gray-900 uppercase tracking-tight">Lot Profitability</h1>
                        <p className="text-sm text-gray-500 font-medium">Revenue, cost & margin analysis per lot</p>
                    </div>
                </div>
                <DateRangeFilter onChange={setDateRange} initialRangeKey={dateRange.key} />
            </div>

            {loading ? (
                <div className="h-96 flex items-center justify-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
                </div>
            ) : (
                <div className="bg-white rounded-[2rem] border border-gray-100 shadow-xl overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-gray-50 border-b border-gray-100">
                                <tr>
                                    <th className="px-8 py-5 text-xs font-black text-gray-400 uppercase tracking-widest">Lot Number</th>
                                    <th className="px-8 py-5 text-xs font-black text-gray-400 uppercase tracking-widest">Status</th>
                                    <th className="px-8 py-5 text-xs font-black text-gray-400 uppercase tracking-widest text-right">Revenue</th>
                                    <th className="px-8 py-5 text-xs font-black text-gray-400 uppercase tracking-widest text-right">Cost</th>
                                    <th className="px-8 py-5 text-xs font-black text-gray-400 uppercase tracking-widest text-right">Items Sold</th>
                                    <th className="px-8 py-5 text-xs font-black text-gray-400 uppercase tracking-widest text-right">Net Profit</th>
                                    <th className="px-8 py-5 text-xs font-black text-gray-400 uppercase tracking-widest text-right">Margin</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {(data || []).map((lot: any) => (
                                    <tr key={lot.lotId} className="hover:bg-blue-50/50 transition-colors group">
                                        <td className="px-8 py-5 font-bold text-gray-900">{lot.lotNumber}</td>
                                        <td className="px-8 py-5">
                                            <span className={`px-2 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest ${lot.status === 'ACTIVE' ? 'bg-green-100 text-green-700' :
                                                    lot.status === 'COMPLETED' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-600'
                                                }`}>
                                                {lot.status}
                                            </span>
                                        </td>
                                        <td className="px-8 py-5 text-right font-medium text-green-600">₹{lot.totalRevenue.toLocaleString()}</td>
                                        <td className="px-8 py-5 text-right font-medium text-red-600">₹{lot.totalCost.toLocaleString()}</td>
                                        <td className="px-8 py-5 text-right font-medium text-gray-600">{lot.itemsSold} / {lot.totalItems}</td>
                                        <td className={`px-8 py-5 text-right font-black ${lot.netProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                            {lot.netProfit >= 0 ? '+' : ''}₹{lot.netProfit.toLocaleString()}
                                        </td>
                                        <td className="px-8 py-5 text-right">
                                            <span className={`px-2 py-1 rounded-lg text-[10px] font-black ${lot.marginPercentage >= 20 ? 'bg-green-100 text-green-700' :
                                                    lot.marginPercentage > 0 ? 'bg-yellow-100 text-yellow-700' :
                                                        'bg-red-100 text-red-700'
                                                }`}>
                                                {lot.marginPercentage}%
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        {(!data || data.length === 0) && (
                            <div className="p-12 text-center text-gray-400">
                                No lot data available for this period
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default LotProfitabilityReport;
