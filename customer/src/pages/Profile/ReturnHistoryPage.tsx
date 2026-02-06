import React, { useEffect, useState } from 'react';
import { returnService } from '../../services/returnService';
import { Loader2, RotateCcw, ChevronRight, AlertCircle, Package } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { toast } from 'react-hot-toast';

const ReturnHistoryPage: React.FC = () => {
    const [returns, setReturns] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [pagination, setPagination] = useState({
        page: 1,
        limit: 10,
        totalPages: 1
    });
    const navigate = useNavigate();

    useEffect(() => {
        loadReturns(pagination.page);
    }, [pagination.page]);

    const loadReturns = async (page: number) => {
        try {
            setLoading(true);
            const response = await returnService.getMyReturns({
                page,
                limit: pagination.limit,
                sort: { createdAt: -1 }
            });

            if (response && response.recordList) {
                console.log('Return Response:', response);
                setReturns(response.recordList);
                setPagination(prev => ({
                    ...prev,
                    totalPages: response.totalPages || 1
                }));
            } else if (Array.isArray(response)) {
                // Fallback
                setReturns(response);
            }
        } catch (error) {
            console.error('Failed to load returns:', error);
        } finally {
            setLoading(false);
        }
    };

    const handlePageChange = (newPage: number) => {
        if (newPage >= 1 && newPage <= pagination.totalPages) {
            setPagination(prev => ({ ...prev, page: newPage }));
            window.scrollTo({ top: 0, behavior: 'smooth' });
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
                    <h1 className="text-2xl font-black text-primary uppercase tracking-tight">Return Protocols</h1>
                    <p className="text-secondary text-xs font-bold uppercase tracking-widest mt-0.5">Track your reversal requests</p>
                </div>
            </div>

            {returns.length === 0 ? (
                <div className="bg-primary/5 rounded-[2rem] p-12 text-center border-2 border-dashed border-primary/10">
                    <div className="w-20 h-20 bg-background rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm">
                        <Package className="w-10 h-10 text-secondary/30" />
                    </div>
                    <h2 className="text-xl font-black text-primary uppercase tracking-tight mb-2">No Active Reversals</h2>
                    <p className="text-secondary text-sm font-medium mb-8 max-w-xs mx-auto">You haven't initiated any return requests yet. All your future returns will be tracked here.</p>
                </div>
            ) : (
                <div className="space-y-4">
                    {returns.map((item) => (
                        <div key={item._id} className="bg-background rounded-[2rem] p-6 border border-primary/10 shadow-sm hover:shadow-md transition-all duration-300 group">
                            <div className="flex flex-col md:flex-row justify-between gap-6">
                                <div className="flex gap-6">
                                    <div className="w-20 h-20 bg-primary/5 rounded-2xl overflow-hidden flex-shrink-0 border border-primary/10">
                                        <img
                                            src={item.productId?.mainImage || '/placeholder-product.png'}
                                            alt="Product"
                                            className="w-full h-full object-cover"
                                        />
                                    </div>
                                    <div className="flex flex-col justify-center">
                                        <div className="flex items-center gap-2 mb-1">
                                            <span className="text-[10px] font-black text-secondary uppercase tracking-widest">#{item.orderId?.orderNumber || 'ORDER'}</span>
                                            <span className="w-1 h-1 bg-secondary/30 rounded-full" />
                                            <span className="text-[10px] font-black text-secondary uppercase tracking-widest">{format(new Date(item.createdAt), 'MMM d, yyyy')}</span>
                                        </div>
                                        <h3 className="font-bold text-primary line-clamp-1">{item.productId?.name || 'Product'}</h3>
                                        <p className="text-xs text-secondary font-medium mt-1">Reason: {item.reason}</p>
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
                                                            loadReturns(pagination.page);
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

            {/* Pagination Controls */}
            {
                returns.length > 0 && pagination.totalPages > 1 && (
                    <div className="flex justify-center items-center gap-4 pt-8 border-t border-primary/10">
                        <button
                            onClick={() => handlePageChange(pagination.page - 1)}
                            disabled={pagination.page === 1}
                            className="px-4 py-2 rounded-lg border border-primary/20 text-sm font-bold text-primary disabled:opacity-50 disabled:cursor-not-allowed hover:bg-primary/5 transition-all"
                        >
                            Previous
                        </button>
                        <span className="text-sm font-medium text-secondary">
                            Page <span className="font-bold text-primary">{pagination.page}</span> of {pagination.totalPages}
                        </span>
                        <button
                            onClick={() => handlePageChange(pagination.page + 1)}
                            disabled={pagination.page === pagination.totalPages}
                            className="px-4 py-2 rounded-lg border border-primary/20 text-sm font-bold text-primary disabled:opacity-50 disabled:cursor-not-allowed hover:bg-primary/5 transition-all"
                        >
                            Next
                        </button>
                    </div>
                )}
        </div>
    );
};

export default ReturnHistoryPage;
