import { useEffect, useState } from 'react';
import { walletService } from '../../services/wallet.service';
import { format } from 'date-fns';
import { Wallet, Clock, ArrowUpRight, ArrowDownLeft, Loader2, CreditCard, AlertCircle } from 'lucide-react';

const MyWallet = () => {
    const [wallet, setWallet] = useState<any>(null);
    const [transactions, setTransactions] = useState([]);
    const [expiringSoon, setExpiringSoon] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [walletRes, txRes, expiringRes] = await Promise.all([
                    walletService.getMyWallet(),
                    walletService.getMyTransactions({ limit: 20, sort: { createdAt: -1 } }),
                    walletService.getExpiringTransactions(30) // Check next 30 days
                ]);
                setWallet(walletRes?.data || walletRes); // Handle both wrapped and unwrapped
                setTransactions(txRes?.data?.recordList || txRes?.recordList || []);

                if (expiringRes?.data?.length > 0 || expiringRes?.length > 0) {
                    const expiryList = expiringRes.data || expiringRes;
                    setExpiringSoon(expiryList[0]); // Get the soonest expiring
                }
            } catch (error) {
                console.error('Error fetching wallet data:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    if (loading) {
        return (
            <div className="flex justify-center items-center py-20">
                <Loader2 className="animate-spin text-primary" size={32} />
            </div>
        );
    }

    if (!wallet) return <div className="text-center py-10">Wallet not active</div>;

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Header */}
            <div className="flex justify-between items-end">
                <div>
                    <h1 className="text-3xl font-black text-gray-900 tracking-tight">My Wallet</h1>
                    <p className="text-gray-500 font-medium mt-1">Manage your balance and rewards</p>
                </div>
            </div>

            {/* Expiry Warning */}
            {expiringSoon && (
                <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex items-center gap-4 animate-in fade-in slide-in-from-top-2 duration-300">
                    <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center text-amber-600 flex-shrink-0">
                        <AlertCircle size={20} />
                    </div>
                    <div>
                        <p className="text-amber-800 text-sm font-bold">Points Expiring Soon!</p>
                        <p className="text-amber-700 text-xs">₹{expiringSoon.amount} will expire on {format(new Date(expiringSoon.expiryDate), 'dd MMM yyyy')}</p>
                    </div>
                </div>
            )}

            {/* Balances Card */}
            <div className="grid md:grid-cols-2 gap-6">
                {/* Main Balance Card */}
                <div className="relative overflow-hidden rounded-[2rem] bg-gray-900 text-white p-8 shadow-xl shadow-gray-200">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-primary/30 rounded-full blur-3xl -mr-16 -mt-16"></div>
                    <div className="absolute bottom-0 left-0 w-40 h-40 bg-purple-500/20 rounded-full blur-2xl -ml-10 -mb-10"></div>

                    <div className="relative z-10 flex flex-col justify-between h-full min-h-[180px]">
                        <div className="flex justify-between items-start">
                            <div className="w-12 h-12 rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/10">
                                <Wallet className="text-white" size={24} />
                            </div>
                            <span className="px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/10 text-xs font-bold uppercase tracking-widest">
                                Active
                            </span>
                        </div>

                        <div>
                            <p className="text-white/60 font-bold uppercase tracking-widest text-xs mb-2">Available Balance</p>
                            <h2 className="text-5xl font-black tracking-tighter">₹{(wallet.availableBalance || 0).toFixed(2)}</h2>
                        </div>
                    </div>
                </div>

                {/* Secondary Stats */}
                <div className="grid gap-6">
                    <div className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm flex items-center gap-6">
                        <div className="w-16 h-16 rounded-2xl bg-amber-50 flex items-center justify-center text-amber-500">
                            <Clock size={28} />
                        </div>
                        <div>
                            <p className="text-gray-400 font-bold uppercase tracking-widest text-[10px] mb-1">Blocked Balance</p>
                            <h3 className="text-2xl font-black text-gray-900">₹{(wallet.blockedBalance || 0).toFixed(2)}</h3>
                            <p className="text-xs text-gray-500 font-medium">Pending confirmation</p>
                        </div>
                    </div>

                    <div className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm flex items-center gap-6">
                        <div className="w-16 h-16 rounded-2xl bg-purple-50 flex items-center justify-center text-purple-500">
                            <CreditCard size={28} />
                        </div>
                        <div>
                            <p className="text-gray-400 font-bold uppercase tracking-widest text-[10px] mb-1">Total Lifetime Credit</p>
                            <h3 className="text-2xl font-black text-gray-900">₹{(wallet.totalEarned || 0).toFixed(2)}</h3>
                            <p className="text-xs text-gray-500 font-medium">Earned rewards & refunds</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Transactions Section */}
            <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm overflow-hidden">
                <div className="p-8 border-b border-gray-50 bg-gray-50/50 flex justify-between items-center">
                    <h3 className="text-xl font-bold text-gray-800">Transaction History</h3>
                    <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">{transactions.length} Records</span>
                </div>

                <div className="divide-y divide-gray-50">
                    {transactions.length > 0 ? (
                        transactions.map((tx: any) => (
                            <div key={tx._id} className="p-6 hover:bg-gray-50 transition-colors flex items-center justify-between group">
                                <div className="flex items-center gap-5">
                                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-colors ${tx.transactionType === 'CREDIT'
                                        ? 'bg-green-50 text-green-600 group-hover:bg-green-100'
                                        : 'bg-rose-50 text-rose-600 group-hover:bg-rose-100'
                                        }`}>
                                        {tx.transactionType === 'CREDIT' ? <ArrowDownLeft size={24} /> : <ArrowUpRight size={24} />}
                                    </div>
                                    <div>
                                        <p className="font-bold text-gray-900 mb-0.5">{tx.description || tx.sourceType}</p>
                                        <div className="flex items-center gap-3">
                                            <span className="text-xs font-medium text-gray-400">{format(new Date(tx.createdAt), 'dd MMM yyyy, HH:mm')}</span>
                                            <span className="w-1 h-1 rounded-full bg-gray-300"></span>
                                            <span className="text-xs font-bold uppercase tracking-wider text-gray-500">{tx.sourceType.replace('_', ' ')}</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className={`text-lg font-black tracking-tight ${tx.transactionType === 'CREDIT' ? 'text-green-600' : 'text-gray-900'
                                        }`}>
                                        {tx.transactionType === 'CREDIT' ? '+' : '-'}₹{tx.amount}
                                    </p>
                                    <div className="flex flex-col items-end gap-1">
                                        <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${tx.status === 'CONFIRMED' ? 'bg-green-100 text-green-700' :
                                            tx.status === 'PENDING' ? 'bg-amber-100 text-amber-700' :
                                                tx.status === 'EXPIRED' ? 'bg-gray-100 text-gray-500' :
                                                    'bg-rose-100 text-rose-700'
                                            }`}>
                                            {tx.status}
                                        </span>
                                        {tx.transactionType === 'CREDIT' && tx.expiryDate && (
                                            <span className="text-[10px] font-bold text-amber-500 uppercase tracking-tight">
                                                Expires: {format(new Date(tx.expiryDate), 'dd MMM yy')}
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="p-12 text-center text-gray-400">
                            <p>No transactions found.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default MyWallet;
