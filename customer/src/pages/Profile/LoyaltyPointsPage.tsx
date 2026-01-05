import React, { useEffect, useState } from 'react';
import { loyaltyService } from '../../services/loyalty.service';
import { Loader2, Coins, ArrowUpRight, ArrowDownLeft, Calendar, Info } from 'lucide-react';
import { format } from 'date-fns';

const LoyaltyPointsPage: React.FC = () => {
    const [data, setData] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadLoyalty();
    }, []);

    const loadLoyalty = async () => {
        try {
            const response = await loyaltyService.getStatus();
            if (response) {
                setData(response);
            }
        } catch (error) {
            console.error('Failed to load loyalty status:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center py-20">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
        );
    }

    const { balance = 0, ledger = [], expiryDate } = data || {};

    return (
        <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Points Summary Card */}
            <div className="relative overflow-hidden bg-gray-900 rounded-[2.5rem] p-10 text-white group">
                <div className="absolute top-0 right-0 w-64 h-64 bg-primary/20 rounded-full -mr-32 -mt-32 blur-3xl group-hover:bg-primary/30 transition-all duration-700" />
                <div className="absolute bottom-0 left-0 w-32 h-32 bg-amber-500/10 rounded-full -ml-16 -mb-16 blur-2xl" />

                <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-8">
                    <div className="space-y-4">
                        <div className="flex items-center gap-2 px-3 py-1 bg-white/10 backdrop-blur-md rounded-full w-fit">
                            <Coins size={14} className="text-amber-400" />
                            <span className="text-[10px] font-black uppercase tracking-widest text-white/80">Loyalty Balance</span>
                        </div>
                        <h1 className="text-6xl font-black tracking-tighter">{balance.toLocaleString()}</h1>
                        <p className="text-white/40 text-xs font-bold uppercase tracking-widest">Kipi Recognition Currency</p>
                    </div>

                    <div className="p-6 bg-white/5 backdrop-blur-xl rounded-3xl border border-white/10 space-y-4 min-w-[240px]">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-amber-400/20 rounded-xl text-amber-400">
                                <Calendar size={18} />
                            </div>
                            <div>
                                <p className="text-[10px] font-black text-white/40 uppercase tracking-widest">Points Expiry</p>
                                <p className="text-sm font-bold">{expiryDate ? format(new Date(expiryDate), 'MMM d, yyyy') : 'No Expiry'}</p>
                            </div>
                        </div>
                        <div className="pt-4 border-t border-white/5 flex gap-2">
                            <Info size={14} className="text-white/20 mt-0.5" />
                            <p className="text-[10px] text-white/40 font-medium leading-relaxed">Spend your points during checkout at a 1:1 ratio for direct discounts on your order protocol.</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Transaction Ledger */}
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <h2 className="text-xl font-black text-gray-900 uppercase tracking-tight">Transaction Ledger</h2>
                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest bg-gray-50 px-3 py-1 rounded-full">Historical Record</span>
                </div>

                {ledger.length === 0 ? (
                    <div className="bg-gray-50 rounded-[2rem] p-16 text-center border-2 border-dashed border-gray-100">
                        <p className="text-gray-400 font-bold uppercase tracking-widest text-xs">No transaction history found</p>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {ledger.map((tx: any, idx: number) => (
                            <div key={idx} className="bg-white rounded-2xl p-5 border border-gray-100 flex items-center justify-between hover:border-gray-200 transition-colors shadow-sm">
                                <div className="flex items-center gap-4">
                                    <div className={`p-3 rounded-2xl ${tx.type === 'CREDIT' ? 'bg-emerald-50 text-emerald-500' : 'bg-rose-50 text-rose-500'}`}>
                                        {tx.type === 'CREDIT' ? <ArrowUpRight size={20} /> : <ArrowDownLeft size={20} />}
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-gray-900">{tx.description}</h4>
                                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-0.5">
                                            {format(new Date(tx.date), 'MMM d, yyyy • HH:mm')}
                                        </p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className={`text-lg font-black tracking-tight ${tx.type === 'CREDIT' ? 'text-emerald-500' : 'text-rose-500'}`}>
                                        {tx.type === 'CREDIT' ? '+' : '-'}{tx.points}
                                    </p>
                                    <span className="text-[10px] font-black text-gray-300 uppercase tracking-widest">PTS</span>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default LoyaltyPointsPage;
