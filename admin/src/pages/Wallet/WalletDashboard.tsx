import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Wallet, Clock, AlertTriangle, ChevronRight, TrendingUp, ArrowUpRight, ArrowDownLeft
} from 'lucide-react';
import { type IWalletAnalytics, analyticsService } from '../../services/analyticsService';
import { walletService } from '../../services/wallet.service';
import type { IWalletTransactionAttributes } from '../../types/wallet.types';
import { format } from 'date-fns';

const WalletDashboard = () => {
    const navigate = useNavigate();
    const [statsData, setStatsData] = useState<IWalletAnalytics | null>(null);
    const [recentTransactions, setRecentTransactions] = useState<IWalletTransactionAttributes[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const fetchDashboardData = async () => {
        try {
            setLoading(true);
            const [analytics, transactions] = await Promise.all([
                analyticsService.getWalletAnalytics(),
                walletService.getTransactions({ limit: 5 })
            ]);
            setStatsData(analytics);
            setRecentTransactions(transactions.recordList || []);
        } catch (error) {
            console.error('Error fetching dashboard data:', error);
        } finally {
            setLoading(false);
        }
    };

    const stats = [
        {
            label: 'Total Wallet Balance',
            value: `₹${statsData?.totalBalance?.toLocaleString() || '0.00'}`,
            sublabel: 'System Total',
            icon: Wallet,
            color: 'bg-primary/10 text-primary',
            trend: '+12.5%'
        },
        {
            label: 'Pending Cashbacks',
            value: `₹${statsData?.pendingCashback?.amount?.toLocaleString() || '0.00'}`,
            sublabel: `${statsData?.pendingCashback?.count || 0} Transactions`,
            icon: Clock,
            color: 'bg-amber-50 text-amber-600',
            trend: '+5.2%'
        },
        {
            label: 'Expiring Soon',
            value: `₹${statsData?.expiringSoon?.amount?.toLocaleString() || '0.00'}`,
            sublabel: 'Next 7 Days',
            icon: AlertTriangle,
            color: 'bg-red-50 text-red-600',
            trend: '-2.1%'
        }
    ];

    return (
        <div className="p-8 max-w-[1600px] mx-auto space-y-8">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-4xl font-black text-gray-900 uppercase tracking-tighter">Wallet Overview</h1>
                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-1">
                        System-wide wallet performance & history
                    </p>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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

            {/* Recent Activity Section */}
            <div className="bg-white rounded-[3rem] border border-gray-100 p-10 shadow-2xl shadow-gray-200/50">
                <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-primary/5 text-primary rounded-2xl flex items-center justify-center">
                            <TrendingUp size={24} />
                        </div>
                        <div>
                            <h2 className="text-xl font-black text-gray-900 uppercase tracking-tighter">Recent System Transactions</h2>
                            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-0.5">Global audit log</p>
                        </div>
                    </div>
                    <button
                        onClick={() => navigate('/wallet/transactions')}
                        className="h-10 px-6 rounded-xl bg-gray-50 hover:bg-gray-100 text-gray-500 font-black uppercase tracking-widest text-[10px] border border-gray-100 transition-all flex items-center gap-2"
                    >
                        View Full History <ChevronRight size={14} />
                    </button>
                </div>

                <div className="overflow-hidden border border-gray-100 rounded-[2rem]">
                    {recentTransactions.length > 0 ? (
                        <div className="divide-y divide-gray-50">
                            {recentTransactions.map((tx) => (
                                <div key={tx._id} className="p-6 flex items-center justify-between hover:bg-gray-50 transition-colors group">
                                    <div className="flex items-center gap-4">
                                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${tx.transactionType === 'CREDIT' ? 'bg-green-50 text-green-500' : 'bg-red-50 text-red-500'
                                            }`}>
                                            {tx.transactionType === 'CREDIT' ? <ArrowUpRight size={20} /> : <ArrowDownLeft size={20} />}
                                        </div>
                                        <div>
                                            <p className="text-sm font-black text-gray-900 uppercase tracking-tight">{tx.description}</p>
                                            <div className="flex items-center gap-2 mt-0.5">
                                                <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">
                                                    {format(new Date(tx.createdAt), 'MMM dd, yyyy • HH:mm')}
                                                </span>
                                                <span className="w-1 h-1 bg-gray-200 rounded-full" />
                                                <span className="text-[10px] text-primary font-black uppercase tracking-widest">
                                                    {(tx as any).user?.firstName} {(tx as any).user?.lastName}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className={`text-lg font-black tracking-tighter ${tx.transactionType === 'CREDIT' ? 'text-green-600' : 'text-red-600'
                                            }`}>
                                            {tx.transactionType === 'CREDIT' ? '+' : '-'}₹{tx.amount.toLocaleString()}
                                        </p>
                                        <div className="flex flex-col items-end gap-0.5">
                                            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest group-hover:text-gray-600 whitespace-nowrap">
                                                {tx.status}
                                            </p>
                                            {tx.transactionType === 'CREDIT' && tx.expiryDate && (
                                                <p className="text-[8px] font-black text-amber-500 uppercase tracking-tighter whitespace-nowrap">
                                                    Expires: {format(new Date(tx.expiryDate), 'MMM dd, yy')}
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="p-16 text-center space-y-4">
                            <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto border border-dashed border-gray-200">
                                <Clock size={32} className="text-gray-300" />
                            </div>
                            <div>
                                <p className="font-black text-gray-900 uppercase tracking-tight">No Transactions Recorded</p>
                                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-1">Transaction data will appear here once processed</p>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div >
    );
};

export default WalletDashboard;
