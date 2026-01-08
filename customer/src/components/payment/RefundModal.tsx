import React, { useState } from 'react';
import { X, AlertCircle } from 'lucide-react';
import type { Payment } from '../../types/payment';

interface RefundModalProps {
    payment: Payment;
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (amount: number, reason: string, notes: string) => Promise<void>;
    isLoading?: boolean;
}

const REFUND_REASONS = [
    'Order Cancellation',
    'Product Returned',
    'Service Issue',
    'Duplicate Payment',
    'Other'
];

export const RefundModal: React.FC<RefundModalProps> = ({
    payment,
    isOpen,
    onClose,
    onSubmit,
    isLoading
}) => {
    const [amount, setAmount] = useState((payment.amount / 100).toString());
    const [reason, setReason] = useState(REFUND_REASONS[0]);
    const [notes, setNotes] = useState('');
    const [error, setError] = useState('');

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const parsedAmount = parseFloat(amount);

        if (isNaN(parsedAmount) || parsedAmount <= 0) {
            setError('Please enter a valid amount');
            return;
        }

        if (parsedAmount > payment.amount / 100) {
            setError('Refund amount cannot exceed payment amount');
            return;
        }

        try {
            await onSubmit(Math.round(parsedAmount * 100), reason, notes);
            onClose();
        } catch (err) {
            // Error handling is managed by parent
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <div className="bg-white rounded-2xl w-full max-w-md shadow-xl overflow-hidden animate-in fade-in zoom-in duration-200">
                <div className="p-4 border-b border-gray-100 flex items-center justify-between">
                    <h2 className="font-bold text-gray-900 text-lg">Initiate Refund</h2>
                    <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                        <X className="w-5 h-5 text-gray-500" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    {error && (
                        <div className="bg-red-50 text-red-600 text-sm p-3 rounded-lg flex items-center gap-2">
                            <AlertCircle className="w-4 h-4" />
                            {error}
                        </div>
                    )}

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Refund Amount ({payment.currency})
                        </label>
                        <input
                            type="number"
                            step="0.01"
                            value={amount}
                            onChange={(e) => {
                                setAmount(e.target.value);
                                setError('');
                            }}
                            className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none transition-all"
                        />
                        <p className="text-xs text-gray-500 mt-1">
                            Max refundable: {(payment.amount / 100).toFixed(2)}
                        </p>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Reason</label>
                        <select
                            value={reason}
                            onChange={(e) => setReason(e.target.value)}
                            className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:border-primary outline-none transition-all appearance-none bg-white"
                        >
                            {REFUND_REASONS.map(r => (
                                <option key={r} value={r}>{r}</option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Notes (Optional)</label>
                        <textarea
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            rows={3}
                            className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none transition-all resize-none"
                            placeholder="Additional details..."
                        />
                    </div>

                    <div className="pt-2">
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full bg-primary text-white font-bold py-3 rounded-xl hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                        >
                            {isLoading ? 'Processing...' : 'Confirm Refund'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};
