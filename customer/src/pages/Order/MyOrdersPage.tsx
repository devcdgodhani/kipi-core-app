import React, { useEffect, useState } from 'react';
import { orderService } from '../../services/order.service';
import type { Order } from '../../types/order.types';
import { Loader2, Package, ArrowRight } from 'lucide-react';
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
            if (response && response.recordList) {
                setOrders(response.recordList);
            } else if (Array.isArray(response)) {
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
            <div className="flex justify-center items-center py-20">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div className="space-y-8">
            <h1 className="text-2xl font-black text-primary uppercase tracking-tight">Order Protocol</h1>

            {orders.length === 0 ? (
                <div className="bg-background rounded-2xl p-12 text-center shadow-sm">
                    <div className="w-16 h-16 bg-primary/5 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Package className="w-8 h-8 text-secondary" />
                    </div>
                    <h3 className="text-lg font-semibold text-primary mb-2">No orders yet</h3>
                    <p className="text-secondary mb-6">Start shopping to see your orders here.</p>
                    <button
                        onClick={() => navigate('/')}
                        className="px-6 py-2 bg-primary text-background rounded-lg font-medium hover:bg-primary/90 transition-all"
                    >
                        Start Shopping
                    </button>
                </div>
            ) : (
                <div className="space-y-4">
                    {orders.map((order) => (
                        <div key={order._id} className="bg-background rounded-xl p-6 shadow-sm border border-primary/10">
                            <div className="flex flex-col sm:flex-row justify-between sm:items-center mb-4 pb-4 border-b border-primary/10 gap-4">
                                <div>
                                    <p className="text-sm text-secondary mb-1">Order Number</p>
                                    <p className="font-mono font-bold text-primary">#{order.orderNumber || order._id.slice(-6).toUpperCase()}</p>
                                </div>
                                <div className="flex items-center gap-4">
                                    <div>
                                        <p className="text-sm text-secondary mb-1">Date</p>
                                        <p className="font-medium text-primary">
                                            {format(new Date(order.createdAt), 'MMM d, yyyy')}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-secondary mb-1">Total</p>
                                        <p className="font-bold text-primary text-lg">
                                            ₹{order.totalAmount.toFixed(2)}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-4">
                                {order.items.map((item, idx) => {
                                    const pId = item.productId && typeof item.productId === 'object' ? (item.productId as any)._id : item.productId;
                                    const sId = item.skuId && typeof item.skuId === 'object' ? (item.skuId as any)._id : item.skuId;
                                    const productUrl = pId ? `/products/${pId}${sId ? `?skuId=${sId}` : ''}` : '#';

                                    return (
                                        <div
                                            key={idx}
                                            className="flex items-center gap-4 cursor-pointer group/item"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                navigate(productUrl);
                                            }}
                                        >
                                            <div className="w-16 h-16 bg-primary/5 rounded-lg overflow-hidden flex-shrink-0 border border-primary/10 group-hover/item:border-primary/30 transition-colors">
                                                <img
                                                    src={item.image || '/placeholder-product.png'}
                                                    alt={item.name}
                                                    className="w-full h-full object-cover group-hover/item:scale-105 transition-transform"
                                                />
                                            </div>
                                            <div className="flex-1">
                                                <h4 className="font-medium text-primary line-clamp-1 group-hover/item:text-secondary transition-colors">{item.name}</h4>
                                                <p className="text-sm text-secondary">Qty: {item.quantity}</p>
                                            </div>
                                            <p className="font-medium text-primary">₹{item.total.toFixed(2)}</p>
                                        </div>
                                    );
                                })}
                            </div>

                            <div className="mt-4 pt-4 border-t border-primary/10 flex justify-between items-center">
                                <span className={`px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all ${order.orderStatus === 'DELIVERED' ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20' :
                                    order.orderStatus === 'CANCELLED' ? 'bg-rose-500/10 text-rose-600 border-rose-500/20' :
                                        'bg-primary/5 text-primary border-primary/10'
                                    }`}>
                                    {order.orderStatus}
                                </span>
                                <button
                                    onClick={() => navigate(`/orders/${order._id}`)}
                                    className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-secondary hover:text-primary transition-all group"
                                >
                                    Track Protocol
                                    <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default MyOrdersPage;
