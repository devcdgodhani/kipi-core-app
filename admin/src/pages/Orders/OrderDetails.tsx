import React, { useState, useEffect } from 'react';
import {
    ShoppingCart,
    User,
    MapPin,
    CreditCard,
    Clock,
    CheckCircle2,
    Package,
    Truck,
    ShoppingBag,
    AlertCircle,
    ArrowLeftRight,
    FileText,
    History as HistoryIcon,
    ArrowLeft,
    IndianRupee,
    RefreshCw
} from 'lucide-react';
import { useParams, useNavigate } from 'react-router-dom';
import type { Order } from '../../types/order.types';
import { orderService } from '../../services/order.service';
import { paymentService } from '../../services/paymentService';
import { toast } from 'react-hot-toast';
import Button from '../../components/common/Button';
import { ROUTES } from '../../routes/routeConfig';

export const OrderDetails: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();

    const [order, setOrder] = useState<Order | null>(null);
    const [payments, setPayments] = useState<any[]>([]);
    const [refunds, setRefunds] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [processing, setProcessing] = useState(false);
    const [syncingPayment, setSyncingPayment] = useState<string | null>(null);
    const [syncingAll, setSyncingAll] = useState(false);

    useEffect(() => {
        if (id) {
            fetchOrderDetails();
        }
    }, [id]);

    const fetchOrderDetails = async () => {
        try {
            setLoading(true);
            const data = await orderService.getById(id!);
            setOrder(data);

            const [paymentData, refundData] = await Promise.all([
                orderService.getPayments(id!),
                orderService.getRefunds(id!)
            ]);
            setPayments(paymentData || []);
            setRefunds(refundData || []);
        } catch (err) {
            toast.error('Failed to load order details');
        } finally {
            setLoading(false);
        }
    };

    const handleStatusTransition = async (newStatus: string) => {
        try {
            setProcessing(true);
            await orderService.updateStatus(order!._id, newStatus);
            toast.success(`Order moved to ${newStatus}`);
            await fetchOrderDetails();
        } catch (err: any) {
            toast.error(err.response?.data?.message || 'Transition failed');
        } finally {
            setProcessing(false);
        }
    };

    const handleSyncPayment = async (paymentId: string) => {
        try {
            setSyncingPayment(paymentId);
            await paymentService.syncPaymentStatus(paymentId);
            toast.success('Payment status synchronized');
            await fetchOrderDetails();
        } catch (err: any) {
            toast.error(err.response?.data?.message || 'Synchronization failed');
        } finally {
            setSyncingPayment(null);
        }
    };

    const handleSyncAllPayments = async () => {
        try {
            setSyncingAll(true);
            await orderService.syncPaymentStatus(order!._id);
            toast.success('Order payment status synchronized');
            await fetchOrderDetails();
        } catch (err: any) {
            toast.error(err.response?.data?.message || 'Synchronization failed');
        } finally {
            setSyncingAll(false);
        }
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
                <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
                <span className="text-xs font-black text-primary uppercase tracking-widest">Synchronizing order data...</span>
            </div>
        );
    }

    if (!order) return null;

    return (
        <div className="p-6 space-y-6 flex flex-col min-h-screen bg-gray-50/50 animate-in fade-in duration-500">
            {/* Header */}
            <div className="bg-white p-8 rounded-[2.5rem] border border-primary/5 shadow-sm">
                <div className="flex items-center justify-between mb-8">
                    <button
                        onClick={() => navigate(`/${ROUTES.DASHBOARD.ORDERS}`)}
                        className="flex items-center gap-2 text-gray-400 hover:text-primary transition-colors group px-4 py-2 rounded-xl hover:bg-gray-50"
                    >
                        <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
                        <span className="text-[10px] font-black uppercase tracking-widest">Back to Ledger</span>
                    </button>

                    <div className="flex items-center gap-2">
                        <Button
                            onClick={handleSyncAllPayments}
                            disabled={syncingAll}
                            variant="ghost"
                            className="h-10 px-4 rounded-xl border-emerald-100 text-emerald-600 hover:bg-emerald-50 text-[10px] uppercase tracking-widest font-black"
                        >
                            <RefreshCw size={14} className={`mr-2 ${syncingAll ? 'animate-spin' : ''}`} />
                            Sync Status
                        </Button>
                        <span className="bg-gray-100 text-gray-500 px-3 py-1 rounded-lg text-[10px] font-bold uppercase tracking-widest">
                            ID: {order.orderNumber}
                        </span>
                    </div>
                </div>

                <div className="flex flex-col md:flex-row items-center gap-6">
                    <div className="p-4 bg-primary/10 text-primary rounded-[1.5rem] shadow-xl shadow-primary/20">
                        <ShoppingCart size={32} />
                    </div>
                    <div>
                        <h1 className="text-3xl font-black text-gray-900 tracking-tight uppercase">Order #{order.orderNumber}</h1>
                        <div className="flex items-center gap-2 mt-1">
                            <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">{new Date(order.createdAt).toLocaleDateString()}</span>
                            <span className="w-1 h-1 bg-gray-300 rounded-full" />
                            <span className={`text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-md border ${order.orderStatus === 'PENDING' ? 'text-amber-500 border-amber-200 bg-amber-50' :
                                order.orderStatus === 'DELIVERED' ? 'text-emerald-500 border-emerald-200 bg-emerald-50' :
                                    'text-primary border-primary/20 bg-primary/5'
                                }`}>{order.orderStatus}</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Visual Progress Stepper */}
            <div className="bg-white p-4 lg:p-8 rounded-[2rem] border border-gray-100 shadow-sm overflow-x-auto">
                <div className="flex items-center justify-between min-w-[600px] px-4">
                    {['PENDING', 'CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED'].map((status, idx, arr) => {
                        const isCompleted = arr.indexOf(order.orderStatus) >= idx;
                        const isCurrent = order.orderStatus === status;
                        return (
                            <React.Fragment key={status}>
                                <div className="flex flex-col items-center gap-2 relative z-10">
                                    <div className={`w-12 h-12 rounded-full flex items-center justify-center border-2 transition-all duration-500 ${isCompleted ? 'bg-primary border-primary text-white shadow-lg shadow-primary/30' : 'bg-white border-gray-100 text-gray-300'
                                        } ${isCurrent ? 'ring-4 ring-primary/10 scale-110' : ''}`}>
                                        {status === 'PENDING' && <Clock size={18} />}
                                        {status === 'CONFIRMED' && <CheckCircle2 size={18} />}
                                        {status === 'PROCESSING' && <Package size={18} />}
                                        {status === 'SHIPPED' && <Truck size={18} />}
                                        {status === 'DELIVERED' && <ShoppingBag size={18} />}
                                    </div>
                                    <span className={`text-[10px] font-black uppercase tracking-widest mt-2 ${isCompleted ? 'text-primary' : 'text-gray-400'}`}>{status}</span>
                                </div>
                                {idx < arr.length - 1 && (
                                    <div className={`flex-1 h-1 mx-4 rounded-full transition-all duration-1000 ${arr.indexOf(order.orderStatus) > idx ? 'bg-primary' : 'bg-gray-100'
                                        }`} />
                                )}
                            </React.Fragment>
                        );
                    })}
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left Section: Detailed Info */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Customer & Address */}
                    <div className="bg-white p-8 rounded-[2.5rem] border border-primary/5 shadow-sm space-y-6">
                        <div className="flex items-center gap-3 pb-4 border-b border-gray-50">
                            <User size={20} className="text-primary" />
                            <h3 className="font-black text-sm text-gray-900 uppercase tracking-widest">Client Intelligence</h3>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div>
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-2">Customer Profile</label>
                                <div className="space-y-1">
                                    <p className="text-base font-bold text-gray-900">{order.userId?.firstName} {order.userId?.lastName}</p>
                                    <p className="text-xs text-gray-500 font-medium">{order.userId?.email}</p>
                                    <p className="text-xs text-gray-500 font-medium">{order.userId?.mobile}</p>
                                </div>
                            </div>
                            <div>
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-2">Shipping Destination</label>
                                <div className="flex items-start gap-2">
                                    <MapPin size={16} className="text-gray-400 mt-1 shrink-0" />
                                    <div className="text-sm font-medium text-gray-600 leading-relaxed">
                                        {order.shippingAddress.street}, {order.shippingAddress.landmark && `${order.shippingAddress.landmark}, `}
                                        {order.shippingAddress.city}, {order.shippingAddress.state}, {order.shippingAddress.pincode}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Order Items */}
                    <div className="bg-white p-8 rounded-[2.5rem] border border-primary/5 shadow-sm space-y-6">
                        <div className="flex items-center justify-between pb-4 border-b border-gray-50">
                            <div className="flex items-center gap-3">
                                <ShoppingBag size={20} className="text-primary" />
                                <h3 className="font-black text-sm text-gray-900 uppercase tracking-widest">Basket Contents</h3>
                            </div>
                            <span className="text-[10px] font-black text-primary bg-primary/5 px-2 py-0.5 rounded-lg border border-primary/10">{order.items.length} Units</span>
                        </div>
                        <div className="space-y-4">
                            {order.items.map((item, idx) => (
                                <div key={idx} className="flex gap-6 p-4 rounded-2xl bg-gray-50/50 border border-gray-100 hover:border-primary/10 transition-colors">
                                    <div className="w-20 h-20 bg-white rounded-xl border border-gray-200 overflow-hidden shrink-0 p-1">
                                        {item.image ? <img src={item.image} alt="" className="w-full h-full object-cover rounded-lg" /> : <Package className="w-full h-full p-4 text-gray-300" />}
                                    </div>
                                    <div className="flex-1 min-w-0 flex flex-col justify-center">
                                        <p className="text-sm font-black text-gray-900 truncate">{item.name}</p>
                                        <div className="flex items-center gap-4 mt-2">
                                            <span className="text-[10px] text-gray-500 font-bold uppercase tracking-widest bg-white border border-gray-200 px-2 py-1 rounded-md">Qty: {item.quantity}</span>
                                            <span className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Price: ₹{item.price}</span>
                                        </div>
                                    </div>
                                    <div className="text-base font-black text-gray-900 uppercase flex items-center">₹{item.total}</div>
                                </div>
                            ))}
                        </div>
                        <div className="pt-6 border-t border-gray-50 space-y-3">
                            <div className="flex justify-between text-xs font-medium text-gray-500 uppercase tracking-widest">
                                <span>Subtotal</span>
                                <span className="text-gray-900 font-bold">₹{order.subTotal.toLocaleString()}</span>
                            </div>

                            {/* Coupon Discount */}
                            {order.discountAmount! > 0 && (
                                <div className="flex justify-between text-xs font-medium uppercase tracking-widest bg-emerald-50 -mx-2 px-2 py-2 rounded-lg border border-emerald-100">
                                    <span className="text-emerald-700 flex items-center gap-2">
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                                        </svg>
                                        Coupon ({order.couponCode})
                                    </span>
                                    <span className="text-emerald-600 font-bold">-₹{order?.discountAmount?.toLocaleString()}</span>
                                </div>
                            )}

                            {/* Loyalty Points */}
                            {(order as any).pointsRedeemed && (order as any).pointsRedeemed > 0 && (
                                <div className="flex justify-between text-xs font-medium uppercase tracking-widest bg-amber-50 -mx-2 px-2 py-2 rounded-lg border border-amber-100">
                                    <span className="text-amber-700 flex items-center gap-2">
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                        Points ({(order as any).pointsUsed || 0} pts)
                                    </span>
                                    <span className="text-amber-600 font-bold">-₹{(order as any).pointsRedeemed.toLocaleString()}</span>
                                </div>
                            )}

                            {/* Delivery Charges */}
                            <div className="flex justify-between text-xs font-medium text-gray-500 uppercase tracking-widest">
                                <span className="flex items-center gap-2">
                                    <Truck size={14} />
                                    Delivery Charges
                                </span>
                                <span className={`font-bold ${order.shippingCost === 0 ? 'text-emerald-500' : 'text-gray-900'}`}>
                                    {order.shippingCost === 0 ? 'FREE' : `₹${order.shippingCost.toLocaleString()}`}
                                </span>
                            </div>

                            {/* Tax */}
                            {order.tax > 0 && (
                                <div className="flex justify-between text-xs font-medium text-gray-500 uppercase tracking-widest">
                                    <span>Tax (GST)</span>
                                    <span className="text-gray-900 font-bold">₹{order.tax.toLocaleString()}</span>
                                </div>
                            )}

                            {/* Total */}
                            <div className="flex justify-between pt-4 border-t border-gray-100/50 text-base font-black text-primary uppercase tracking-tight">
                                <span>Total Payable</span>
                                <span className="text-xl">₹{order.totalAmount.toLocaleString()}</span>
                            </div>

                            {/* Savings Highlight */}
                            {((order.discountAmount && order.discountAmount > 0) || ((order as any).pointsRedeemed && (order as any).pointsRedeemed > 0)) && (
                                <div className="mt-4 p-4 bg-gradient-to-r from-emerald-50 to-teal-50 rounded-xl border border-emerald-200">
                                    <div className="flex items-center justify-between">
                                        <span className="text-xs font-bold text-emerald-700 uppercase tracking-wide">Customer Savings</span>
                                        <span className="text-lg font-black text-emerald-600">
                                            ₹{((order.discountAmount || 0) + ((order as any).pointsRedeemed || 0)).toLocaleString()}
                                        </span>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Payment History Section */}
                    <div className="bg-white p-8 rounded-[2.5rem] border border-primary/5 shadow-sm space-y-6">
                        <div className="flex items-center gap-3 pb-4 border-b border-gray-50">
                            <CreditCard size={20} className="text-primary" />
                            <h3 className="font-black text-sm text-gray-900 uppercase tracking-widest">Payment History</h3>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div>
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-1">Mechanism</label>
                                <span className="text-xs font-black text-gray-900 uppercase px-3 py-1 bg-gray-50 rounded-lg">{order.paymentMethod}</span>
                            </div>
                            <div>
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-1">Settlement</label>
                                <span className={`text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full border ${order.paymentStatus === 'COMPLETED' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-rose-50 text-rose-500 border-rose-100'
                                    }`}>{order.paymentStatus}</span>
                            </div>
                        </div>

                        <div className="space-y-4">
                            {payments.length > 0 ? (
                                payments.map((p) => (
                                    <div key={p._id} className="flex items-center justify-between p-4 rounded-2xl bg-gray-50/50 border border-gray-100">
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                                                <CreditCard size={18} />
                                            </div>
                                            <div>
                                                <p className="text-xs font-black text-gray-900 uppercase">{p.gatewayName || p.provider || 'Gateway'}</p>
                                                <p className="text-[10px] text-gray-400 font-bold uppercase">{p.internalPaymentId}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-6">
                                            <div className="text-right">
                                                <p className="text-sm font-black text-gray-900">₹{p.amount}</p>
                                                <span className={`text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-md border ${p.status === 'SUCCESS' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' :
                                                    p.status === 'FAILED' ? 'bg-rose-50 text-rose-500 border-rose-100' :
                                                        'bg-amber-50 text-amber-500 border-amber-100'
                                                    }`}>{p.status}</span>
                                            </div>
                                            <button
                                                onClick={() => handleSyncPayment(p._id)}
                                                disabled={syncingPayment === p._id}
                                                className={`p-2 rounded-xl transition-all ${syncingPayment === p._id ? 'bg-gray-100 text-gray-400 animate-spin' : 'hover:bg-primary/10 text-primary bg-gray-50'}`}
                                                title="Sync Status"
                                            >
                                                <RefreshCw size={16} />
                                            </button>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="text-xs text-gray-400 italic py-4 text-center border-2 border-dashed border-gray-50 rounded-2xl">No historical records discovered.</div>
                            )}
                        </div>
                    </div>

                    {/* Refund History Section */}
                    <div className="bg-white p-8 rounded-[2.5rem] border border-primary/5 shadow-sm space-y-6">
                        <div className="flex items-center gap-3 pb-4 border-b border-gray-50">
                            <RefreshCw size={20} className="text-amber-500" />
                            <h3 className="font-black text-sm text-gray-900 uppercase tracking-widest">Refund History</h3>
                        </div>

                        <div className="space-y-4">
                            {refunds.length > 0 ? (
                                refunds.map((r) => (
                                    <div key={r._id} className="flex items-center justify-between p-4 rounded-2xl bg-gray-50/50 border border-gray-100">
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center text-amber-500">
                                                <RefreshCw size={18} />
                                            </div>
                                            <div>
                                                <p className="text-xs font-black text-gray-900 uppercase">{r.gatewayName || 'Gateway'}</p>
                                                <p className="text-[10px] text-gray-400 font-bold uppercase">{r.internalRefundId}</p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-sm font-black text-gray-900">₹{r.amount}</p>
                                            <span className={`text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-md border ${(r.status === 'PROCESSED' || r.status === 'SUCCESS') ? 'bg-emerald-50 text-emerald-600 border-emerald-100' :
                                                r.status === 'FAILED' ? 'bg-rose-50 text-rose-500 border-rose-100' :
                                                    'bg-amber-50 text-amber-500 border-amber-100'
                                                }`}>{r.status}</span>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="text-xs text-gray-400 italic py-4 text-center border-2 border-dashed border-gray-50 rounded-2xl">No refund records discovered.</div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Right Section: State Specific UI */}
                <div className="space-y-6">

                    {/* Action Card (MEESHO/AMAZON STYLE) */}
                    <div className="bg-primary p-1 rounded-[2.5rem] shadow-xl shadow-primary/20">
                        <div className="bg-white p-8 rounded-[2.2rem] space-y-6">
                            <div className="flex items-center gap-3">
                                <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
                                    <ArrowLeftRight size={24} />
                                </div>
                                <div>
                                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Decision Engine</p>
                                    <h4 className="text-sm font-black text-gray-900 uppercase tracking-tight">Next Workflow Step</h4>
                                </div>
                            </div>

                            <div className="space-y-4">
                                {order.orderStatus === 'PENDING' && (
                                    <Button
                                        onClick={() => handleStatusTransition('CONFIRMED')}
                                        disabled={processing}
                                        className="w-full h-14 rounded-2xl shadow-lg font-black"
                                    >
                                        <CheckCircle2 size={20} className="mr-2" />
                                        Accept & Confirm Order
                                    </Button>
                                )}
                                {order.orderStatus === 'CONFIRMED' && (
                                    <Button
                                        onClick={() => handleStatusTransition('PROCESSING')}
                                        disabled={processing}
                                        className="w-full h-14 rounded-2xl shadow-lg font-black"
                                    >
                                        <Package size={20} className="mr-2" />
                                        Initiate Processing
                                    </Button>
                                )}
                                {order.orderStatus === 'PROCESSING' && (
                                    <Button
                                        onClick={() => handleStatusTransition('SHIPPED')}
                                        disabled={processing}
                                        className="w-full h-14 rounded-2xl shadow-lg bg-indigo-600 hover:bg-indigo-700 font-black"
                                    >
                                        <Truck size={20} className="mr-2" />
                                        Mark as Dispatched
                                    </Button>
                                )}
                                {order.orderStatus === 'SHIPPED' && (
                                    <div className="space-y-3">
                                        <Button
                                            onClick={() => handleStatusTransition('DELIVERED')}
                                            disabled={processing}
                                            className="w-full h-14 rounded-2xl shadow-lg bg-emerald-600 hover:bg-emerald-700 font-black"
                                        >
                                            <ShoppingBag size={20} className="mr-2" />
                                            Confirm Delivery
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            onClick={async () => {
                                                try {
                                                    setProcessing(true);
                                                    await orderService.simulateLogistics(order._id);
                                                    toast.success('Logistics update simulated');
                                                    await fetchOrderDetails();
                                                } catch (err: any) {
                                                    toast.error(err.response?.data?.message || 'Simulation failed');
                                                } finally {
                                                    setProcessing(false);
                                                }
                                            }}
                                            disabled={processing}
                                            className="w-full h-14 rounded-2xl border-indigo-100 text-indigo-600 hover:bg-indigo-50 font-bold"
                                        >
                                            <Truck size={20} className="mr-2" />
                                            Simulate Carrier Update
                                        </Button>
                                    </div>
                                )}

                                {['PENDING', 'CONFIRMED', 'PROCESSING'].includes(order.orderStatus) && (
                                    <Button
                                        variant="ghost"
                                        onClick={() => handleStatusTransition('CANCELLED')}
                                        disabled={processing}
                                        className="w-full h-14 rounded-2xl text-rose-500 hover:bg-rose-50 hover:text-rose-600 font-black"
                                    >
                                        <AlertCircle size={20} className="mr-2" />
                                        Void / Cancel Order
                                    </Button>
                                )}

                                <p className="text-[10px] text-gray-400 text-center font-bold px-4 italic leading-relaxed">
                                    * Advancing the status will notify the customer and record a timeline entry.
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Financial Status Card */}
                    <div className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm space-y-4">
                        <div className="flex items-center gap-3 pb-3 border-b border-gray-50">
                            <IndianRupee size={18} className="text-primary" />
                            <h3 className="font-black text-xs text-gray-900 uppercase tracking-widest">Financial Status</h3>
                        </div>

                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Payment Status</span>
                                <span className={`text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full border ${order.paymentStatus === 'COMPLETED' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' :
                                    order.paymentStatus === 'FAILED' ? 'bg-rose-50 text-rose-500 border-rose-100' :
                                        'bg-amber-50 text-amber-600 border-amber-100'
                                    }`}>{order.paymentStatus}</span>
                            </div>

                            {['RETURNED', 'CANCELLED'].includes(order.orderStatus) && (
                                <div className="flex items-center justify-between">
                                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Refund Status</span>
                                    <span className={`text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full border ${refunds.length > 0 ? (
                                        refunds.some(r => r.status === 'PROCESSED' || r.status === 'SUCCESS') ? 'bg-emerald-50 text-emerald-600 border-emerald-100' :
                                            refunds.some(r => r.status === 'FAILED') ? 'bg-rose-50 text-rose-500 border-rose-100' :
                                                'bg-amber-50 text-amber-600 border-amber-100'
                                    ) : 'bg-gray-50 text-gray-400 border-gray-100'}`}>
                                        {refunds.length > 0 ? (
                                            refunds.some(r => r.status === 'PROCESSED' || r.status === 'SUCCESS') ? 'PROCESSED' :
                                                refunds.some(r => r.status === 'FAILED') ? 'FAILED' : 'PENDING'
                                        ) : 'N/A'}
                                    </span>
                                </div>
                            )}
                        </div>
                    </div>


                    {/* Timeline / History */}
                    <div className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm space-y-6">
                        <div className="flex items-center justify-between pb-3 border-b border-gray-50">
                            <div className="flex items-center gap-3">
                                <HistoryIcon size={18} className="text-primary" />
                                <h3 className="font-black text-xs text-gray-900 uppercase tracking-widest">Activity Log</h3>
                            </div>
                        </div>
                        <div className="space-y-6 relative ml-4 before:absolute before:left-0 before:top-2 before:bottom-2 before:w-0.5 before:bg-gray-100">
                            {(order.timeline || []).length > 0 ? (
                                (order.timeline!).slice().reverse().map((log: any, idx: number) => (
                                    <div key={idx} className="relative pl-6">
                                        <div className="absolute left-[-4px] top-1.5 w-2 h-2 rounded-full bg-primary ring-4 ring-primary/5" />
                                        <p className="text-[10px] font-black text-gray-900 uppercase tracking-tight">{log.status}</p>
                                        <p className="text-[10px] text-gray-500 font-medium italic mt-0.5">{log.message}</p>
                                        <p className="text-[9px] text-gray-400 font-bold uppercase mt-1">
                                            {new Date(log.timestamp).toLocaleDateString()} {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </p>
                                    </div>
                                ))
                            ) : (
                                <div className="text-xs text-gray-400 italic py-4">No historical records discovered yet.</div>
                            )}
                        </div>
                    </div>

                    {/* Sticky Footer Actions (Optional here since duplicate with card but good for quick access) */}
                    <div className="bg-white/80 backdrop-blur-md border border-gray-100 p-4 rounded-[2rem] flex gap-4">
                        <Button variant="ghost" className="flex-1 h-14 rounded-2xl border-gray-100 bg-gray-50 hover:bg-gray-100 font-bold text-xs uppercase tracking-widest text-gray-500">
                            <FileText size={16} className="mr-2" />
                            Invoice
                        </Button>
                        <Button variant="ghost" className="flex-1 h-14 rounded-2xl border-gray-100 bg-gray-50 hover:bg-gray-100 font-bold text-xs uppercase tracking-widest text-gray-500">
                            <ArrowLeftRight size={16} className="mr-2" />
                            Log Issue
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default OrderDetails;
