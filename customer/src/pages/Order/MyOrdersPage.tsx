import React, { useEffect, useState } from 'react';
import { orderService } from '../../services/order.service';
import type { Order } from '../../types/order.types';
import { Loader2, Package } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';

const MyOrdersPage: React.FC = () => {
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        loadOrders();
    }, []);

    const loadOrders = async () => {
        try {
            const response = await orderService.getMyOrders();
            // Backend returns pagination object in data
            // If response is the pagination object:
            if (response && response.recordList) {
                setOrders(response.recordList);
            } else if (Array.isArray(response)) {
                // Fallback if backend implementation changes to return array directly
                setOrders(response);
            }
        } catch (error) {
            console.error('Failed to load orders:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex justify-center items-center">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="max-w-4xl mx-auto px-4 sm:px-6">
                <h1 className="text-2xl font-bold text-gray-900 mb-6">My Orders</h1>

                {orders.length === 0 ? (
                    <div className="bg-white rounded-2xl p-12 text-center shadow-sm">
                        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Package className="w-8 h-8 text-gray-400" />
                        </div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">No orders yet</h3>
                        <p className="text-gray-500 mb-6">Start shopping to see your orders here.</p>
                        <button
                            onClick={() => navigate('/')}
                            className="px-6 py-2 bg-primary text-white rounded-lg font-medium hover:bg-primary/90 transition-all"
                        >
                            Start Shopping
                        </button>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {orders.map((order) => (
                            <div key={order._id} className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                                <div className="flex flex-col sm:flex-row justify-between sm:items-center mb-4 pb-4 border-b border-gray-100 gap-4">
                                    <div>
                                        <p className="text-sm text-gray-500 mb-1">Order Number</p>
                                        <p className="font-mono font-bold text-gray-900">#{order.orderNumber || order._id.slice(-6).toUpperCase()}</p>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <div>
                                            <p className="text-sm text-gray-500 mb-1">Date</p>
                                            <p className="font-medium text-gray-900">
                                                {format(new Date(order.createdAt), 'MMM d, yyyy')}
                                            </p>
                                        </div>
                                        <div>
                                            <p className="text-sm text-gray-500 mb-1">Total</p>
                                            <p className="font-bold text-primary text-lg">
                                                ₹{order.totalAmount.toFixed(2)}
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    {order.items.map((item, idx) => (
                                        <div key={idx} className="flex items-center gap-4">
                                            <div className="w-16 h-16 bg-gray-50 rounded-lg overflow-hidden flex-shrink-0">
                                                <img
                                                    src={item.image || '/placeholder-product.png'}
                                                    alt={item.name}
                                                    className="w-full h-full object-cover"
                                                />
                                            </div>
                                            <div className="flex-1">
                                                <h4 className="font-medium text-gray-900 line-clamp-1">{item.name}</h4>
                                                <p className="text-sm text-gray-500">Qty: {item.quantity}</p>
                                            </div>
                                            <p className="font-medium text-gray-900">₹{item.total.toFixed(2)}</p>
                                        </div>
                                    ))}
                                </div>

                                <div className="mt-4 pt-4 border-t border-gray-100 flex justify-between items-center">
                                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${order.orderStatus === 'DELIVERED' ? 'bg-green-100 text-green-700' :
                                            order.orderStatus === 'CANCELLED' ? 'bg-red-100 text-red-700' :
                                                'bg-blue-100 text-blue-700'
                                        }`}>
                                        {order.orderStatus}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default MyOrdersPage;
