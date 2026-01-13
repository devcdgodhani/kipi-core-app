import React, { useEffect, useState } from 'react';
import { Building2 } from 'lucide-react';
import { financialRecordService } from '../../../services/financialRecord.service';
import { DateRangeFilter, type DateRange } from '../../../components/common/DateRangeFilter';
import { subMonths, startOfDay, endOfDay } from 'date-fns';

const BankReport: React.FC = () => {
    const [loading, setLoading] = useState(false);
    const [data, setData] = useState<any[]>([]);
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
            const response = await financialRecordService.getReports('BANK_REPORT', dateRange.startDate, dateRange.endDate);
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
                    <div className="w-16 h-16 rounded-[1.5rem] bg-purple-500 flex items-center justify-center text-white shadow-xl shadow-purple-500/20">
                        <Building2 size={32} />
                    </div>
                    <div>
                        <h1 className="text-3xl font-black text-gray-900 uppercase tracking-tight">Bank & Platform Analysis</h1>
                        <p className="text-sm text-gray-500 font-medium">Cash flow by bank account and payment source</p>
                    </div>
                </div>
                <DateRangeFilter onChange={setDateRange} initialRangeKey={dateRange.key} />
            </div>

            {loading ? (
                <div className="h-96 flex items-center justify-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500"></div>
                </div>
            ) : (
                <div className="bg-white rounded-[2rem] border border-gray-100 shadow-xl overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-gray-50 border-b border-gray-100">
                                <tr>
                                    <th className="px-8 py-5 text-xs font-black text-gray-400 uppercase tracking-widest">Bank / Platform</th>
                                    <th className="px-8 py-5 text-xs font-black text-gray-400 uppercase tracking-widest text-right">Transactions</th>
                                    <th className="px-8 py-5 text-xs font-black text-gray-400 uppercase tracking-widest text-right">Total Income</th>
                                    <th className="px-8 py-5 text-xs font-black text-gray-400 uppercase tracking-widest text-right">Total Expense</th>
                                    <th className="px-8 py-5 text-xs font-black text-gray-400 uppercase tracking-widest text-right">Net Flow</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {(data || []).map((item: any, idx: number) => (
                                    <tr key={idx} className="hover:bg-purple-50/50 transition-colors group">
                                        <td className="px-8 py-5 font-bold text-gray-900">{item.bankName}</td>
                                        <td className="px-8 py-5 text-right text-gray-600">{item.transactionCount}</td>
                                        <td className="px-8 py-5 text-right font-medium text-green-600">₹{item.income.toLocaleString()}</td>
                                        <td className="px-8 py-5 text-right font-medium text-red-600">₹{item.expense.toLocaleString()}</td>
                                        <td className={`px-8 py-5 text-right font-black ${item.netFlow >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                            {item.netFlow >= 0 ? '+' : ''}₹{item.netFlow.toLocaleString()}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        {(!data || data.length === 0) && (
                            <div className="p-12 text-center text-gray-400">
                                No data available for this period
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default BankReport;
