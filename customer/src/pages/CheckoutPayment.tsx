import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../features/hooks';
import { fetchEnabledGateways, initiatePayment } from '../features/payment/paymentSlice';
import { GatewaySelector } from '../components/payment/GatewaySelector';
import { ShieldCheck, AlertCircle, ArrowLeft } from 'lucide-react';
import toast from 'react-hot-toast';

export const CheckoutPayment: React.FC = () => {
    const { orderId } = useParams<{ orderId: string }>();
    const navigate = useNavigate();
    const dispatch = useAppDispatch();

    const { gateways, loading, paymentInitiating, error } = useAppSelector(state => state.payment);
    const [selectedGateway, setSelectedGateway] = useState<string>('');

    useEffect(() => {
        console.log('CheckoutPayment page mounted, Order ID:', orderId);
        dispatch(fetchEnabledGateways());
    }, [dispatch, orderId]);

    const handlePayment = async () => {
        if (!selectedGateway || !orderId) return;

        try {
            const result = await dispatch(initiatePayment({
                orderId,
                gatewayName: selectedGateway
            })).unwrap();

            if (result.redirectUrl) {
                if (result.redirectMethod === 'POST') {
                    // Create form and submit
                    const form = document.createElement('form');
                    form.method = 'POST';
                    form.action = result.redirectUrl;

                    // Add txnToken if present (Paytm specific)
                    if (result.data?.txnToken) {
                        const input = document.createElement('input');
                        input.type = 'hidden';
                        input.name = 'txnToken';
                        input.value = result.data.txnToken;
                        form.appendChild(input);
                    }

                    // Add mid if present
                    if (result.data?.mid) {
                        const input = document.createElement('input');
                        input.type = 'hidden';
                        input.name = 'mid';
                        input.value = result.data.mid;
                        form.appendChild(input);
                    }

                    // Add orderId
                    const inputOrder = document.createElement('input');
                    inputOrder.type = 'hidden';
                    inputOrder.name = 'orderId';
                    inputOrder.value = result.orderId;
                    form.appendChild(inputOrder);

                    document.body.appendChild(form);
                    form.submit();
                } else {
                    window.location.href = result.redirectUrl;
                }
            } else {
                toast.error('Payment initiation failed: No redirect URL');
            }
        } catch (err: any) {
            toast.error(err || 'Failed to initiate payment');
        }
    };

    if (loading && gateways.length === 0) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-primary/5 py-8 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md mx-auto">
                <button
                    onClick={() => navigate(-1)}
                    className="flex items-center text-secondary hover:text-primary mb-6 transition-colors"
                >
                    <ArrowLeft className="w-5 h-5 mr-2" />
                    Back to Order
                </button>

                <div className="bg-background rounded-2xl shadow-sm p-6 mb-6">
                    <div className="flex items-center justify-between mb-6">
                        <h1 className="text-xl font-bold text-primary">Select Payment Method</h1>
                        <ShieldCheck className="w-6 h-6 text-green-600" />
                    </div>

                    {error && (
                        <div className="mb-6 bg-red-50 text-red-600 p-4 rounded-xl flex items-center gap-3 text-sm">
                            <AlertCircle className="w-5 h-5 flex-shrink-0" />
                            {error}
                        </div>
                    )}

                    <GatewaySelector
                        gateways={gateways}
                        selectedGateway={selectedGateway}
                        onSelect={setSelectedGateway}
                        disabled={paymentInitiating}
                    />
                </div>

                <button
                    onClick={handlePayment}
                    disabled={!selectedGateway || paymentInitiating}
                    className={`
            w-full py-4 rounded-xl font-bold text-background shadow-lg transition-all
            ${!selectedGateway || paymentInitiating
                        ? 'bg-secondary/20 cursor-not-allowed transform-none'
                            : 'bg-primary hover:bg-primary/90 hover:scale-[1.02] shadow-primary/30'
                        }
          `}
                >
                    {paymentInitiating ? (
                        <div className="flex items-center justify-center gap-2">
                            <div className="w-5 h-5 border-2 border-background/30 border-t-background rounded-full animate-spin" />
                            Processing...
                        </div>
                    ) : (
                        'Proceed to Pay'
                    )}
                </button>

                <p className="text-center text-xs text-secondary mt-6">
                    Your payment information is encrypted and secure.
                </p>
            </div>
        </div>
    );
};
