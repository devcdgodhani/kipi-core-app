import React, { useState, useEffect } from 'react';
import {
    X,
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
    History as HistoryIcon
} from 'lucide-react';
import type { Order } from '../../types/order.types';
import { orderService } from '../../services/order.service';
import { toast } from 'react-hot-toast';
import Button from '../common/Button';

interface OrderDetailSidebarProps {
    orderId: string | null;
    onClose: () => void;
    onUpdate: () => void;
}

const OrderDetailSidebar: React.FC<OrderDetailSidebarProps> = ({ orderId, onClose, onUpdate }) => {
    const [order, setOrder] = useState<Order | null>(null);
    const [loading, setLoading] = useState(false);
    const [processing, setProcessing] = useState(false);

    useEffect(() => {
        if (orderId) {
            fetchOrderDetails();
        }
    }, [orderId]);

    const fetchOrderDetails = async () => {
        try {
            setLoading(true);
            const data = await orderService.getById(orderId!);
            setOrder(data);
        } catch (err) {
            toast.error('Failed to load order details');
            onClose();
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
            onUpdate();
        } catch (err: any) {
            toast.error(err.response?.data?.message || 'Transition failed');
        } finally {
            setProcessing(false);
        }
    };

    if (!orderId) return null;

    return (
        <div className={`fixed inset-0 z-50 flex justify-end transition-opacity duration-300 ${orderId ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
            {/* Backdrop */}
            <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />

            {/* Sidebar Content */}
            <div className={`relative w-full max-w-2xl bg-gray-50 h-full shadow-2xl transition-transform duration-500 overflow-y-auto ${orderId ? 'translate-x-0' : 'translate-x-full'}`}>
                {loading ? (
                    <div className="flex flex-col items-center justify-center h-full text-primary/40 italic">
                        <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin mb-4" />
                        Synchronizing order data...
                    </div>
                ) : order ? (
                    <div className="flex flex-col min-h-full">
                        {/* Header */}
                        <div className="sticky top-0 z-10 bg-white border-b border-gray-100 p-6 flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <div className="p-3 bg-primary/10 text-primary rounded-2xl">
                                    <ShoppingCart size={24} />
                                </div>
                                <div>
                                    <h2 className="text-xl font-black text-gray-900 tracking-tight uppercase">Order #{order.orderNumber}</h2>
                                    <div className="flex items-center gap-2 mt-0.5">
                                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{new Date(order.createdAt).toLocaleDateString()}</span>
                                        <span className="w-1 h-1 bg-gray-300 rounded-full" />
                                        <span className={`text-[10px] font-black uppercase tracking-widest ${order.orderStatus === 'PENDING' ? 'text-amber-500' :
                                            order.orderStatus === 'DELIVERED' ? 'text-green-500' :
                                                'text-primary'
                                            }`}>{order.orderStatus}</span>
                                    </div>
                                </div>
                            </div>
                            <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-xl transition-colors text-gray-400">
                                <X size={24} />
                            </button>
                        </div>

                        {/* Content Grid */}
                        <div className="p-8 space-y-8 pb-32">

                            {/* Visual Progress Stepper */}
                            <div className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm overflow-x-auto">
                                <div className="flex items-center justify-between min-w-[500px] px-4">
                                    {['PENDING', 'CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED'].map((status, idx, arr) => {
                                        const isCompleted = arr.indexOf(order.orderStatus) >= idx;
                                        const isCurrent = order.orderStatus === status;
                                        return (
                                            <React.Fragment key={status}>
                                                <div className="flex flex-col items-center gap-2 relative">
                                                    <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all duration-500 ${isCompleted ? 'bg-primary border-primary text-white shadow-lg shadow-primary/30' : 'bg-white border-gray-100 text-gray-300'
                                                        } ${isCurrent ? 'ring-4 ring-primary/10 scale-110' : ''}`}>
                                                        {status === 'PENDING' && <Clock size={16} />}
                                                        {status === 'CONFIRMED' && <CheckCircle2 size={16} />}
                                                        {status === 'PROCESSING' && <Package size={16} />}
                                                        {status === 'SHIPPED' && <Truck size={16} />}
                                                        {status === 'DELIVERED' && <ShoppingBag size={16} />}
                                                    </div>
                                                    <span className={`text-[9px] font-black uppercase tracking-tighter ${isCompleted ? 'text-primary' : 'text-gray-400'}`}>{status}</span>
                                                </div>
                                                {idx < arr.length - 1 && (
                                                    <div className={`flex-1 h-1 mx-2 rounded-full transition-all duration-1000 ${arr.indexOf(order.orderStatus) > idx ? 'bg-primary' : 'bg-gray-100'
                                                        }`} />
                                                )}
                                            </React.Fragment>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* Dynamic State Actions & View */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Left Section: Detailed Info */}
                                <div className="space-y-6">
                                    {/* Customer & Address */}
                                    <div className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm space-y-4">
                                        <div className="flex items-center gap-3 pb-3 border-b border-gray-50">
                                            <User size={18} className="text-primary" />
                                            <h3 className="font-black text-xs text-gray-900 uppercase tracking-widest">Client Intelligence</h3>
                                        </div>
                                        <div className="space-y-1">
                                            <p className="text-sm font-bold text-gray-900">{order.userId?.firstName} {order.userId?.lastName}</p>
                                            <p className="text-xs text-gray-500">{order.userId?.email}</p>
                                            <p className="text-xs text-gray-500">{order.userId?.mobile}</p>
                                        </div>
                                        <div className="pt-3 border-t border-gray-50 space-y-2">
                                            <div className="flex items-start gap-2">
                                                <MapPin size={16} className="text-gray-400 mt-0.5 shrink-0" />
                                                <div className="text-xs font-medium text-gray-600 leading-relaxed">
                                                    {order.shippingAddress.street}, {order.shippingAddress.landmark && `${order.shippingAddress.landmark}, `}
                                                    {order.shippingAddress.city}, {order.shippingAddress.state}, {order.shippingAddress.pincode}
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Order Items */}
                                    <div className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm space-y-4">
                                        <div className="flex items-center justify-between pb-3 border-b border-gray-50">
                                            <div className="flex items-center gap-3">
                                                <ShoppingBag size={18} className="text-primary" />
                                                <h3 className="font-black text-xs text-gray-900 uppercase tracking-widest">Basket Contents</h3>
                                            </div>
                                            <span className="text-[10px] font-black text-primary bg-primary/5 px-2 py-0.5 rounded-lg border border-primary/10">{order.items.length} Units</span>
                                        </div>
                                        <div className="space-y-4">
                                            {order.items.map((item, idx) => (
                                                <div key={idx} className="flex gap-4">
                                                    <div className="w-14 h-14 bg-gray-50 rounded-xl border border-gray-100 overflow-hidden shrink-0">
                                                        {item.image ? <img src={item.image} alt="" className="w-full h-full object-cover" /> : <Package className="w-full h-full p-3 text-gray-300" />}
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <p className="text-xs font-black text-gray-900 truncate">{item.name}</p>
                                                        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-0.5">Qty: {item.quantity} × ₹{item.price}</p>
                                                    </div>
                                                    <div className="text-xs font-black text-gray-900 uppercase">₹{item.total}</div>
                                                </div>
                                            ))}
                                        </div>
                                        <div className="pt-4 border-t border-gray-50 space-y-2">
                                            <div className="flex justify-between text-xs font-medium text-gray-500 uppercase tracking-widest">
                                                <span>Subtotal</span>
                                                <span className="text-gray-900 font-bold">₹{order.subTotal}</span>
                                            </div>
                                            {order.discountAmount! > 0 && (
                                                <div className="flex justify-between text-xs font-medium text-rose-500 uppercase tracking-widest">
                                                    <span>Discount ({order.couponCode})</span>
                                                    <span className="font-bold">-₹{order.discountAmount}</span>
                                                </div>
                                            )}
                                            <div className="flex justify-between text-xs font-medium text-gray-500 uppercase tracking-widest">
                                                <span>Shipping & Tax</span>
                                                <span className="text-gray-900 font-bold">₹{order.shippingCost + order.tax}</span>
                                            </div>
                                            <div className="flex justify-between pt-2 text-sm font-black text-primary uppercase tracking-tight">
                                                <span>Total Payable</span>
                                                <span className="text-lg">₹{order.totalAmount}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Right Section: State Specific UI */}
                                <div className="space-y-6">
                                    {/* Action Card (MEESHO/AMAZON STYLE) */}
                                    <div className="bg-primary p-1 rounded-[2.5rem] shadow-xl shadow-primary/20">
                                        <div className="bg-white p-6 rounded-[2.2rem] space-y-6">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
                                                    <ArrowLeftRight size={20} />
                                                </div>
                                                <div>
                                                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Decision Engine</p>
                                                    <h4 className="text-sm font-black text-gray-900 uppercase tracking-tight">Next Workflow Step</h4>
                                                </div>
                                            </div>

                                            <div className="space-y-3">
                                                {order.orderStatus === 'PENDING' && (
                                                    <Button
                                                        onClick={() => handleStatusTransition('CONFIRMED')}
                                                        disabled={processing}
                                                        className="w-full h-14 rounded-2xl shadow-lg"
                                                    >
                                                        <CheckCircle2 size={20} className="mr-2" />
                                                        Accept & Confirm Order
                                                    </Button>
                                                )}
                                                {order.orderStatus === 'CONFIRMED' && (
                                                    <Button
                                                        onClick={() => handleStatusTransition('PROCESSING')}
                                                        disabled={processing}
                                                        className="w-full h-14 rounded-2xl shadow-lg"
                                                    >
                                                        <Package size={20} className="mr-2" />
                                                        Initiate Processing
                                                    </Button>
                                                )}
                                                {order.orderStatus === 'PROCESSING' && (
                                                    <Button
                                                        onClick={() => handleStatusTransition('SHIPPED')}
                                                        disabled={processing}
                                                        className="w-full h-14 rounded-2xl shadow-lg bg-indigo-600 hover:bg-indigo-700"
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
                                                            className="w-full h-14 rounded-2xl shadow-lg bg-emerald-600 hover:bg-emerald-700"
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
                                                                    onUpdate();
                                                                } catch (err: any) {
                                                                    toast.error(err.response?.data?.message || 'Simulation failed');
                                                                } finally {
                                                                    setProcessing(false);
                                                                }
                                                            }}
                                                            disabled={processing}
                                                            className="w-full h-14 rounded-2xl border-indigo-100 text-indigo-600 hover:bg-indigo-50"
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
                                                        className="w-full h-14 rounded-2xl text-rose-500 hover:bg-rose-50 hover:text-rose-600"
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
                                                (order.timeline!).map((log: any, idx: number) => (
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

                                    {/* Payment Insights */}
                                    <div className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm space-y-4">
                                        <div className="flex items-center gap-3 pb-3 border-b border-gray-50">
                                            <CreditCard size={18} className="text-primary" />
                                            <h3 className="font-black text-xs text-gray-900 uppercase tracking-widest">Financial Status</h3>
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Mechanism</p>
                                            <span className="text-xs font-black text-gray-900 uppercase px-3 py-1 bg-gray-50 rounded-lg">{order.paymentMethod}</span>
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Settlement</p>
                                            <span className={`text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full border ${order.paymentStatus === 'COMPLETED' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-rose-50 text-rose-500 border-rose-100'
                                                }`}>{order.paymentStatus}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Sticky Footer Actions */}
                        <div className="sticky bottom-0 bg-white/80 backdrop-blur-md border-t border-gray-100 p-6 flex gap-4 mt-auto">
                            <Button variant="ghost" className="flex-1 h-14 rounded-2xl border-gray-100 bg-gray-50 hover:bg-gray-100">
                                <FileText size={20} className="mr-2" />
                                Export Invoice
                            </Button>
                            <Button variant="ghost" className="flex-1 h-14 rounded-2xl border-gray-100 bg-gray-50 hover:bg-gray-100">
                                <ArrowLeftRight size={20} className="mr-2" />
                                Log Issue
                            </Button>
                        </div>
                    </div>
                ) : null}
            </div>
        </div>
    );
};

export default OrderDetailSidebar;

