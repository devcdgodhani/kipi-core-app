import React, { useState, useEffect } from 'react';
import {
    RotateCcw,
    User,
    MapPin,
    CreditCard,
    Clock,
    CheckCircle2,
    Package,
    Truck,
    ShoppingBag,
    ArrowLeftRight,
    FileText,
    History as HistoryIcon,
    ArrowLeft,
    XCircle,
    IndianRupee,
    RefreshCw
} from 'lucide-react';
import { useParams, useNavigate } from 'react-router-dom';
import type { IReturn } from '../../types/return.types';
import { RETURN_STATUS } from '../../types/return.types';
import { returnService } from '../../services/returnService';
import { toast } from 'react-hot-toast';
import Button from '../../components/common/Button';
import { ROUTES } from '../../routes/routeConfig';
import { orderService } from '../../services/order.service';

export const ReturnDetails: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();

    const [ret, setRet] = useState<IReturn | null>(null);
    const [loading, setLoading] = useState(false);
    const [updating, setUpdating] = useState(false);
    const [syncingRefund, setSyncingRefund] = useState(false);
    const [payments, setPayments] = useState<any[]>([]);
    const [adminNotes, setAdminNotes] = useState('');

    useEffect(() => {
        if (id) {
            fetchReturnDetails();
        }
    }, [id]);

    const fetchReturnDetails = async () => {
        try {
            setLoading(true);
            const response = await returnService.getOne(id!);
            if (response && response.data) {
                setRet(response.data);
                setAdminNotes(response.data.adminNotes || '');
                // Fetch payments for the order
                if (response.data.orderId?._id) {
                    fetchPayments(response.data.orderId._id);
                }
            } else if (response) {
                const returnData = response as any;
                setRet(returnData);
                setAdminNotes(returnData.adminNotes || '');
                if (returnData.orderId?._id) {
                    fetchPayments(returnData.orderId._id);
                }
            }
        } catch (err) {
            console.error('Failed to fetch return details', err);
            toast.error('Failed to load metadata');
        } finally {
            setLoading(false);
        }
    };

    const fetchPayments = async (orderId: string) => {
        try {
            const data = await orderService.getPayments(orderId);
            setPayments(data || []);
        } catch (err) {
            console.error('Failed to fetch payments', err);
        }
    };

    const handleUpdateStatus = async (newStatus: RETURN_STATUS) => {
        try {
            setUpdating(true);
            await returnService.updateStatus(id!, {
                status: newStatus,
                adminNotes
            });
            toast.success(`Transitioned to ${newStatus}`);
            fetchReturnDetails();
        } catch (err) {
            console.error('Update failed', err);
            toast.error('Protocol override failed');
        } finally {
            setUpdating(false);
        }
    };

    const handleSyncRefund = async () => {
        try {
            setSyncingRefund(true);
            await returnService.syncRefundStatus(id!);
            toast.success('Refund status synchronized');
            fetchReturnDetails();
        } catch (err: any) {
            toast.error(err.response?.data?.message || 'Synchronization failed');
        } finally {
            setSyncingRefund(false);
        }
    };

    if (loading && !ret) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
                <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
                <span className="text-xs font-black text-primary uppercase tracking-widest">Scanning Repository...</span>
            </div>
        );
    }

    if (!ret) return null;

    // Determine stepper state
    const stepperSteps = ['PENDING', 'APPROVED', 'PICKED_UP', 'RECEIVED', 'COMPLETED'];
    const isRejected = ret.status === RETURN_STATUS.REJECTED;
    const isCancelled = ret.status === RETURN_STATUS.CANCELLED;

    return (
        <div className="p-6 space-y-6 flex flex-col min-h-screen bg-gray-50/50 animate-in fade-in duration-500">
            {/* Header */}
            <div className="bg-white p-8 rounded-[2.5rem] border border-primary/5 shadow-sm">
                <div className="flex items-center justify-between mb-8">
                    <button
                        onClick={() => navigate(`/${ROUTES.DASHBOARD.RETURNS}`)}
                        className="flex items-center gap-2 text-gray-400 hover:text-primary transition-colors group px-4 py-2 rounded-xl hover:bg-gray-50"
                    >
                        <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
                        <span className="text-[10px] font-black uppercase tracking-widest">Back to Directory</span>
                    </button>

                    <div className="flex items-center gap-2">
                        <Button
                            onClick={handleSyncRefund}
                            disabled={syncingRefund}
                            variant="ghost"
                            className="h-10 px-4 rounded-xl border-rose-100 text-rose-500 hover:bg-rose-50 text-[10px] uppercase tracking-widest font-black"
                        >
                            <RefreshCw size={14} className={`mr-2 ${syncingRefund ? 'animate-spin' : ''}`} />
                            Sync Refund
                        </Button>
                        <span className="bg-gray-100 text-gray-500 px-3 py-1 rounded-lg text-[10px] font-bold uppercase tracking-widest">
                            ID: {ret.returnNumber}
                        </span>
                    </div>
                </div>

                <div className="flex flex-col md:flex-row items-center gap-6">
                    <div className="p-4 bg-rose-500/10 text-rose-500 rounded-[1.5rem] shadow-xl shadow-rose-500/20">
                        <RotateCcw size={32} />
                    </div>
                    <div>
                        <h1 className="text-3xl font-black text-gray-900 tracking-tight uppercase">Return #{ret.returnNumber}</h1>
                        <div className="flex items-center gap-2 mt-1">
                            <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">{new Date(ret.createdAt).toLocaleDateString()}</span>
                            <span className="w-1 h-1 bg-gray-300 rounded-full" />
                            <span className={`text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-md border ${ret.status === 'PENDING' ? 'text-amber-500 border-amber-200 bg-amber-50' :
                                ret.status === 'COMPLETED' ? 'text-emerald-500 border-emerald-200 bg-emerald-50' :
                                    ret.status === 'REJECTED' ? 'text-rose-500 border-rose-200 bg-rose-50' :
                                        'text-primary border-primary/20 bg-primary/5'
                                }`}>{ret.status.replace(/_/g, ' ')}</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Visual Progress Stepper */}
            {!isRejected && !isCancelled && (
                <div className="bg-white p-4 lg:p-8 rounded-[2rem] border border-gray-100 shadow-sm overflow-x-auto">
                    <div className="flex items-center justify-between min-w-[600px] px-4">
                        {stepperSteps.map((status, idx, arr) => {
                            const isCompleted = arr.indexOf(ret.status) >= idx;
                            const isCurrent = ret.status === status;
                            return (
                                <React.Fragment key={status}>
                                    <div className="flex flex-col items-center gap-2 relative z-10">
                                        <div className={`w-12 h-12 rounded-full flex items-center justify-center border-2 transition-all duration-500 ${isCompleted ? 'bg-primary border-primary text-white shadow-lg shadow-primary/30' : 'bg-white border-gray-100 text-gray-300'
                                            } ${isCurrent ? 'ring-4 ring-primary/10 scale-110' : ''}`}>
                                            {status === 'PENDING' && <Clock size={18} />}
                                            {status === 'APPROVED' && <CheckCircle2 size={18} />}
                                            {status === 'PICKED_UP' && <Truck size={18} />}
                                            {status === 'RECEIVED' && <Package size={18} />}
                                            {status === 'COMPLETED' && <IndianRupee size={18} />}
                                        </div>
                                        <span className={`text-[10px] font-black uppercase tracking-widest mt-2 ${isCompleted ? 'text-primary' : 'text-gray-400'}`}>{status.replace(/_/g, ' ')}</span>
                                    </div>
                                    {idx < arr.length - 1 && (
                                        <div className={`flex-1 h-1 mx-4 rounded-full transition-all duration-1000 ${arr.indexOf(ret.status) > idx ? 'bg-primary' : 'bg-gray-100'
                                            }`} />
                                    )}
                                </React.Fragment>
                            );
                        })}
                    </div>
                </div>
            )}

            {(isRejected || isCancelled) && (
                <div className="bg-rose-50 p-8 rounded-[2rem] border border-rose-100 shadow-sm flex items-center justify-center gap-4">
                    <XCircle size={32} className="text-rose-500" />
                    <div>
                        <h3 className="text-lg font-black text-rose-700 uppercase tracking-tight">Return Process Terminated</h3>
                        <p className="text-sm font-bold text-rose-500/80">This return request has been {ret.status.toLowerCase()}.</p>
                    </div>
                </div>
            )}

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
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-2">Customer Node</label>
                                <div className="space-y-1">
                                    <p className="text-base font-bold text-gray-900">{ret.userId?.firstName} {ret.userId?.lastName}</p>
                                    <p className="text-xs text-gray-500 font-medium">{ret.userId?.email}</p>
                                    <p className="text-xs text-gray-500 font-medium">{ret.userId?.mobile}</p>
                                </div>
                            </div>
                            <div>
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-2">Source Order</label>
                                <div className="flex items-center gap-2 cursor-pointer hover:text-primary transition-colors" onClick={() => navigate(`/orders/${ret.orderId?._id}`)}>
                                    <ShoppingBag size={16} className="text-gray-400 shrink-0" />
                                    <div className="space-y-0.5">
                                        <p className="text-sm font-black text-gray-900">Order #{ret.orderId?.orderNumber}</p>
                                        <p className="text-[10px] text-gray-400 font-bold uppercase">View Original Order</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                        {ret.pickupAddress && (
                            <div className="pt-4 border-t border-gray-50">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-2">Pickup Point</label>
                                <div className="flex items-start gap-2">
                                    <MapPin size={16} className="text-gray-400 mt-1 shrink-0" />
                                    <div className="text-sm font-medium text-gray-600 leading-relaxed">
                                        {/* Assuming pickupAddress has similar structure or is a string */}
                                        {typeof ret.pickupAddress === 'string' ? ret.pickupAddress :
                                            `${ret.pickupAddress.street || ''}, ${ret.pickupAddress.city || ''} ${ret.pickupAddress.state || ''} ${ret.pickupAddress.pincode || ''}`}
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Return Items (Asset Manifest) */}
                    <div className="bg-white p-8 rounded-[2.5rem] border border-primary/5 shadow-sm space-y-6">
                        <div className="flex items-center justify-between pb-4 border-b border-gray-50">
                            <div className="flex items-center gap-3">
                                <Package size={20} className="text-primary" />
                                <h3 className="font-black text-sm text-gray-900 uppercase tracking-widest">Asset Manifest</h3>
                            </div>
                            <span className="text-[10px] font-black text-primary bg-primary/5 px-2 py-0.5 rounded-lg border border-primary/10">{ret.items.length} Units</span>
                        </div>
                        <div className="space-y-4">
                            {ret.items.map((item, idx) => (
                                <div key={idx} className="flex gap-6 p-4 rounded-2xl bg-gray-50/50 border border-gray-100 hover:border-primary/10 transition-colors">
                                    <div className="w-20 h-20 bg-white rounded-xl border border-gray-200 overflow-hidden shrink-0 p-1">
                                        {item.images && item.images.length > 0 ? (
                                            <img src={item.images[0]} alt="" className="w-full h-full object-cover rounded-lg" />
                                        ) : (
                                            <Package className="w-full h-full p-4 text-gray-300" />
                                        )}
                                    </div>
                                    <div className="flex-1 min-w-0 flex flex-col justify-center">
                                        <p className="text-sm font-black text-gray-900 truncate">SKU-{(item.skuId as any).toString().slice(-6).toUpperCase()}</p>
                                        <p className="text-[10px] font-bold text-gray-500 uppercase mt-0.5">{item.reason}</p>
                                        {item.description && (
                                            <p className="text-[10px] text-gray-400 italic mt-1 line-clamp-1">"{item.description}"</p>
                                        )}
                                    </div>
                                    <div className="text-right">
                                        <div className="text-base font-black text-gray-900 uppercase flex items-center justify-end">₹{item.price * item.quantity}</div>
                                        <span className="text-[10px] text-gray-500 font-bold uppercase tracking-widest bg-white border border-gray-200 px-2 py-1 rounded-md mt-1 inline-block">Qty: {item.quantity}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                        <div className="pt-6 border-t border-gray-50 space-y-3">
                            <div className="flex justify-between pt-4 border-t border-gray-100/50 text-base font-black text-emerald-600 uppercase tracking-tight">
                                <span>Total Refund Amount</span>
                                <span className="text-xl">₹{ret.totalRefundAmount}</span>
                            </div>
                        </div>
                    </div>
                    {/* Payment Ledger Section */}
                    <div className="bg-white p-8 rounded-[2.5rem] border border-primary/5 shadow-sm space-y-6">
                        <div className="flex items-center justify-between pb-4 border-b border-gray-50">
                            <div className="flex items-center gap-3">
                                <CreditCard size={20} className="text-primary" />
                                <h3 className="font-black text-sm text-gray-900 uppercase tracking-widest">Payment Ledger</h3>
                            </div>
                            <span className="text-[10px] font-black text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-lg border border-emerald-100">{payments.length} Transactions</span>
                        </div>
                        <div className="space-y-4">
                            {payments.length > 0 ? (
                                payments.map((payment, idx) => (
                                    <div key={idx} className="flex items-center justify-between p-4 rounded-2xl bg-gray-50/50 border border-gray-100">
                                        <div className="flex items-center gap-4">
                                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${payment.status === 'SUCCESS' ? 'bg-emerald-100 text-emerald-600' : 'bg-amber-100 text-amber-600'}`}>
                                                <IndianRupee size={18} />
                                            </div>
                                            <div>
                                                <p className="text-xs font-black text-gray-900 uppercase">{payment.gatewayName}</p>
                                                <p className="text-[10px] text-gray-400 font-bold uppercase">{payment.internalPaymentId}</p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-sm font-black text-gray-900">₹{payment.amount}</p>
                                            <span className={`text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-md border ${payment.status === 'SUCCESS' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' :
                                                payment.status === 'FAILED' ? 'bg-rose-50 text-rose-500 border-rose-100' :
                                                    'bg-amber-50 text-amber-500 border-amber-100'
                                                }`}>{payment.status}</span>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="text-xs text-gray-400 italic py-4 text-center">No payment history discovered.</div>
                            )}
                        </div>
                    </div>

                    {/* Admin Notes */}
                    <div className="bg-white p-8 rounded-[2.5rem] border border-primary/5 shadow-sm">
                        <div className="flex items-center gap-3 pb-4">
                            <FileText size={20} className="text-primary" />
                            <h3 className="font-black text-sm text-gray-900 uppercase tracking-widest">Internal Protocol</h3>
                        </div>
                        <textarea
                            className="w-full bg-gray-50 border-2 border-gray-100 rounded-2xl p-4 text-sm font-bold text-gray-700 outline-none focus:border-primary/20 focus:bg-white focus:ring-4 focus:ring-primary/5 transition-all min-h-[120px]"
                            placeholder="Append internal notes or customer instructions..."
                            value={adminNotes}
                            onChange={(e) => setAdminNotes(e.target.value)}
                        />
                    </div>
                </div>

                {/* Right Section: State Specific UI */}
                <div className="space-y-6">
                    {/* Action Card */}
                    <div className="bg-primary p-1 rounded-[2.5rem] shadow-xl shadow-primary/20">
                        <div className="bg-white p-8 rounded-[2.2rem] space-y-6">
                            <div className="flex items-center gap-3">
                                <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
                                    <ArrowLeftRight size={24} />
                                </div>
                                <div>
                                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Decision Engine</p>
                                    <h4 className="text-sm font-black text-gray-900 uppercase tracking-tight">Workflow Actions</h4>
                                </div>
                            </div>

                            <div className="space-y-4">
                                {ret.status === RETURN_STATUS.PENDING && (
                                    <>
                                        <Button
                                            onClick={() => handleUpdateStatus(RETURN_STATUS.APPROVED)}
                                            disabled={updating}
                                            className="w-full h-14 rounded-2xl shadow-lg font-black"
                                        >
                                            <CheckCircle2 size={20} className="mr-2" />
                                            Approve Return
                                        </Button>
                                        <Button
                                            onClick={() => handleUpdateStatus(RETURN_STATUS.REJECTED)}
                                            disabled={updating}
                                            variant="ghost"
                                            className="w-full h-14 rounded-2xl text-rose-500 hover:bg-rose-50 hover:text-rose-600 font-black border-2 border-rose-100"
                                        >
                                            <XCircle size={20} className="mr-2" />
                                            Reject Request
                                        </Button>
                                    </>
                                )}
                                {ret.status === RETURN_STATUS.APPROVED && (
                                    <Button
                                        onClick={() => handleUpdateStatus(RETURN_STATUS.PICKED_UP)}
                                        disabled={updating}
                                        className="w-full h-14 rounded-2xl shadow-lg font-black bg-indigo-600 hover:bg-indigo-700"
                                    >
                                        <Truck size={20} className="mr-2" />
                                        Initialize Pickup
                                    </Button>
                                )}
                                {ret.status === RETURN_STATUS.PICKED_UP && (
                                    <Button
                                        onClick={() => handleUpdateStatus(RETURN_STATUS.RECEIVED)}
                                        disabled={updating}
                                        className="w-full h-14 rounded-2xl shadow-lg font-black bg-purple-600 hover:bg-purple-700"
                                    >
                                        <Package size={20} className="mr-2" />
                                        Confirm Receipt
                                    </Button>
                                )}
                                {ret.status === RETURN_STATUS.RECEIVED && (
                                    <Button
                                        onClick={() => handleUpdateStatus(RETURN_STATUS.COMPLETED)}
                                        disabled={updating}
                                        className="w-full h-14 rounded-2xl shadow-lg font-black bg-emerald-600 hover:bg-emerald-700"
                                    >
                                        <IndianRupee size={20} className="mr-2" />
                                        Process Refund
                                    </Button>
                                )}

                                {['COMPLETED', 'REJECTED', 'CANCELLED'].includes(ret.status) && (
                                    <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100 text-center">
                                        <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Workflow Closed</span>
                                        <p className="text-xs font-bold text-gray-600 mt-1">No further actions available.</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Financial Insights */}
                    <div className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm space-y-4">
                        <div className="flex items-center gap-3 pb-3 border-b border-gray-50">
                            <CreditCard size={18} className="text-primary" />
                            <h3 className="font-black text-xs text-gray-900 uppercase tracking-widest">Financial Status</h3>
                        </div>
                        <div className="flex items-center justify-between">
                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Refund Status</p>
                            <div className="flex items-center gap-2">
                                <span className={`text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full border ${ret.refundStatus === 'PROCESSED' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' :
                                    ret.refundStatus === 'FAILED' ? 'bg-rose-50 text-rose-500 border-rose-100' :
                                        'bg-amber-50 text-amber-500 border-amber-100'
                                    }`}>{ret.refundStatus}</span>
                                <button
                                    onClick={handleSyncRefund}
                                    disabled={syncingRefund}
                                    className={`p-1.5 rounded-lg transition-all ${syncingRefund ? 'bg-gray-100 text-gray-400 animate-spin' : 'hover:bg-primary/10 text-primary'}`}
                                    title="Sync Status"
                                >
                                    <RefreshCw size={14} />
                                </button>
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
                            {(ret.timeline || []).length > 0 ? (
                                (ret.timeline!).slice().reverse().map((log: any, idx: number) => (
                                    <div key={idx} className="relative pl-6">
                                        <div className="absolute left-[-4px] top-1.5 w-2 h-2 rounded-full bg-primary ring-4 ring-primary/5" />
                                        <p className="text-[10px] font-black text-gray-900 uppercase tracking-tight">{log.status.replace(/_/g, ' ')}</p>
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
                </div>
            </div>
        </div>
    );
};

export default ReturnDetails;
