import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    TrendingUp, TrendingDown, DollarSign, Activity, Calendar, ChevronRight
} from 'lucide-react';
import { financialRecordService } from '../../services/financialRecord.service';
import type { IFinancialAnalytics } from '../../types/financialRecord.types';
import { format } from 'date-fns';

const FinancialAnalyticsDashboard = () => {
    const navigate = useNavigate();
    const [analytics, setAnalytics] = useState<IFinancialAnalytics | null>(null);
    const [loading, setLoading] = useState(true);
    const [dateRange, setDateRange] = useState<{ start?: Date; end?: Date }>({});

    useEffect(() => {
        fetchAnalytics();
    }, [dateRange]);

    const fetchAnalytics = async () => {
        try {
            setLoading(true);
            const response = await financialRecordService.getAnalytics(dateRange.start, dateRange.end);
            setAnalytics(response.data);
        } catch (error) {
            console.error('Error fetching analytics:', error);
        } finally {
            setLoading(false);
        }
    };

    const stats = [
        {
            label: 'Total Income',
            value: `₹${analytics?.totalIncome?.toLocaleString() || '0.00'}`,
            sublabel: 'Revenue Generated',
            icon: TrendingUp,
            color: 'bg-green-50 text-green-600',
            trend: '+12.5%'
        },
        {
            label: 'Total Expense',
            value: `₹${analytics?.totalExpense?.toLocaleString() || '0.00'}`,
            sublabel: 'Costs Incurred',
            icon: TrendingDown,
            color: 'bg-red-50 text-red-600',
            trend: '+5.2%'
        },
        {
            label: 'Net Profit',
            value: `₹${analytics?.netProfit?.toLocaleString() || '0.00'}`,
            sublabel: 'Income - Expense',
            icon: DollarSign,
            color: analytics && analytics.netProfit >= 0 ? 'bg-primary/10 text-primary' : 'bg-red-50 text-red-600',
            trend: analytics && analytics.netProfit >= 0 ? '+7.3%' : '-2.1%'
        },
        {
            label: 'Transactions',
            value: analytics?.transactionCount?.toString() || '0',
            sublabel: 'Total Records',
            icon: Activity,
            color: 'bg-blue-50 text-blue-600',
            trend: '+18'
        }
    ];

    return (
        <div className="p-8 max-w-[1600px] mx-auto space-y-8">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-4xl font-black text-gray-900 uppercase tracking-tighter">Financial Analytics</h1>
                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-1">
                        Complete income & expense overview
                    </p>
                </div>
                <button
                    onClick={() => navigate('/financial-records')}
                    className="h-12 px-6 rounded-xl bg-primary text-white font-black uppercase tracking-widest text-[10px] hover:bg-primary/90 transition-all flex items-center gap-2"
                >
                    View All Records <ChevronRight size={14} />
                </button>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                {stats.map((stat, idx) => (
                    <div key={idx} className="bg-white rounded-[2rem] border border-gray-100 p-8 shadow-xl shadow-gray-200/40 relative overflow-hidden group">
                        <div className="relative z-10 flex flex-col gap-4">
                            <div className={`w-14 h-14 ${stat.color} rounded-2xl flex items-center justify-center shadow-inner`}>
                                <stat.icon size={28} />
                            </div>
                            <div>
                                <h3 className="text-4xl font-black text-gray-900 tracking-tighter">{loading ? '...' : stat.value}</h3>
                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-1 group-hover:text-primary transition-colors">{stat.label}</p>
                            </div>
                            <div className="flex items-center gap-2 pt-2 border-t border-gray-50">
                                <span className="text-[10px] text-gray-400 font-bold uppercase">{stat.sublabel}</span>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Breakdown Sections */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Income Breakdown */}
                <div className="bg-white rounded-[3rem] border border-gray-100 p-10 shadow-2xl shadow-gray-200/50">
                    <div className="flex items-center gap-4 mb-8">
                        <div className="w-12 h-12 bg-green-50 text-green-600 rounded-2xl flex items-center justify-center">
                            <TrendingUp size={24} />
                        </div>
                        <div>
                            <h2 className="text-xl font-black text-gray-900 uppercase tracking-tighter">Income Breakdown</h2>
                            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-0.5">By source type</p>
                        </div>
                    </div>
                    <div className="space-y-4">
                        {analytics?.incomeBySubtype?.map((item, idx) => (
                            <div key={idx} className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl">
                                <span className="text-sm font-black text-gray-900 uppercase tracking-tight">{item.subtype}</span>
                                <div className="text-right">
                                    <p className="text-lg font-black text-green-600">₹{item.amount.toLocaleString()}</p>
                                    <p className="text-[10px] text-gray-400 font-bold uppercase">{item.count} transactions</p>
                                </div>
                            </div>
                        )) || <p className="text-center text-gray-400 py-8">No income data</p>}
                    </div>
                </div>

                {/* Expense Breakdown */}
                <div className="bg-white rounded-[3rem] border border-gray-100 p-10 shadow-2xl shadow-gray-200/50">
                    <div className="flex items-center gap-4 mb-8">
                        <div className="w-12 h-12 bg-red-50 text-red-600 rounded-2xl flex items-center justify-center">
                            <TrendingDown size={24} />
                        </div>
                        <div>
                            <h2 className="text-xl font-black text-gray-900 uppercase tracking-tighter">Expense Breakdown</h2>
                            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-0.5">By cost type</p>
                        </div>
                    </div>
                    <div className="space-y-4">
                        {analytics?.expenseBySubtype?.map((item, idx) => (
                            <div key={idx} className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl">
                                <span className="text-sm font-black text-gray-900 uppercase tracking-tight">{item.subtype.replace('_', ' ')}</span>
                                <div className="text-right">
                                    <p className="text-lg font-black text-red-600">₹{item.amount.toLocaleString()}</p>
                                    <p className="text-[10px] text-gray-400 font-bold uppercase">{item.count} transactions</p>
                                </div>
                            </div>
                        )) || <p className="text-center text-gray-400 py-8">No expense data</p>}
                    </div>
                </div>
            </div>

            {/* Recent Transactions */}
            <div className="bg-white rounded-[3rem] border border-gray-100 p-10 shadow-2xl shadow-gray-200/50">
                <div className="flex items-center gap-4 mb-8">
                    <div className="w-12 h-12 bg-primary/5 text-primary rounded-2xl flex items-center justify-center">
                        <Calendar size={24} />
                    </div>
                    <div>
                        <h2 className="text-xl font-black text-gray-900 uppercase tracking-tighter">Recent Transactions</h2>
                        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-0.5">Latest financial activity</p>
                    </div>
                </div>
                <div className="overflow-hidden border border-gray-100 rounded-[2rem]">
                    {analytics?.recentTransactions && analytics.recentTransactions.length > 0 ? (
                        <div className="divide-y divide-gray-50">
                            {analytics.recentTransactions.map((tx) => (
                                <div key={tx._id} className="p-6 flex items-center justify-between hover:bg-gray-50 transition-colors group cursor-pointer"
                                    onClick={() => navigate(`/financial-records/${tx._id}`)}>
                                    <div className="flex items-center gap-4">
                                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${tx.transactionType === 'INCOME' ? 'bg-green-50 text-green-500' : 'bg-red-50 text-red-500'}`}>
                                            {tx.transactionType === 'INCOME' ? <TrendingUp size={20} /> : <TrendingDown size={20} />}
                                        </div>
                                        <div>
                                            <p className="text-sm font-black text-gray-900 uppercase tracking-tight">{tx.subtype.replace('_', ' ')}</p>
                                            <div className="flex items-center gap-2 mt-0.5">
                                                <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">
                                                    {format(new Date(tx.createdAt), 'MMM dd, yyyy • HH:mm')}
                                                </span>
                                                {tx.isAutomatic && (
                                                    <>
                                                        <span className="w-1 h-1 bg-gray-200 rounded-full" />
                                                        <span className="text-[10px] text-primary font-black uppercase tracking-widest">AUTO</span>
                                                    </>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className={`text-lg font-black tracking-tighter ${tx.transactionType === 'INCOME' ? 'text-green-600' : 'text-red-600'}`}>
                                            {tx.transactionType === 'INCOME' ? '+' : '-'}₹{tx.amount.toLocaleString()}
                                        </p>
                                        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">{tx.status}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="p-16 text-center space-y-4">
                            <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto border border-dashed border-gray-200">
                                <Activity size={32} className="text-gray-300" />
                            </div>
                            <div>
                                <p className="font-black text-gray-900 uppercase tracking-tight">No Transactions Recorded</p>
                                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-1">Transaction data will appear here once processed</p>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default FinancialAnalyticsDashboard;
