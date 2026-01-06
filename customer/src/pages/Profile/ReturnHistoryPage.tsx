import React, { useEffect, useState } from 'react';
import { returnService } from '../../services/returnService';
import { Loader2, RotateCcw, ChevronRight, AlertCircle, Package } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { toast } from 'react-hot-toast';

const ReturnHistoryPage: React.FC = () => {
    const [returns, setReturns] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        loadReturns();
    }, []);

    const loadReturns = async () => {
        try {
            const response = await returnService.getMyReturns();
            if (response && response.recordList) {
                setReturns(response.recordList);
            }
        } catch (error) {
            console.error('Failed to load returns:', error);
        } finally {
            setLoading(false);
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'APPROVED': return 'text-emerald-500 bg-emerald-50 border-emerald-100';
            case 'REJECTED': return 'text-rose-500 bg-rose-50 border-rose-100';
            case 'PICKED_UP': return 'text-indigo-500 bg-indigo-50 border-indigo-100';
            case 'REFUNDED': return 'text-primary bg-primary/5 border-primary/10';
            default: return 'text-amber-500 bg-amber-50 border-amber-100';
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center py-20">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex items-center gap-3">
                <div className="p-3 bg-rose-50 rounded-xl text-rose-500 shadow-sm border border-rose-100">
                    <RotateCcw size={24} />
                </div>
                <div>
                    <h1 className="text-2xl font-black text-gray-900 uppercase tracking-tight">Return Protocols</h1>
                    <p className="text-gray-500 text-xs font-bold uppercase tracking-widest mt-0.5">Track your reversal requests</p>
                </div>
            </div>

            {returns.length === 0 ? (
                <div className="bg-gray-50/50 rounded-[2rem] p-12 text-center border-2 border-dashed border-gray-100">
                    <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm">
                        <Package className="w-10 h-10 text-gray-200" />
                    </div>
                    <h2 className="text-xl font-black text-gray-900 uppercase tracking-tight mb-2">No Active Reversals</h2>
                    <p className="text-gray-500 text-sm font-medium mb-8 max-w-xs mx-auto">You haven't initiated any return requests yet. All your future returns will be tracked here.</p>
                </div>
            ) : (
                <div className="space-y-4">
                    {returns.map((item) => (
                        <div key={item._id} className="bg-white rounded-[2rem] p-6 border border-gray-100 shadow-sm hover:shadow-md transition-all duration-300 group">
                            <div className="flex flex-col md:flex-row justify-between gap-6">
                                <div className="flex gap-6">
                                    <div className="w-20 h-20 bg-gray-50 rounded-2xl overflow-hidden flex-shrink-0 border border-gray-100">
                                        <img
                                            src={item.productId?.mainImage || '/placeholder-product.png'}
                                            alt="Product"
                                            className="w-full h-full object-cover"
                                        />
                                    </div>
                                    <div className="flex flex-col justify-center">
                                        <div className="flex items-center gap-2 mb-1">
                                            <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">#{item.orderId?.orderNumber || 'ORDER'}</span>
                                            <span className="w-1 h-1 bg-gray-200 rounded-full" />
                                            <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{format(new Date(item.createdAt), 'MMM d, yyyy')}</span>
                                        </div>
                                        <h3 className="font-bold text-gray-900 line-clamp-1">{item.productId?.name || 'Product'}</h3>
                                        <p className="text-xs text-gray-500 font-medium mt-1">Reason: {item.reason}</p>
                                        {item.awb && (
                                            <div className="mt-2 flex items-center gap-2">
                                                <span className="text-[10px] font-black text-indigo-500 uppercase tracking-widest bg-indigo-50 px-2 py-0.5 rounded border border-indigo-100">Pickup Tracking: {item.awb}</span>
                                                <button
                                                    onClick={() => window.open(`https://shiprocket.co/tracking/${item.awb}`, '_blank')}
                                                    className="text-[10px] font-bold text-indigo-600 hover:underline"
                                                >
                                                    Track Pickup →
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <div className="flex items-center justify-between md:flex-col md:items-end md:justify-center gap-4">
                                    <div className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border ${getStatusColor(item.status)}`}>
                                        {item.status}
                                    </div>
                                    <div className="flex items-center gap-4">
                                        {item.status === 'PENDING' && (
                                            <button
                                                onClick={async () => {
                                                    if (window.confirm('Are you sure you want to cancel this return request?')) {
                                                        try {
                                                            await returnService.cancel(item._id);
                                                            toast.success('Return request cancelled');
                                                            loadReturns();
                                                        } catch (err) {
                                                            toast.error('Failed to cancel return request');
                                                        }
                                                    }
                                                }}
                                                className="text-[10px] font-black text-rose-500 uppercase tracking-widest hover:underline"
                                            >
                                                Cancel Request
                                            </button>
                                        )}
                                        <button
                                            onClick={() => navigate(`/orders/${item.orderId?._id || item.orderId}`)}
                                            className="text-[10px] font-black text-primary uppercase tracking-widest flex items-center gap-1 group-hover:translate-x-1 transition-transform"
                                        >
                                            View Detail
                                            <ChevronRight size={14} />
                                        </button>
                                    </div>
                                </div>
                            </div>

                            {item.adminNotes && (
                                <div className="mt-6 p-4 bg-amber-50 rounded-2xl border border-amber-100 flex gap-3">
                                    <AlertCircle className="text-amber-500 flex-shrink-0" size={18} />
                                    <p className="text-xs text-amber-800 font-medium leading-relaxed">
                                        <span className="font-black uppercase tracking-widest mr-2">Admin Note:</span>
                                        {item.adminNotes}
                                    </p>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default ReturnHistoryPage;
