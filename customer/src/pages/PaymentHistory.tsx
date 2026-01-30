import React, { useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from '../features/hooks';
import { fetchMyPayments, initiateRefund } from '../features/payment/paymentSlice';
import { PaymentCard } from '../components/payment/PaymentCard';
import { RefundModal } from '../components/payment/RefundModal';
import type { Payment } from '../types/payment';
import { History, Search, Filter } from 'lucide-react';
import toast from 'react-hot-toast';

export const PaymentHistory: React.FC = () => {
    const dispatch = useAppDispatch();
    const { myPayments, loading, refundInitiating } = useAppSelector(state => state.payment);

    const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);
    const [showRefundModal, setShowRefundModal] = useState(false);
    const [filter, setFilter] = useState('ALL');

    useEffect(() => {
        dispatch(fetchMyPayments({ limit: 50 }));
    }, [dispatch]);

    const handleRefundClick = (payment: Payment) => {
        if (payment.status !== 'SUCCESS') {
            toast.error('Only successful payments can be refunded');
            return;
        }
        setSelectedPayment(payment);
        setShowRefundModal(true);
    };

    const handleRefundSubmit = async (amount: number, reason: string, notes: string) => {
        if (!selectedPayment) return;

        try {
            await dispatch(initiateRefund({
                paymentId: selectedPayment._id,
                amount,
                reason,
                notes
            })).unwrap();

            toast.success('Refund initiated successfully');
            setShowRefundModal(false);
            setSelectedPayment(null);
        } catch (err: any) {
            toast.error(err || 'Failed to initiate refund');
        }
    };

    const filteredPayments = myPayments.filter(payment => {
        if (filter === 'ALL') return true;
        return payment.status === filter;
    });

    return (
        <div className="min-h-screen bg-background/50 pb-20 pt-6 px-4">
            <div className="max-w-2xl mx-auto">
                <div className="flex items-center justify-between mb-6">
                    <h1 className="text-2xl font-bold text-primary flex items-center gap-2">
                        <History className="w-6 h-6" />
                        Payment History
                    </h1>

                    <div className="relative">
                        <Filter className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-secondary/50" />
                        <select
                            value={filter}
                            onChange={(e) => setFilter(e.target.value)}
                            className="pl-9 pr-8 py-2 bg-background border border-primary/10 rounded-xl text-sm font-medium focus:outline-none focus:border-primary appearance-none text-primary"
                        >
                            <option value="ALL">All Status</option>
                            <option value="SUCCESS">Success</option>
                            <option value="PENDING">Pending</option>
                            <option value="FAILED">Failed</option>
                            <option value="REFUNDED">Refunded</option>
                        </select>
                    </div>
                </div>

                {loading ? (
                    <div className="space-y-4">
                        {[1, 2, 3].map(i => (
                            <div key={i} className="bg-primary/5 h-24 rounded-xl animate-pulse" />
                        ))}
                    </div>
                ) : filteredPayments.length === 0 ? (
                        <div className="text-center py-12 bg-background rounded-2xl shadow-sm border border-primary/10">
                            <Search className="w-12 h-12 text-secondary/20 mx-auto mb-4" />
                            <p className="text-secondary/50 font-medium">No payments found</p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {filteredPayments.map(payment => (
                            <PaymentCard
                                key={payment._id}
                                payment={payment}
                                onClick={() => handleRefundClick(payment)}
                            />
                        ))}
                    </div>
                )}

                {selectedPayment && (
                    <RefundModal
                        isOpen={showRefundModal}
                        payment={selectedPayment}
                        onClose={() => setShowRefundModal(false)}
                        onSubmit={handleRefundSubmit}
                        isLoading={refundInitiating}
                    />
                )}
            </div>
        </div>
    );
};
