import React, { useEffect, useState, useCallback } from 'react';
import {
    Receipt,
    TrendingUp,
    FileText
} from 'lucide-react';
import { analyticsService } from '../../services/analyticsService';
import { DateRangeFilter, type DateRange } from '../../components/common/DateRangeFilter';
import { subDays, startOfDay, endOfDay } from 'date-fns';
import toast from 'react-hot-toast';

const FinancialReports: React.FC = () => {
    const [loading, setLoading] = useState(true);
    const [taxData, setTaxData] = useState<any>(null);
    const [dateRange, setDateRange] = useState<DateRange>({
        startDate: startOfDay(subDays(new Date(), 30)),
        endDate: endOfDay(new Date()),
        key: '30d'
    });

    const fetchTaxData = useCallback(async () => {
        try {
            setLoading(true);
            const data = await analyticsService.getTaxSummary(dateRange.startDate, dateRange.endDate);
            if (data) {
                setTaxData(data);
            }
        } catch (error) {
            console.error(error);
            // toast.error('Failed to load financial data'); // analyticsService/http interceptor might handle global errors or redirects
        } finally {
            setLoading(false);
        }
    }, [dateRange]);

    useEffect(() => {
        fetchTaxData();
    }, [fetchTaxData]);

    const handleExport = (type: 'sales' | 'products' | 'customers', format: 'xlsx' | 'csv' = 'xlsx') => {
        const url = `/api/v1/admin/analytics/export/${type}?startDate=${dateRange.startDate.toISOString()}&endDate=${dateRange.endDate.toISOString()}&format=${format}`;
        const token = localStorage.getItem('token');
        // ... (rest of handleExport stays same)

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

    if (loading) {
        return <div className="p-10 flex justify-center text-primary font-bold">Loading Financial Reports...</div>;
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
                    <div className="w-16 h-16 rounded-[1.5rem] bg-indigo-500 flex items-center justify-center text-white shadow-xl shadow-indigo-500/20">
                        <Receipt size={32} />
                    </div>
                    <div>
                        <h1 className="text-3xl font-black text-primary tracking-tight uppercase font-mono">Financial Reports</h1>
                        <p className="text-sm text-gray-500 font-medium">Tax summaries and data exports</p>
                    </div>
                </div>

                <div className="relative z-10">
                    <DateRangeFilter onChange={setDateRange} initialRangeKey={dateRange.key} />
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
                    <div className="flex justify-between items-center p-4 bg-blue-50 rounded-xl">
                        <span className="text-sm font-medium text-blue-600">Total Orders</span>
                        <span className="text-lg font-black text-blue-600">{taxData?.orders?.toLocaleString() || 0}</span>
                    </div>
                </div>
            </div>

            {/* Export Section */}
            <div className="bg-white p-8 rounded-[2.5rem] border border-primary/5 shadow-xl shadow-gray-100/50">
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h3 className="text-lg font-black text-gray-800">Data Exports</h3>
                        <p className="text-xs text-gray-400 font-medium mt-1">Download comprehensive reports</p>
                    </div>
                    <div className="w-10 h-10 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-500">
                        <FileText size={20} />
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Sales Export */}
                    <div className="p-6 rounded-2xl bg-emerald-50 border border-emerald-100">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-10 h-10 rounded-xl bg-emerald-500 flex items-center justify-center text-white">
                                <TrendingUp size={20} />
                            </div>
                            <div>
                                <h4 className="font-black text-gray-800 text-sm">Sales Report</h4>
                                <p className="text-[10px] text-gray-500">Revenue & orders data</p>
                            </div>
                        </div>
                        <div className="flex gap-2">
                            <button
                                onClick={() => handleExport('sales', 'xlsx')}
                                className="flex-1 px-3 py-2 bg-white text-emerald-600 rounded-lg text-xs font-bold hover:bg-emerald-100 transition-colors"
                            >
                                Excel
                            </button>
                            <button
                                onClick={() => handleExport('sales', 'csv')}
                                className="flex-1 px-3 py-2 bg-white text-emerald-600 rounded-lg text-xs font-bold hover:bg-emerald-100 transition-colors"
                            >
                                CSV
                            </button>
                        </div>
                    </div>

                    {/* Products Export */}
                    <div className="p-6 rounded-2xl bg-amber-50 border border-amber-100">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-10 h-10 rounded-xl bg-amber-500 flex items-center justify-center text-white">
                                <FileText size={20} />
                            </div>
                            <div>
                                <h4 className="font-black text-gray-800 text-sm">Product Report</h4>
                                <p className="text-[10px] text-gray-500">Performance & returns</p>
                            </div>
                        </div>
                        <div className="flex gap-2">
                            <button
                                onClick={() => handleExport('products', 'xlsx')}
                                className="flex-1 px-3 py-2 bg-white text-amber-600 rounded-lg text-xs font-bold hover:bg-amber-100 transition-colors"
                            >
                                Excel
                            </button>
                            <button
                                onClick={() => handleExport('products', 'csv')}
                                className="flex-1 px-3 py-2 bg-white text-amber-600 rounded-lg text-xs font-bold hover:bg-amber-100 transition-colors"
                            >
                                CSV
                            </button>
                        </div>
                    </div>

                    {/* Customers Export */}
                    <div className="p-6 rounded-2xl bg-purple-50 border border-purple-100">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-10 h-10 rounded-xl bg-purple-500 flex items-center justify-center text-white">
                                <FileText size={20} />
                            </div>
                            <div>
                                <h4 className="font-black text-gray-800 text-sm">Customer Report</h4>
                                <p className="text-[10px] text-gray-500">Insights & behavior</p>
                            </div>
                        </div>
                        <div className="flex gap-2">
                            <button
                                onClick={() => handleExport('customers', 'xlsx')}
                                className="flex-1 px-3 py-2 bg-white text-purple-600 rounded-lg text-xs font-bold hover:bg-purple-100 transition-colors"
                            >
                                Excel
                            </button>
                            <button
                                onClick={() => handleExport('customers', 'csv')}
                                className="flex-1 px-3 py-2 bg-white text-purple-600 rounded-lg text-xs font-bold hover:bg-purple-100 transition-colors"
                            >
                                CSV
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default FinancialReports;
