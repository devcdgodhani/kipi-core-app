import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    ChevronLeft,
    Package,
    Truck,
    CheckCircle2,
    Clock,
    MapPin,
    CreditCard,
    FileText,
    Loader2,
    AlertCircle,
    ArrowRight,
    RotateCcw
} from 'lucide-react';
import { orderService } from '../../services/order.service';
import { ReturnRequestModal } from '../../components/return/ReturnRequestModal';
import type { Order } from '../../types/order.types';
import { format } from 'date-fns';

const OrderDetailPage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [order, setOrder] = useState<Order | null>(null);
    const [loading, setLoading] = useState(true);
    const [isReturnModalOpen, setIsReturnModalOpen] = useState(false);

    useEffect(() => {
        if (id) {
            loadOrderDetails();
        }
    }, [id]);

    const loadOrderDetails = async () => {
        try {
            setLoading(true);
            const response = await orderService.getById(id!);
            if (response) {
                setOrder(response);
            }
        } catch (error) {
            console.error('Failed to load order details:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex flex-col justify-center items-center gap-4 bg-gray-50">
                <Loader2 className="w-10 h-10 animate-spin text-primary" />
                <p className="text-gray-500 font-medium animate-pulse">Syncing Order Ledger...</p>
            </div>
        );
    }

    if (!order) {
        return (
            <div className="min-h-screen flex flex-col justify-center items-center bg-gray-50 p-6 text-center">
                <div className="w-20 h-20 bg-rose-50 rounded-full flex items-center justify-center mb-6">
                    <AlertCircle className="w-10 h-10 text-rose-500" />
                </div>
                <h1 className="text-2xl font-bold text-gray-900 mb-2">Order Not Found</h1>
                <p className="text-gray-500 mb-8 max-w-sm">We couldn't locate the order details you're looking for. It might have been archived or moved.</p>
                <button
                    onClick={() => navigate('/orders')}
                    className="px-8 py-3 bg-primary text-white rounded-xl font-bold shadow-lg shadow-primary/20 hover:scale-105 transition-all"
                >
                    Back to My Orders
                </button>
            </div>
        );
    }

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'DELIVERED': return 'text-emerald-500 bg-emerald-50 border-emerald-100';
            case 'CANCELLED': return 'text-rose-500 bg-rose-50 border-rose-100';
            case 'SHIPPED': return 'text-indigo-500 bg-indigo-50 border-indigo-100';
            default: return 'text-primary bg-primary/5 border-primary/10';
        }
    };

    const steps = [
        { status: 'PENDING', icon: Clock, label: 'Order Placed' },
        { status: 'CONFIRMED', icon: CheckCircle2, label: 'Confirmed' },
        { status: 'PROCESSING', icon: Package, label: 'Processing' },
        { status: 'SHIPPED', icon: Truck, label: 'Out for Delivery' },
        { status: 'DELIVERED', icon: CheckCircle2, label: 'Delivered' }
    ];

    const currentStepIndex = steps.findIndex(s => s.status === order.orderStatus);

    return (
        <div className="min-h-screen bg-gray-50/50 pb-20">
            {/* Header */}
            <div className="bg-white border-b border-gray-100 sticky top-0 z-20">
                <div className="max-w-5xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => navigate('/orders')}
                            className="p-2 hover:bg-gray-100 rounded-lg transition-colors text-gray-500"
                        >
                            <ChevronLeft size={24} />
                        </button>
                        <h1 className="text-lg font-bold text-gray-900">Order Details</h1>
                    </div>
                    <div className="flex items-center gap-4">
                        <div className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border ${getStatusColor(order.orderStatus)}`}>
                            {order.orderStatus}
                        </div>
                        {order.orderStatus === 'DELIVERED' && (
                            <button
                                onClick={() => setIsReturnModalOpen(true)}
                                className="flex items-center gap-2 px-4 py-1.5 bg-rose-50 text-rose-600 border border-rose-100 rounded-full text-[10px] font-black uppercase tracking-widest hover:bg-rose-100 transition-all font-bold"
                            >
                                <RotateCcw size={12} />
                                Request Return
                            </button>
                        )}
                    </div>
                </div>
            </div>

            <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 space-y-8">
                {/* Fulfillment Timeline */}
                <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100 overflow-hidden relative group">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -mr-16 -mt-16 blur-3xl transition-colors group-hover:bg-primary/10" />

                    <h2 className="text-sm font-black text-gray-900 uppercase tracking-widest mb-10 flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                            <Truck size={18} />
                        </div>
                        Fulfillment Progress
                    </h2>

                    <div className="relative">
                        <div className="absolute top-5 left-5 right-5 h-0.5 bg-gray-100 -z-0" />
                        <div
                            className="absolute top-5 left-5 h-0.5 bg-primary transition-all duration-1000 ease-out"
                            style={{ width: `${(currentStepIndex / (steps.length - 1)) * 100}%` }}
                        />

                        <div className="flex justify-between relative z-10">
                            {steps.map((step, idx) => {
                                const isCompleted = idx <= currentStepIndex;
                                const isActive = idx === currentStepIndex;
                                return (
                                    <div key={idx} className="flex flex-col items-center">
                                        <div className={`w-10 h-10 rounded-full flex items-center justify-center border-4 transition-all duration-500 ${isCompleted ? 'bg-primary border-primary text-white' : 'bg-white border-gray-100 text-gray-300'
                                            } ${isActive ? 'ring-4 ring-primary/20 scale-110' : ''}`}>
                                            <step.icon size={18} />
                                        </div>
                                        <span className={`mt-3 text-[10px] font-bold uppercase tracking-tight text-center max-w-[80px] ${isCompleted ? 'text-primary' : 'text-gray-400'
                                            }`}>
                                            {step.label}
                                        </span>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {order.timeline && order.timeline.length > 0 && (
                        <div className="mt-12 pt-8 border-t border-gray-50 space-y-4">
                            {order.timeline.slice().reverse().map((event, idx) => (
                                <div key={idx} className="flex gap-4">
                                    <div className="flex flex-col items-center gap-1">
                                        <div className={`w-2 h-2 rounded-full mt-1.5 ${idx === 0 ? 'bg-primary animate-ping' : 'bg-gray-200'}`} />
                                        <div className="w-0.5 h-full bg-gray-50 last:hidden" />
                                    </div>
                                    <div className="flex-1 pb-4">
                                        <div className="flex justify-between items-start mb-1">
                                            <p className="text-xs font-black text-gray-900 uppercase tracking-tight">{event.message}</p>
                                            <p className="text-[10px] font-bold text-gray-400 uppercase">{format(new Date(event.timestamp), 'MMM d, h:mm a')}</p>
                                        </div>
                                        <p className="text-[10px] font-medium text-gray-500 uppercase tracking-wider">{event.status}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Items and Summary */}
                    <div className="lg:col-span-2 space-y-8">
                        <section className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
                            <h2 className="text-sm font-black text-gray-900 uppercase tracking-widest mb-6 flex items-center gap-2">
                                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                                    <Package size={18} />
                                </div>
                                Order Manifest
                            </h2>
                            <div className="space-y-6">
                                {order.items.map((item, idx) => (
                                    <div key={idx} className="flex items-center gap-6 group">
                                        <div className="w-24 h-24 bg-gray-50 rounded-2xl overflow-hidden flex-shrink-0 border border-gray-100 group-hover:shadow-lg transition-all duration-300">
                                            <img
                                                src={item.image || '/placeholder-product.png'}
                                                alt={item.name}
                                                className="w-full h-full object-cover"
                                            />
                                        </div>
                                        <div className="flex-1">
                                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 mb-2">
                                                <h3 className="font-bold text-gray-900 leading-tight group-hover:text-primary transition-colors">{item.name}</h3>
                                                <p className="font-black text-gray-900">₹{item.total.toLocaleString()}</p>
                                            </div>
                                            <div className="flex items-center gap-4">
                                                <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest bg-gray-50 px-2 py-1 rounded">Qty: {item.quantity}</span>
                                                {item.skuId && <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest font-mono">SKU-{(item.skuId as any)?.toString().slice(-6).toUpperCase()}</span>}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className="mt-8 pt-8 border-t border-gray-100 space-y-3">
                                <div className="flex justify-between text-sm text-gray-500 font-medium">
                                    <span>Subtotal</span>
                                    <span>₹{order.subTotal.toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between text-sm text-gray-500 font-medium">
                                    <span>Shipping</span>
                                    <span className={order.shippingCost === 0 ? 'text-emerald-500 font-bold' : ''}>
                                        {order.shippingCost === 0 ? 'FREE' : `₹${order.shippingCost}`}
                                    </span>
                                </div>
                                {order.tax > 0 && (
                                    <div className="flex justify-between text-sm text-gray-500 font-medium">
                                        <span>Estimated GST</span>
                                        <span>₹{order.tax.toLocaleString()}</span>
                                    </div>
                                )}
                                <div className="flex justify-between pt-4 border-t border-gray-100">
                                    <span className="text-base font-black text-gray-900 uppercase tracking-widest">Total</span>
                                    <div className="flex flex-col items-end">
                                        <span className="text-xl font-black text-primary">₹{order.totalAmount.toLocaleString()}</span>
                                        <span className="text-[10px] font-bold text-gray-400 mt-1 italic">via {order.paymentMethod}</span>
                                    </div>
                                </div>
                            </div>
                        </section>
                    </div>

                    {/* Metadata Sidebars */}
                    <div className="space-y-8">
                        <section className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
                            <h2 className="text-sm font-black text-gray-900 uppercase tracking-widest mb-6 flex items-center gap-2">
                                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                                    <MapPin size={18} />
                                </div>
                                Delivery Node
                            </h2>
                            <div className="space-y-1">
                                <p className="text-sm font-black text-gray-900">{order.shippingAddress.name}</p>
                                <p className="text-xs font-bold text-gray-500 leading-relaxed">
                                    {order.shippingAddress.street}, {order.shippingAddress.landmark && `${order.shippingAddress.landmark}, `}
                                    {order.shippingAddress.city}, {order.shippingAddress.state} - {order.shippingAddress.pincode}
                                </p>
                                <div className="mt-4 pt-4 border-t border-gray-50 flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center text-gray-400">
                                        <Clock size={14} />
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none mb-1">Mobile Payload</span>
                                        <span className="text-xs font-black text-gray-900">{order.shippingAddress.mobile}</span>
                                    </div>
                                </div>
                            </div>
                        </section>

                        <section className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
                            <h2 className="text-sm font-black text-gray-900 uppercase tracking-widest mb-6 flex items-center gap-2">
                                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                                    <CreditCard size={18} />
                                </div>
                                Settlement
                            </h2>
                            <div className="space-y-4">
                                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-2xl border border-gray-100">
                                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Protocol</span>
                                    <span className="text-xs font-black text-gray-900">{order.paymentMethod}</span>
                                </div>
                                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-2xl border border-gray-100">
                                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">State</span>
                                    <span className={`text-xs font-black ${order.paymentStatus === 'COMPLETED' ? 'text-emerald-500' : 'text-amber-500'}`}>
                                        {order.paymentStatus}
                                    </span>
                                </div>
                            </div>
                        </section>

                        <div className="px-4">
                            <button
                                className="w-full flex items-center justify-center gap-3 py-4 bg-gray-900 text-white rounded-2xl font-black uppercase text-[10px] tracking-widest hover:bg-black transition-all shadow-xl shadow-gray-200"
                            >
                                <FileText size={18} />
                                Digital Invoice
                                <ArrowRight size={14} className="ml-2" />
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <ReturnRequestModal
                isOpen={isReturnModalOpen}
                onClose={() => setIsReturnModalOpen(false)}
                order={order}
                onSuccess={loadOrderDetails}
            />
        </div>
    );
};

export default OrderDetailPage;
