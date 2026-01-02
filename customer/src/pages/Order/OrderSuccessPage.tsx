import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { CheckCircle } from 'lucide-react';

const OrderSuccessPage: React.FC = () => {
    const navigate = useNavigate();
    const { orderId } = useParams();

    return (
        <div className="min-h-[60vh] flex flex-col justify-center items-center bg-gray-50 px-4 py-12">
            <div className="bg-white p-8 rounded-2xl shadow-sm text-center max-w-md w-full">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                    <CheckCircle className="w-8 h-8 text-green-600" />
                </div>

                <h1 className="text-2xl font-bold text-gray-900 mb-2">Order Placed Successfully!</h1>
                <p className="text-gray-500 mb-6">
                    Thank you for your purchase. Your order has been received and is being processed.
                </p>

                {orderId && (
                    <div className="bg-gray-50 py-3 px-4 rounded-lg mb-6">
                        <p className="text-sm text-gray-500 mb-1">Order Number (Ref)</p>
                        <p className="text-sm font-mono font-bold text-gray-900 overflow-hidden text-ellipsis">{orderId}</p>
                    </div>
                )}

                <div className="space-y-3">
                    <button
                        onClick={() => navigate('/orders')}
                        className="w-full py-3 bg-primary text-white rounded-xl font-bold hover:bg-primary/90 transition-colors"
                    >
                        View My Orders
                    </button>
                    <button
                        onClick={() => navigate('/')}
                        className="w-full py-3 text-gray-600 font-semibold hover:bg-gray-50 rounded-xl transition-colors"
                    >
                        Continue Shopping
                    </button>
                </div>
            </div>
        </div>
    );
};

export default OrderSuccessPage;
