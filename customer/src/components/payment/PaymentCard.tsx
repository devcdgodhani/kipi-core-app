import React from 'react';
import type { Payment } from '../../types/payment';
import { PaymentStatusBadge } from './PaymentStatusBadge';
import { ChevronRight, CreditCard } from 'lucide-react';

interface PaymentCardProps {
    payment: Payment;
    onClick?: (payment: Payment) => void;
}

export const PaymentCard: React.FC<PaymentCardProps> = ({ payment, onClick }) => {
    const formatCurrency = (amount: number, currency: string) => {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: currency
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
        <div
            onClick={() => onClick && onClick(payment)}
            className={`
        bg-background p-4 rounded-xl border border-primary/10 hover:border-primary/20 hover:shadow-sm transition-all
        ${onClick ? 'cursor-pointer group' : ''}
      `}
        >
            <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-primary/5 flex items-center justify-center">
                        <CreditCard className="w-5 h-5 text-secondary" />
                    </div>
                    <div>
                        <p className="text-sm font-medium text-primary uppercase">{payment.gatewayName}</p>
                        <p className="text-xs text-secondary">{formatDate(payment.createdAt)}</p>
                    </div>
                </div>
                <PaymentStatusBadge status={payment.status} size="sm" />
            </div>

            <div className="flex items-center justify-between">
                <div>
                    <p className="text-xs text-secondary uppercase tracking-wider mb-0.5">Amount</p>
                    <p className="text-lg font-bold text-primary">
                        {formatCurrency(payment.amount, payment.currency)}
                    </p>
                </div>
                {onClick && (
                    <ChevronRight className="w-5 h-5 text-secondary/30 group-hover:text-primary transition-colors" />
                )}
            </div>
        </div>
    );
};
