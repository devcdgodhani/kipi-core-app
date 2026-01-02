import React, { useState, useEffect } from 'react';
import {
    X, IndianRupee, Clock, CheckCircle2,
    XCircle, Truck, Package, RotateCcw,
    User, ShoppingBag,
    ClipboardList, RefreshCw
} from 'lucide-react';
import type { IReturn } from '../../types/return.types';
import { RETURN_STATUS } from '../../types/return.types';
import { returnService } from '../../services/returnService';
import CustomButton from '../common/Button';
import { toast } from 'react-hot-toast';

interface ReturnDetailSidebarProps {
    isOpen: boolean;
    onClose: () => void;
    returnId: string | null;
    onStatusUpdate: () => void;
}

export const ReturnDetailSidebar: React.FC<ReturnDetailSidebarProps> = ({
    isOpen,
    onClose,
    returnId,
    onStatusUpdate
}) => {
    const [ret, setRet] = useState<IReturn | null>(null);
    const [loading, setLoading] = useState(false);
    const [updating, setUpdating] = useState(false);
    const [adminNotes, setAdminNotes] = useState('');

    useEffect(() => {
        if (isOpen && returnId) {
            fetchReturnDetails();
        }
    }, [isOpen, returnId]);

    const fetchReturnDetails = async () => {
        try {
            setLoading(true);
            const response = await returnService.getOne(returnId!);
            if (response.data?.data) {
                setRet(response.data.data);
                setAdminNotes(response.data.data.adminNotes || '');
            }
        } catch (err) {
            console.error('Failed to fetch return details', err);
            toast.error('Failed to load metadata');
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateStatus = async (newStatus: RETURN_STATUS) => {
        try {
            setUpdating(true);
            await returnService.updateStatus(returnId!, {
                status: newStatus,
                adminNotes
            });
            toast.success(`Transitioned to ${newStatus}`);
            fetchReturnDetails();
            onStatusUpdate();
        } catch (err) {
            console.error('Update failed', err);
            toast.error('Protocol override failed');
        } finally {
            setUpdating(false);
        }
    };

    const StatusBadge = ({ status }: { status: RETURN_STATUS }) => {
        const styles: Record<string, string> = {
            [RETURN_STATUS.PENDING]: 'bg-amber-500/10 text-amber-500 border-amber-500/20',
            [RETURN_STATUS.APPROVED]: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
            [RETURN_STATUS.PICKED_UP]: 'bg-indigo-500/10 text-indigo-500 border-indigo-500/20',
            [RETURN_STATUS.RECEIVED]: 'bg-purple-500/10 text-purple-500 border-purple-500/20',
            [RETURN_STATUS.COMPLETED]: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20',
            [RETURN_STATUS.REJECTED]: 'bg-rose-500/10 text-rose-500 border-rose-500/20',
            [RETURN_STATUS.CANCELLED]: 'bg-gray-500/10 text-gray-500 border-gray-500/20'
        };

        return (
            <div className={`px-4 py-1 rounded-full border text-[10px] font-black uppercase tracking-[0.2em] shadow-sm ${styles[status]}`}>
                {status.replace(/_/g, ' ')}
            </div>
        );
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[60] overflow-hidden pointer-events-none">
            <div
                className={`absolute inset-0 bg-primary/20 backdrop-blur-sm transition-opacity duration-500 pointer-events-auto ${isOpen ? 'opacity-100' : 'opacity-0'}`}
                onClick={onClose}
            />

            <aside className={`absolute top-0 right-0 h-full w-full max-w-2xl bg-white shadow-2xl transition-transform duration-500 transform pointer-events-auto overflow-y-auto ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}>
                {loading ? (
                    <div className="flex flex-col items-center justify-center h-full gap-4">
                        <RefreshCw size={48} className="animate-spin text-primary" />
                        <span className="text-xs font-black text-primary uppercase tracking-widest">Scanning Repository...</span>
                    </div>
                ) : ret && (
                    <div className="flex flex-col h-full bg-gray-50/30">
                        {/* Header Section */}
                        <div className="bg-white p-8 border-b border-gray-100 sticky top-0 z-10">
                            <div className="flex items-center justify-between mb-6">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-2xl bg-rose-500 flex items-center justify-center text-white shadow-lg shadow-rose-500/20">
                                        <RotateCcw size={24} />
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-3 mb-1">
                                            <h2 className="text-xl font-black text-gray-900 uppercase font-mono tracking-tight">{ret.returnNumber}</h2>
                                            <StatusBadge status={ret.status} />
                                        </div>
                                        <p className="text-xs font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
                                            <Clock size={12} />
                                            Target Created: {new Date(ret.createdAt).toLocaleString()}
                                        </p>
                                    </div>
                                </div>
                                <button onClick={onClose} className="p-3 hover:bg-gray-100 text-gray-400 hover:text-gray-900 rounded-2xl transition-all active:scale-90">
                                    <X size={24} />
                                </button>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100">
                                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-2">Customer Node</span>
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                                            <User size={16} />
                                        </div>
                                        <div className="flex flex-col">
                                            <span className="text-xs font-black text-gray-900 truncate">
                                                {ret.userId?.firstName} {ret.userId?.lastName}
                                            </span>
                                            <span className="text-[10px] font-bold text-gray-500 truncate">{ret.userId?.email}</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100">
                                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-2">Source Order</span>
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                                            <ShoppingBag size={16} />
                                        </div>
                                        <div className="flex flex-col">
                                            <span className="text-xs font-black text-gray-900">
                                                {ret.orderId?.orderNumber}
                                            </span>
                                            <span className="text-[10px] font-bold text-gray-500 uppercase">Legacy Entity</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="p-8 space-y-8 flex-1">
                            {/* Return Manifest */}
                            <section>
                                <div className="flex items-center justify-between mb-4">
                                    <h3 className="text-sm font-black text-gray-900 uppercase tracking-widest flex items-center gap-2">
                                        <ClipboardList size={18} className="text-rose-500" />
                                        Asset Manifest
                                    </h3>
                                    <span className="bg-rose-50 text-rose-600 px-3 py-1 rounded-full text-[10px] font-black uppercase">
                                        {ret.items.length} Units
                                    </span>
                                </div>
                                <div className="space-y-3">
                                    {ret.items.map((item, idx) => (
                                        <div key={idx} className="bg-white p-4 rounded-2xl border border-gray-100 hover:border-primary/10 transition-all group">
                                            <div className="flex items-center justify-between gap-4">
                                                <div className="flex items-center gap-4">
                                                    <div className="w-12 h-12 rounded-xl bg-gray-50 flex items-center justify-center border border-gray-100 group-hover:bg-white group-hover:shadow-sm transition-all">
                                                        <Package size={24} className="text-gray-400" />
                                                    </div>
                                                    <div>
                                                        <span className="text-[10px] font-black text-rose-500 uppercase tracking-widest block mb-1">Target SKU</span>
                                                        <p className="text-sm font-black text-gray-900">SKU-{(item.skuId as any).toString().slice(-6).toUpperCase()}</p>
                                                        <p className="text-[10px] font-bold text-gray-400 uppercase mt-1 italic">{item.reason.replace(/_/g, ' ')}</p>
                                                    </div>
                                                </div>
                                                <div className="text-right">
                                                    <p className="text-xs font-black text-gray-900">QTY: {item.quantity}</p>
                                                    <p className="text-xs font-bold text-emerald-600 flex items-center justify-end gap-1 mt-1">
                                                        <IndianRupee size={10} />
                                                        {(item.price * item.quantity).toLocaleString()}
                                                    </p>
                                                </div>
                                            </div>
                                            {item.description && (
                                                <div className="mt-4 pt-4 border-t border-gray-50">
                                                    <p className="text-[10px] font-bold text-gray-500 leading-relaxed italic">"{item.description}"</p>
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </section>

                            {/* Financial Outlook */}
                            <section className="bg-emerald-500/5 rounded-3xl p-6 border-2 border-dashed border-emerald-500/20">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <h3 className="text-[10px] font-black text-emerald-600 uppercase tracking-[0.2em] mb-1">Calculated Refund Delta</h3>
                                        <div className="flex items-center gap-2 text-3xl font-black text-emerald-700 font-mono">
                                            <IndianRupee size={28} />
                                            {ret.totalRefundAmount.toLocaleString()}
                                        </div>
                                    </div>
                                    <div className={`px-4 py-2 rounded-2xl font-black uppercase text-[10px] tracking-widest border-2 ${ret.refundStatus === 'PROCESSED' ? 'bg-emerald-100 border-emerald-200 text-emerald-700' :
                                            ret.refundStatus === 'FAILED' ? 'bg-rose-100 border-rose-200 text-rose-700' :
                                                'bg-amber-100 border-amber-200 text-amber-700 shadow-lg shadow-amber-500/10'
                                        }`}>
                                        {ret.refundStatus} STATUS
                                    </div>
                                </div>
                            </section>

                            {/* Activity Log */}
                            <section>
                                <h3 className="text-sm font-black text-gray-900 uppercase tracking-widest flex items-center gap-2 mb-4">
                                    <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center">
                                        <Clock size={18} className="text-indigo-500" />
                                    </div>
                                    Lifecycle History
                                </h3>
                                <div className="space-y-6 relative ml-4 before:content-[''] before:absolute before:left-[-1px] before:top-2 before:bottom-2 before:w-[2px] before:bg-indigo-100">
                                    {ret.timeline.map((event, idx) => (
                                        <div key={idx} className="relative pl-8">
                                            <div className="absolute left-[-5px] top-1.5 w-[10px] h-[10px] rounded-full bg-white border-2 border-indigo-400" />
                                            <div className="flex justify-between items-start mb-1">
                                                <span className="text-[10px] font-black text-indigo-500 uppercase tracking-widest">{event.status.replace(/_/g, ' ')}</span>
                                                <span className="text-[10px] font-bold text-gray-400">{new Date(event.timestamp).toLocaleString()}</span>
                                            </div>
                                            <p className="text-xs font-bold text-gray-600 leading-relaxed">{event.message}</p>
                                        </div>
                                    ))}
                                </div>
                            </section>

                            {/* Admin Overrides */}
                            <section className="pt-4 border-t border-gray-100">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-4">Communication Override (Internal Notes)</label>
                                <textarea
                                    className="w-full bg-white border-2 border-gray-100 rounded-2xl p-4 text-xs font-bold text-gray-700 outline-none focus:border-primary/20 focus:ring-4 focus:ring-primary/5 transition-all min-h-[120px]"
                                    placeholder="Append internal protocols or customer instructions..."
                                    value={adminNotes}
                                    onChange={(e) => setAdminNotes(e.target.value)}
                                />
                            </section>
                        </div>

                        {/* Decision Engine (Footer) */}
                        <div className="p-8 bg-white border-t border-gray-100 sticky bottom-0 z-10 shadow-[0_-10px_30px_rgba(0,0,0,0.02)]">
                            <div className="grid grid-cols-2 gap-4">
                                {ret.status === RETURN_STATUS.PENDING && (
                                    <>
                                        <CustomButton
                                            onClick={() => handleUpdateStatus(RETURN_STATUS.REJECTED)}
                                            loading={updating}
                                            className="bg-rose-50 text-rose-600 hover:bg-rose-100 border-2 border-rose-100/50 shadow-none font-black h-14 rounded-2xl"
                                        >
                                            <XCircle size={18} className="mr-2" />
                                            Reject Claim
                                        </CustomButton>
                                        <CustomButton
                                            onClick={() => handleUpdateStatus(RETURN_STATUS.APPROVED)}
                                            loading={updating}
                                            className="bg-emerald-500 text-white hover:bg-emerald-600 shadow-lg shadow-emerald-500/20 border-none font-black h-14 rounded-2xl"
                                        >
                                            <CheckCircle2 size={18} className="mr-2" />
                                            Approve Protocol
                                        </CustomButton>
                                    </>
                                )}
                                {ret.status === RETURN_STATUS.APPROVED && (
                                    <CustomButton
                                        onClick={() => handleUpdateStatus(RETURN_STATUS.PICKED_UP)}
                                        loading={updating}
                                        className="col-span-2 bg-indigo-500 text-white hover:bg-indigo-600 shadow-lg shadow-indigo-500/20 border-none font-black h-14 rounded-2xl"
                                    >
                                        <Truck size={18} className="mr-2" />
                                        Initialize Static Pickup
                                    </CustomButton>
                                )}
                                {ret.status === RETURN_STATUS.PICKED_UP && (
                                    <CustomButton
                                        onClick={() => handleUpdateStatus(RETURN_STATUS.RECEIVED)}
                                        loading={updating}
                                        className="col-span-2 bg-purple-500 text-white hover:bg-purple-600 shadow-lg shadow-purple-500/20 border-none font-black h-14 rounded-2xl"
                                    >
                                        <Package size={18} className="mr-2" />
                                        Confirm Asset Intake
                                    </CustomButton>
                                )}
                                {ret.status === RETURN_STATUS.RECEIVED && (
                                    <CustomButton
                                        onClick={() => handleUpdateStatus(RETURN_STATUS.COMPLETED)}
                                        loading={updating}
                                        className="col-span-2 bg-emerald-500 text-white hover:bg-emerald-600 shadow-lg shadow-emerald-500/20 border-none font-black h-14 rounded-2xl"
                                    >
                                        <IndianRupee size={18} className="mr-2" />
                                        Finalize & Release Refund
                                    </CustomButton>
                                )}
                                {(ret.status === RETURN_STATUS.COMPLETED || ret.status === RETURN_STATUS.REJECTED || ret.status === RETURN_STATUS.CANCELLED) && (
                                    <div className="col-span-2 p-4 bg-gray-50 rounded-2xl border border-gray-100 text-center">
                                        <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Target State Locked</span>
                                        <p className="text-xs font-bold text-gray-600 mt-1">Lifecycle for this entity is terminated.</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </aside>
        </div>
    );
};
