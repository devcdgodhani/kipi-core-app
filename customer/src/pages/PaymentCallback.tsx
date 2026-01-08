import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { paymentService } from '../services/paymentService';
import { CheckCircle2, XCircle, Loader2, ArrowRight, ShoppingBag } from 'lucide-react';
import { ROUTES } from '../routes/routeConfig';

const PaymentCallback: React.FC = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const [status, setStatus] = useState<'LOADING' | 'SUCCESS' | 'FAILED'>('LOADING');
    const [message, setMessage] = useState('Verifying your payment...');

    const orderId = searchParams.get('orderId');

    useEffect(() => {
        let isMounted = true;
        const verify = async () => {
            if (!orderId) {
                if (isMounted) {
                    setStatus('FAILED');
                    setMessage('Invalid request: Missing order ID');
                }
                return;
            }

            try {
                let attempts = 0;
                const maxAttempts = 5;

                const checkStatus = async () => {
                    const payments = await paymentService.getPaymentsByOrder(orderId);
                    if (payments && payments.length > 0) {
                        const latestPayment = payments[0];
                        if (latestPayment.status === 'SUCCESS') {
                            if (isMounted) {
                                setStatus('SUCCESS');
                                setMessage('Payment successful! Your order has been confirmed.');
                            }
                            return true;
                        } else if (latestPayment.status === 'FAILED') {
                            if (isMounted) {
                                setStatus('FAILED');
                                setMessage('Payment failed. Please try again or choose another payment method.');
                            }
                            return true;
                        }
                    }
                    return false;
                };

                const poll = async () => {
                    const done = await checkStatus();
                    if (!done && attempts < maxAttempts) {
                        attempts++;
                        if (isMounted) setTimeout(poll, 3000);
                    } else if (!done && isMounted) {
                        setStatus('FAILED');
                        setMessage('Payment verification timed out. Please check your order history.');
                    }
                };

                poll();

            } catch (err) {
                console.error(err);
                if (isMounted) {
                    setStatus('FAILED');
                    setMessage('An error occurred while verifying your payment.');
                }
            }
        };

        verify();
        return () => { isMounted = false; };
    }, [orderId]);

    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
            <div className="max-w-md w-full bg-white rounded-3xl shadow-xl p-8 text-center border border-gray-100">
                {status === 'LOADING' && (
                    <div className="space-y-6">
                        <div className="relative w-20 h-20 mx-auto">
                            <div className="absolute inset-0 border-4 border-primary/20 rounded-full"></div>
                            <Loader2 className="w-20 h-20 text-primary animate-spin" />
                        </div>
                        <div>
                            <h2 className="text-2xl font-bold text-gray-900">Checking Status</h2>
                            <p className="text-gray-500 mt-2">{message}</p>
                        </div>
                    </div>
                )}

                {status === 'SUCCESS' && (
                    <div className="space-y-6 animate-in fade-in zoom-in duration-500">
                        <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto text-green-600">
                            <CheckCircle2 size={48} />
                        </div>
                        <div>
                            <h2 className="text-2xl font-bold text-gray-900">Payment Success!</h2>
                            <p className="text-gray-500 mt-2 leading-relaxed">{message}</p>
                        </div>
                        <div className="space-y-3 pt-4">
                            <button
                                onClick={() => navigate(ROUTES.ORDERS)}
                                className="w-full py-4 bg-primary text-white rounded-2xl font-black uppercase tracking-widest hover:bg-primary/90 transition-all shadow-xl shadow-primary/20 flex items-center justify-center gap-2"
                            >
                                View Order <ArrowRight size={20} />
                            </button>
                            <button
                                onClick={() => navigate(ROUTES.PRODUCTS.ROOT)}
                                className="w-full py-4 bg-gray-100 text-gray-900 rounded-2xl font-bold hover:bg-gray-200 transition-all flex items-center justify-center gap-2"
                            >
                                <ShoppingBag size={20} /> Continue Shopping
                            </button>
                        </div>
                    </div>
                )}

                {status === 'FAILED' && (
                    <div className="space-y-6 animate-in fade-in zoom-in duration-500">
                        <div className="w-24 h-24 bg-red-100 rounded-full flex items-center justify-center mx-auto text-red-600">
                            <XCircle size={48} />
                        </div>
                        <div>
                            <h2 className="text-2xl font-bold text-gray-900">Payment Failed</h2>
                            <p className="text-gray-500 mt-2 leading-relaxed">{message}</p>
                        </div>
                        <div className="space-y-3 pt-4">
                            <button
                                onClick={() => navigate(`${ROUTES.PAYMENT.CHECKOUT.replace(':orderId', orderId!)}`)}
                                className="w-full py-4 bg-primary text-white rounded-2xl font-black uppercase tracking-widest hover:bg-primary/90 transition-all shadow-xl shadow-primary/20"
                            >
                                Try Again
                            </button>
                            <button
                                onClick={() => navigate(ROUTES.ROOT)}
                                className="w-full py-4 bg-gray-100 text-gray-900 rounded-2xl font-bold hover:bg-gray-200 transition-all"
                            >
                                Back to Home
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default PaymentCallback;
