import React, { useEffect, useState } from 'react';
import { loyaltyService } from '../../services/loyalty.service';
import {
    Coins,
    ArrowUpCircle,
    ArrowDownCircle,
    RotateCcw,
    History,
    RefreshCw,
    ExternalLink
} from 'lucide-react';
import { format } from 'date-fns';

const LoyaltyAuditList: React.FC = () => {
    const [ledger, setLedger] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const params = {
        page: 1,
        limit: 20
    };

    const fetchLedger = async () => {
        setLoading(true);
        try {
            const res = await loyaltyService.getLedger({ options: params });
            setLedger(res.recordList || []);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchLedger();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const getStatusBadge = (type: string) => {
        switch (type) {
            case 'EARNED':
                return <span className="px-2 py-1 bg-green-100 text-green-700 rounded-lg text-[10px] font-black uppercase flex items-center gap-1 w-fit"><ArrowUpCircle size={12} /> Earned</span>;
            case 'SPENT':
                return <span className="px-2 py-1 bg-amber-100 text-amber-700 rounded-lg text-[10px] font-black uppercase flex items-center gap-1 w-fit"><ArrowDownCircle size={12} /> Spent</span>;
            case 'REFUNDED':
                return <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-lg text-[10px] font-black uppercase flex items-center gap-1 w-fit"><RotateCcw size={12} /> Refunded</span>;
            case 'EXPIRED':
                return <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded-lg text-[10px] font-black uppercase flex items-center gap-1 w-fit"><History size={12} /> Expired</span>;
            default:
                return <span>{type}</span>;
        }
    };

    return (
        <div className="p-8 space-y-8 animate-in fade-in duration-700">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-4xl font-black text-gray-900 tracking-tighter uppercase flex items-center gap-3">
                        <Coins className="text-primary animate-bounce-slow" size={40} />
                        Loyalty Hub
                    </h1>
                    <p className="text-gray-500 font-bold uppercase text-xs tracking-widest mt-1">
                        Global Point Ledger & Rewards Audit
                    </p>
                </div>

                <div className="flex items-center gap-3">
                    <button
                        onClick={fetchLedger}
                        className="p-3 bg-white border border-gray-100 rounded-2xl shadow-sm text-gray-400 hover:text-primary hover:border-primary/20 transition-all active:scale-95"
                    >
                        <RefreshCw size={20} className={loading ? 'animate-spin' : ''} />
                    </button>
                    <div className="bg-primary/5 px-4 py-2 rounded-2xl border border-primary/10">
                        <p className="text-[10px] font-black text-primary uppercase tracking-widest leading-none">Global Points Issued</p>
                        <p className="text-xl font-black text-gray-900 tracking-tight">Kipi Social Currency active</p>
                    </div>
                </div>
            </div>

            {/* Content Table */}
            <div className="bg-white rounded-[32px] border border-gray-100 shadow-2xl shadow-gray-200/50 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-gray-50/50">
                                <th className="px-6 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Timestamp</th>
                                <th className="px-6 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">User ID / Reference</th>
                                <th className="px-6 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Type</th>
                                <th className="px-6 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest text-right">Points Movement</th>
                                <th className="px-6 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest text-right">Balance After</th>
                                <th className="px-6 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Details</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {loading ? (
                                Array.from({ length: 5 }).map((_, i) => (
                                    <tr key={i} className="animate-pulse">
                                        <td colSpan={6} className="px-6 py-4">
                                            <div className="h-10 bg-gray-100 rounded-xl w-full" />
                                        </td>
                                    </tr>
                                ))
                            ) : ledger.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="px-6 py-20 text-center">
                                        <div className="flex flex-col items-center gap-3">
                                            <div className="p-4 bg-gray-50 rounded-full">
                                                <Coins size={32} className="text-gray-300" />
                                            </div>
                                            <p className="font-bold text-gray-400 uppercase tracking-widest text-xs">No reward history found</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                ledger.map((item) => (
                                    <tr key={item._id} className="hover:bg-primary/[0.02] transition-colors group">
                                        <td className="px-6 py-5">
                                            <p className="text-[11px] font-bold text-gray-900">{format(new Date(item.createdAt), 'dd MMM yyyy')}</p>
                                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter">{format(new Date(item.createdAt), 'HH:mm:ss')}</p>
                                        </td>
                                        <td className="px-6 py-5">
                                            <div className="flex items-center gap-2">
                                                <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center font-black text-[10px] text-gray-400">ID</div>
                                                <div>
                                                    <p className="text-xs font-bold text-gray-900 truncate w-32">{item.userId}</p>
                                                    {item.orderId && (
                                                        <p className="text-[9px] font-black text-primary uppercase flex items-center gap-1 tracking-widest">
                                                            <ExternalLink size={8} /> Linked to Order
                                                        </p>
                                                    )}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-5">
                                            {getStatusBadge(item.type)}
                                        </td>
                                        <td className={`px-6 py-5 text-right font-black text-sm ${item.points > 0 ? 'text-green-600' : 'text-amber-500'}`}>
                                            {item.points > 0 ? '+' : ''}{item.points}
                                        </td>
                                        <td className="px-6 py-5 text-right font-black text-sm text-gray-900">
                                            {item.balanceAfter}
                                        </td>
                                        <td className="px-6 py-5">
                                            <p className="text-xs font-medium text-gray-500 max-w-xs">{item.message}</p>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default LoyaltyAuditList;
