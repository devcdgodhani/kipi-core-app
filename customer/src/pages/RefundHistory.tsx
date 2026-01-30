import React, { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '../features/hooks';
import { fetchMyRefunds } from '../features/payment/paymentSlice';
import { PaymentStatusBadge } from '../components/payment/PaymentStatusBadge';
import { RotateCcw, Search } from 'lucide-react';

export const RefundHistory: React.FC = () => {
    const dispatch = useAppDispatch();
    const { myRefunds, loading } = useAppSelector(state => state.payment);

    useEffect(() => {
        dispatch(fetchMyRefunds({ limit: 50 }));
    }, [dispatch]);

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR'
        }).format(amount / 100);
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-IN', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    return (
        <div className="min-h-screen bg-primary/5 pb-20 pt-6 px-4">
            <div className="max-w-2xl mx-auto">
                <h1 className="text-2xl font-bold text-primary mb-6 flex items-center gap-2">
                    <RotateCcw className="w-6 h-6" />
                    Refund History
                </h1>

                {loading ? (
                    <div className="space-y-4">
                        {[1, 2, 3].map(i => (
                            <div key={i} className="bg-background h-24 rounded-xl animate-pulse" />
                        ))}
                    </div>
                ) : myRefunds.length === 0 ? (
                        <div className="text-center py-12 bg-background rounded-2xl shadow-sm border border-primary/10">
                            <Search className="w-12 h-12 text-secondary/30 mx-auto mb-4" />
                            <p className="text-secondary font-medium">No refunds found</p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {myRefunds.map(refund => (
                            <div key={refund._id} className="bg-background p-4 rounded-xl border border-primary/10 shadow-sm">
                                <div className="flex items-center justify-between mb-3">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full bg-blue-500/10 flex items-center justify-center">
                                            <RotateCcw className="w-5 h-5 text-blue-600" />
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium text-primary">{refund.reason}</p>
                                            <p className="text-xs text-secondary">{formatDate(refund.initiatedAt)}</p>
                                        </div>
                                    </div>
                                    <PaymentStatusBadge status={refund.status} size="sm" />
                                </div>

                                <div className="flex items-center justify-between pl-13">
                                    <p className="text-xs text-secondary">Refund ID: {refund.refundNumber}</p>
                                    <p className="text-lg font-bold text-primary">
                                        {formatCurrency(refund.amount)}
                                    </p>
                                </div>
                                {refund.notes && (
                                    <p className="mt-3 text-xs text-secondary bg-primary/5 p-2 rounded-lg">
                                        {refund.notes}
                                    </p>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};
