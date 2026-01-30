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
    RotateCcw,
    Star,
    Wallet
} from 'lucide-react';
import { orderService } from '../../services/order.service';
import { ReviewSubmissionModal } from '../../components/review/ReviewSubmissionModal';
import { ReturnRequestModal } from '../../components/return/ReturnRequestModal';
import { returnService } from '../../services/returnService';
import type { Order } from '../../types/order.types';
import { format } from 'date-fns';
import { ROUTES } from '../../routes/routeConfig';

const OrderDetailPage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [order, setOrder] = useState<Order | null>(null);
    const [returns, setReturns] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [isReturnModalOpen, setIsReturnModalOpen] = useState(false);
    const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState<{ id: string; name: string } | null>(null);

    useEffect(() => {
        if (id) {
            loadOrderDetails();
        }
    }, [id]);

    const loadOrderDetails = async () => {
        try {
            setLoading(true);
            const [orderRes, returnsRes] = await Promise.all([
                orderService.getById(id!),
                returnService.getMyReturns({ orderId: id })
            ]);

            if (orderRes) setOrder(orderRes);
            if (returnsRes?.recordList) {
                // Filter returns for THIS order only and sort by date descending
                const filteredReturns = returnsRes.recordList
                    .filter((r: any) => String(r.orderId?._id || r.orderId) === String(id))
                    .sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
                setReturns(filteredReturns);
            }
        } catch (error) {
            console.error('Failed to load order details:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleReviewClick = (productId: string, productName: string) => {
        setSelectedProduct({ id: productId, name: productName });
        setIsReviewModalOpen(true);
    };

    if (loading) {
        return (
            <div className="min-h-screen flex flex-col justify-center items-center gap-4 bg-primary/5">
                <Loader2 className="w-10 h-10 animate-spin text-primary" />
                <p className="text-secondary font-medium animate-pulse">Syncing Order Ledger...</p>
            </div>
        );
    }

    if (!order) {
        return (
            <div className="min-h-screen flex flex-col justify-center items-center bg-primary/5 p-6 text-center">
                <div className="w-20 h-20 bg-rose-500/10 rounded-full flex items-center justify-center mb-6">
                    <AlertCircle className="w-10 h-10 text-rose-500" />
                </div>
                <h1 className="text-2xl font-bold text-primary mb-2">Order Not Found</h1>
                <p className="text-secondary mb-8 max-w-sm">We couldn't locate the order details you're looking for. It might have been archived or moved.</p>
                <button
                    onClick={() => navigate('/orders')}
                    className="px-8 py-3 bg-primary text-background rounded-xl font-bold shadow-lg shadow-primary/20 hover:scale-105 transition-all"
                >
                    Back to My Orders
                </button>
            </div>
        );
    }

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'DELIVERED': return 'text-emerald-600 bg-emerald-500/10 border-emerald-500/20';
            case 'CANCELLED': return 'text-rose-600 bg-rose-500/10 border-rose-500/20';
            case 'SHIPPED': return 'text-indigo-600 bg-indigo-500/10 border-indigo-500/20';
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
        <div className="min-h-screen bg-primary/5 pb-20">
            {/* Header */}
            <div className="bg-background border-b border-primary/10 sticky top-0 z-20">
                <div className="max-w-5xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => navigate('/orders')}
                            className="p-2 hover:bg-primary/5 rounded-lg transition-colors text-secondary"
                        >
                            <ChevronLeft size={24} />
                        </button>
                        <h1 className="text-lg font-bold text-primary">Order Details</h1>
                    </div>
                    <div className="flex items-center gap-4">
                        <div className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border ${getStatusColor(order.orderStatus)}`}>
                            {order.orderStatus}
                        </div>
                        {order.orderStatus?.toUpperCase() === 'DELIVERED' && !returns.filter(r => String(r.orderId?._id || r.orderId) === String(id)).some(r => r.status !== 'CANCELLED') && (
                            <button
                                onClick={() => setIsReturnModalOpen(true)}
                                className="flex items-center gap-2 px-4 py-1.5 bg-rose-500/10 text-rose-600 border border-rose-500/20 rounded-full text-[10px] font-black uppercase tracking-widest hover:bg-rose-500/20 transition-all font-bold"
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
                <div className="bg-background rounded-3xl p-8 shadow-sm border border-primary/10 overflow-hidden relative group">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -mr-16 -mt-16 blur-3xl transition-colors group-hover:bg-primary/10" />

                    <h2 className="text-sm font-black text-primary uppercase tracking-widest mb-10 flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                            <Truck size={18} />
                        </div>
                        Fulfillment Progress
                    </h2>

                    <div className="relative">
                        <div className="absolute top-5 left-5 right-5 h-0.5 bg-primary/10 -z-0" />
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
                                        <div className={`w-10 h-10 rounded-full flex items-center justify-center border-4 transition-all duration-500 ${isCompleted ? 'bg-primary border-primary text-background' : 'bg-background border-primary/10 text-secondary/30'
                                            } ${isActive ? 'ring-4 ring-primary/20 scale-110' : ''}`}>
                                            <step.icon size={18} />
                                        </div>
                                        <span className={`mt-3 text-[10px] font-bold uppercase tracking-tight text-center max-w-[80px] ${isCompleted ? 'text-primary' : 'text-secondary/50'
                                            }`}>
                                            {step.label}
                                        </span>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* ETA and Tracking if available */}
                    {(order.estimatedDelivery || order.awb) && (
                        <div className="mt-8 pt-6 border-t border-primary/10 grid grid-cols-1 md:grid-cols-2 gap-4">
                            {order.estimatedDelivery && (
                                <div className="bg-emerald-500/10 rounded-2xl p-4 flex items-center gap-4">
                                    <div className="w-10 h-10 rounded-xl bg-emerald-500 flex items-center justify-center text-white">
                                        <Clock size={20} />
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-black text-emerald-800 uppercase tracking-widest">Estimated Arrival</p>
                                        <p className="text-sm font-black text-emerald-900">{format(new Date(order.estimatedDelivery), 'EEEE, MMM do')}</p>
                                    </div>
                                </div>
                            )}
                            {order.awb && (
                                <div className="bg-indigo-500/10 rounded-2xl p-4 flex items-center justify-between">
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 rounded-xl bg-indigo-500 flex items-center justify-center text-white">
                                            <Package size={20} />
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-black text-indigo-800 uppercase tracking-widest">Tracking Number</p>
                                            <p className="text-sm font-black text-indigo-900 font-mono underline">{order.awb}</p>
                                        </div>
                                    </div>
                                    <button
                                        className="bg-background text-indigo-600 px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest border border-indigo-500/20 hover:bg-indigo-600 hover:text-white transition-all shadow-sm"
                                        onClick={() => window.open(`https://shiprocket.co/tracking/${order.awb}`, '_blank')}
                                    >
                                        Track
                                    </button>
                                </div>
                            )}
                        </div>
                    )}

                    {order.timeline && order.timeline.length > 0 && (
                        <div className="mt-12 pt-8 border-t border-primary/5 space-y-4">
                            {order.timeline.slice().reverse().map((event, idx) => (
                                <div key={idx} className="flex gap-4">
                                    <div className="flex flex-col items-center gap-1">
                                        <div className={`w-2 h-2 rounded-full mt-1.5 ${idx === 0 ? 'bg-primary animate-ping' : 'bg-primary/20'}`} />
                                        <div className="w-0.5 h-full bg-primary/5 last:hidden" />
                                    </div>
                                    <div className="flex-1 pb-4">
                                        <div className="flex justify-between items-start mb-1">
                                            <p className="text-xs font-black text-primary uppercase tracking-tight">{event.message}</p>
                                            <p className="text-[10px] font-bold text-secondary uppercase">{format(new Date(event.timestamp), 'MMM d, h:mm a')}</p>
                                        </div>
                                        <p className="text-[10px] font-medium text-secondary/70 uppercase tracking-wider">{event.status}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Items and Summary */}
                    <div className="lg:col-span-2 space-y-8">
                        <section className="bg-background rounded-3xl p-8 shadow-sm border border-primary/10">
                            <h2 className="text-sm font-black text-primary uppercase tracking-widest mb-6 flex items-center gap-2">
                                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                                    <Package size={18} />
                                </div>
                                Order Manifest
                            </h2>
                            <div className="space-y-6">
                                {order.items.map((item, idx) => (
                                    <div key={idx} className="flex items-center gap-6 group">
                                        <div className="w-24 h-24 bg-primary/5 rounded-2xl overflow-hidden flex-shrink-0 border border-primary/10 group-hover:shadow-lg transition-all duration-300">
                                            <img
                                                src={item.image || '/placeholder-product.png'}
                                                alt={item.name}
                                                className="w-full h-full object-cover"
                                            />
                                        </div>
                                        <div className="flex-1">
                                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 mb-2">
                                                <h3 className="font-bold text-primary leading-tight group-hover:text-primary transition-colors">{item.name}</h3>
                                                <p className="font-black text-primary">₹{item.total.toLocaleString()}</p>
                                            </div>
                                            <div className="flex items-center gap-4">
                                                <span className="text-[10px] font-black text-secondary uppercase tracking-widest bg-primary/5 px-2 py-1 rounded">Qty: {item.quantity}</span>
                                                {item.skuId && <span className="text-[10px] font-bold text-secondary uppercase tracking-widest font-mono">SKU-{(item.skuId as any)?.toString().slice(-6).toUpperCase()}</span>}
                                                {order.orderStatus === 'DELIVERED' && (
                                                    <button
                                                        onClick={() => handleReviewClick(item.productId as any, item.name)}
                                                        className="text-[10px] font-black text-primary uppercase tracking-widest hover:underline flex items-center gap-1"
                                                    >
                                                        <Star size={10} className="fill-primary" />
                                                        Rate Product
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className="mt-8 pt-8 border-t border-primary/10 space-y-3">
                                <div className="flex justify-between text-sm text-secondary font-medium">
                                    <span>Subtotal</span>
                                    <span>₹{order.subTotal.toLocaleString()}</span>
                                </div>

                                {/* Coupon Discount */}
                                {order.couponCode && order.discountAmount && order.discountAmount > 0 && (
                                    <div className="flex justify-between text-sm text-emerald-600 font-medium bg-emerald-500/10 -mx-2 px-2 py-2 rounded-lg">
                                        <span className="flex items-center gap-2">
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                                            </svg>
                                            Coupon ({order.couponCode})
                                        </span>
                                        <span className="font-bold">-₹{order.discountAmount.toLocaleString()}</span>
                                    </div>
                                )}

                                {/* Wallet Credit Used */}
                                {(order as any).walletAmountUsed && (order as any).walletAmountUsed > 0 && (
                                    <div className="flex justify-between text-sm text-amber-600 font-medium bg-amber-500/10 -mx-2 px-2 py-2 rounded-lg">
                                        <span className="flex items-center gap-2">
                                            <Wallet size={16} />
                                            Wallet Credit Used
                                        </span>
                                        <span className="font-bold">-₹{(order as any).walletAmountUsed.toLocaleString()}</span>
                                    </div>
                                )}

                                {/* Delivery Charges */}
                                <div className="flex justify-between text-sm text-secondary font-medium">
                                    <span className="flex items-center gap-2">
                                        <Truck size={14} />
                                        Delivery Charges
                                    </span>
                                    <span className={order.shippingCost === 0 ? 'text-emerald-500 font-bold' : ''}>
                                        {order.shippingCost === 0 ? 'FREE' : `₹${order.shippingCost.toLocaleString()}`}
                                    </span>
                                </div>

                                {/* Tax */}
                                {order.tax > 0 && (
                                    <div className="flex justify-between text-sm text-secondary font-medium">
                                        <span>Tax (GST)</span>
                                        <span>₹{order.tax.toLocaleString()}</span>
                                    </div>
                                )}

                                {/* Total */}
                                <div className="flex justify-between pt-4 border-t border-primary/10">
                                    <span className="text-base font-black text-primary uppercase tracking-widest">Total Amount</span>
                                    <div className="flex flex-col items-end">
                                        <span className="text-xl font-black text-primary">₹{order.totalAmount.toLocaleString()}</span>
                                        <span className="text-[10px] font-bold text-secondary mt-1 italic">via {order.paymentMethod}</span>
                                    </div>
                                </div>

                                {/* Savings Summary */}
                                {((order.discountAmount && order.discountAmount > 0) || ((order as any).walletAmountUsed && (order as any).walletAmountUsed > 0)) && (
                                    <div className="mt-4 p-4 bg-gradient-to-r from-emerald-500/10 to-teal-500/10 rounded-xl border border-emerald-500/20">
                                        <div className="flex items-center justify-between">
                                            <span className="text-xs font-bold text-emerald-700 uppercase tracking-wide">Total Savings</span>
                                            <span className="text-lg font-black text-emerald-600">
                                                ₹{((order.discountAmount || 0) + ((order as any).walletAmountUsed || 0)).toLocaleString()}
                                            </span>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </section>
                    </div>

                    {/* Metadata Sidebars */}
                    <div className="space-y-8">
                        <section className="bg-background rounded-3xl p-8 shadow-sm border border-primary/10">
                            <h2 className="text-sm font-black text-primary uppercase tracking-widest mb-6 flex items-center gap-2">
                                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                                    <MapPin size={18} />
                                </div>
                                Delivery Node
                            </h2>
                            <div className="space-y-1">
                                <p className="text-sm font-black text-primary">{order.shippingAddress.name}</p>
                                <p className="text-xs font-bold text-secondary leading-relaxed">
                                    {order.shippingAddress.street}, {order.shippingAddress.landmark && `${order.shippingAddress.landmark}, `}
                                    {order.shippingAddress.city}, {order.shippingAddress.state} - {order.shippingAddress.pincode}
                                </p>
                                <div className="mt-4 pt-4 border-t border-primary/5 flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-full bg-primary/5 flex items-center justify-center text-secondary">
                                        <Clock size={14} />
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="text-[10px] font-black text-secondary uppercase tracking-widest leading-none mb-1">Mobile Payload</span>
                                        <span className="text-xs font-black text-primary">{order.shippingAddress.mobile}</span>
                                    </div>
                                </div>
                            </div>
                        </section>

                        <section className="bg-background rounded-3xl p-8 shadow-sm border border-primary/10">
                            <h2 className="text-sm font-black text-primary uppercase tracking-widest mb-6 flex items-center gap-2">
                                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                                    <CreditCard size={18} />
                                </div>
                                Settlement
                            </h2>
                            <div className="space-y-4">
                                <div className="flex items-center justify-between p-3 bg-primary/5 rounded-2xl border border-primary/10">
                                    <span className="text-[10px] font-black text-secondary uppercase tracking-widest">Protocol</span>
                                    <span className="text-xs font-black text-primary">{order.paymentMethod}</span>
                                </div>
                                <div className="flex items-center justify-between p-3 bg-primary/5 rounded-2xl border border-primary/10">
                                    <span className="text-[10px] font-black text-secondary uppercase tracking-widest">State</span>
                                    <span className={`text-xs font-black ${order.paymentStatus === 'COMPLETED' ? 'text-emerald-500' : 'text-amber-500'}`}>
                                        {order.orderStatus === 'RETURNED' ? 'REFUNDED' : order.paymentStatus}
                                    </span>
                                </div>
                                {returns.length > 0 && (
                                    <div className="flex items-center justify-between p-3 bg-rose-500/10 rounded-2xl border border-rose-500/20">
                                        <span className="text-[10px] font-black text-rose-400 uppercase tracking-widest">Return</span>
                                        <span className="text-xs font-black text-rose-600">
                                            {returns[0].status}
                                        </span>
                                    </div>
                                )}
                            </div>
                        </section>

                        <div className="px-4">
                            <button
                                onClick={() => navigate(ROUTES.INVOICE.replace(':id', order._id))}
                                className="w-full flex items-center justify-center gap-3 py-4 bg-primary text-background rounded-2xl font-black uppercase text-[10px] tracking-widest hover:bg-primary/90 transition-all shadow-xl shadow-primary/20"
                            >
                                <FileText size={18} />
                                Digital Invoice
                                <ArrowRight size={14} className="ml-2" />
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <ReviewSubmissionModal
                isOpen={isReviewModalOpen}
                onClose={() => setIsReviewModalOpen(false)}
                productId={selectedProduct?.id || ''}
                productName={selectedProduct?.name || ''}
                orderId={order._id}
                onSuccess={loadOrderDetails}
            />

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
