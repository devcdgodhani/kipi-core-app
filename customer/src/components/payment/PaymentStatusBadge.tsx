import React from 'react';
import { CheckCircle2, XCircle, Clock, AlertCircle, RotateCcw } from 'lucide-react';

interface PaymentStatusBadgeProps {
    status: string;
    size?: 'sm' | 'md' | 'lg';
}

export const PaymentStatusBadge: React.FC<PaymentStatusBadgeProps> = ({ status, size = 'md' }) => {
    const getStatusConfig = (status: string) => {
        switch (status) {
            case 'SUCCESS':
                return {
                    icon: CheckCircle2,
                    color: 'text-emerald-600 bg-emerald-500/10 border-emerald-500/20',
                    label: 'Success'
                };
            case 'FAILED':
                return {
                    icon: XCircle,
                    color: 'text-rose-600 bg-rose-500/10 border-rose-500/20',
                    label: 'Failed'
                };
            case 'PENDING':
            case 'INITIATED':
                return {
                    icon: Clock,
                    color: 'text-amber-600 bg-amber-500/10 border-amber-500/20',
                    label: 'Pending'
                };
            case 'REFUNDED':
                return {
                    icon: RotateCcw,
                    color: 'text-blue-600 bg-blue-500/10 border-blue-500/20',
                    label: 'Refunded'
                };
            case 'PARTIAL_REFUND':
                return {
                    icon: RotateCcw,
                    color: 'text-blue-600 bg-blue-500/10 border-blue-500/20',
                    label: 'Partially Refunded'
                };
            default:
                return {
                    icon: AlertCircle,
                    color: 'text-secondary bg-primary/5 border-primary/10',
                    label: status
                };
        }
    };

    const config = getStatusConfig(status);
    const Icon = config.icon;

    const sizeClasses = {
        sm: 'px-2 py-0.5 text-xs gap-1',
        md: 'px-3 py-1 text-sm gap-1.5',
        lg: 'px-4 py-2 text-base gap-2'
    };

    const iconSizes = {
        sm: 'w-3 h-3',
        md: 'w-4 h-4',
        lg: 'w-5 h-5'
    };

    return (
        <div className={`
      inline-flex items-center font-medium rounded-full border
      ${config.color} ${sizeClasses[size]}
    `}>
            <Icon className={iconSizes[size]} />
            <span>{config.label}</span>
        </div>
    );
};
