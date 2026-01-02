import React, { useState } from 'react';
import { X, ShoppingBag, CheckCircle2, IndianRupee, RotateCcw, Package, HelpCircle } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { returnService } from '../../services/returnService';
import type { Order } from '../../types/order.types';

interface ReturnRequestModalProps {
    isOpen: boolean;
    onClose: () => void;
    order: Order;
    onSuccess: () => void;
}

const RETURN_REASONS = [
    { label: 'Defective/Damaged Product', value: 'DEFECTIVE' },
    { label: 'Wrong Item Sent', value: 'WRONG_ITEM' },
    { label: 'Size/Fit Issue', value: 'SIZE_ISSUE' },
    { label: 'Quality Not as Expected', value: 'QUALITY_ISSUE' },
    { label: 'Better Price Available', value: 'BETTER_PRICE' },
    { label: 'No Longer Needed', value: 'NO_LONGER_NEEDED' },
];

export const ReturnRequestModal: React.FC<ReturnRequestModalProps> = ({
    isOpen,
    onClose,
    order,
    onSuccess
}) => {
    const [selectedItems, setSelectedItems] = useState<any[]>([]);
    const [reason, setReason] = useState('');
    const [description, setDescription] = useState('');
    const [loading, setLoading] = useState(false);

    if (!isOpen) return null;

    const toggleItem = (item: any) => {
        setSelectedItems(prev => {
            const exists = prev.find(i => i.skuId === item.skuId);
            if (exists) return prev.filter(i => i.skuId !== item.skuId);
            return [...prev, {
                skuId: item.skuId,
                quantity: item.quantity,
                price: item.price,
                name: item.name,
                image: item.image,
                reason: '' // Can be overridden per item if needed, but we'll use a global one for simplicity now
            }];
        });
    };

    const updateItemQty = (skuId: string, qty: number) => {
        setSelectedItems(prev => prev.map(i => i.skuId === skuId ? { ...i, quantity: qty } : i));
    };

    const handleSubmit = async () => {
        if (selectedItems.length === 0) {
            toast.error('Please select at least one item to return');
            return;
        }
        if (!reason) {
            toast.error('Please select a reason for the return');
            return;
        }

        try {
            setLoading(true);
            const totalRefundAmount = selectedItems.reduce((acc, curr) => acc + (curr.price * curr.quantity), 0);

            const payload = {
                orderId: order._id,
                items: selectedItems.map(item => ({
                    skuId: item.skuId,
                    quantity: item.quantity,
                    price: item.price,
                    reason: reason,
                    description: description
                })),
                totalRefundAmount
            };

            await returnService.requestReturn(payload);
            toast.success('Return Request Protocol Initialized');
            onSuccess();
            onClose();
        } catch (err: any) {
            console.error('RMA Failed', err);
            toast.error(err.response?.data?.message || 'Failed to initialize return protocol');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[100] overflow-y-auto">
            <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
                <div className="fixed inset-0 transition-opacity bg-black/60 backdrop-blur-sm" onClick={onClose} />

                <span className="hidden sm:inline-block sm:align-middle sm:h-screen">&#8203;</span>

                <div className="inline-block overflow-hidden text-left align-bottom transition-all transform bg-white rounded-[2.5rem] shadow-2xl sm:my-8 sm:align-middle sm:max-w-2xl sm:w-full border border-gray-100">
                    <div className="bg-white p-8">
                        <div className="flex items-center justify-between mb-8">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-2xl bg-rose-500 flex items-center justify-center text-white shadow-lg shadow-rose-500/20">
                                    <RotateCcw size={24} />
                                </div>
                                <div>
                                    <h2 className="text-xl font-black text-gray-900 uppercase font-mono tracking-tight">RMA Initiation</h2>
                                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">Order Ref: #{order.orderNumber}</p>
                                </div>
                            </div>
                            <button onClick={onClose} className="p-3 hover:bg-gray-100 text-gray-400 hover:text-gray-900 rounded-2xl transition-all">
                                <X size={24} />
                            </button>
                        </div>

                        <div className="space-y-8">
                            {/* Item Selection */}
                            <section>
                                <div className="flex items-center justify-between mb-4">
                                    <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] flex items-center gap-2">
                                        <Package size={14} className="text-rose-500" />
                                        Asset Selection
                                    </h3>
                                    <span className="text-[10px] font-black text-rose-500">
                                        {selectedItems.length} Identified
                                    </span>
                                </div>
                                <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                                    {order.items.map((item, idx) => {
                                        const isSelected = selectedItems.find(i => i.skuId === item.skuId);
                                        return (
                                            <div
                                                key={idx}
                                                onClick={() => toggleItem(item)}
                                                className={`p-4 rounded-2xl border-2 transition-all cursor-pointer flex items-center gap-4 ${isSelected ? 'bg-rose-50 border-rose-200' : 'bg-white border-gray-100 hover:border-gray-200'
                                                    }`}
                                            >
                                                <div className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all ${isSelected ? 'bg-rose-500 border-rose-500 text-white' : 'border-gray-200'
                                                    }`}>
                                                    {isSelected && <CheckCircle2 size={14} />}
                                                </div>
                                                <div className="w-16 h-16 bg-gray-50 rounded-xl overflow-hidden flex-shrink-0 border border-gray-100">
                                                    <img src={item.image || '/placeholder-product.png'} alt={item.name} className="w-full h-full object-cover" />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-sm font-bold text-gray-900 truncate">{item.name}</p>
                                                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-1">₹{item.price} • Max Units: {item.quantity}</p>
                                                </div>
                                                {isSelected && (
                                                    <div className="flex items-center gap-3 bg-white p-1 rounded-xl shadow-sm border border-rose-100" onClick={(e) => e.stopPropagation()}>
                                                        <button
                                                            onClick={() => updateItemQty(item.skuId!, Math.max(1, isSelected.quantity - 1))}
                                                            className="w-8 h-8 rounded-lg hover:bg-gray-50 flex items-center justify-center text-gray-400"
                                                        >-</button>
                                                        <span className="text-sm font-black text-rose-500 w-4 text-center">{isSelected.quantity}</span>
                                                        <button
                                                            onClick={() => updateItemQty(item.skuId!, Math.min(item.quantity, isSelected.quantity + 1))}
                                                            className="w-8 h-8 rounded-lg hover:bg-gray-50 flex items-center justify-center text-gray-400"
                                                        >+</button>
                                                    </div>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                            </section>

                            {/* Reason Selection */}
                            <section className="grid grid-cols-2 gap-6">
                                <div className="col-span-2">
                                    <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
                                        <HelpCircle size={14} className="text-rose-500" />
                                        Classification Header
                                    </h3>
                                    <div className="grid grid-cols-2 gap-3">
                                        {RETURN_REASONS.map((r) => (
                                            <button
                                                key={r.value}
                                                onClick={() => setReason(r.value)}
                                                className={`px-4 py-3 rounded-xl border-2 text-[10px] font-black uppercase tracking-widest transition-all text-left flex items-center justify-between ${reason === r.value ? 'bg-primary text-white border-primary shadow-lg shadow-primary/20 scale-[1.02]' : 'bg-gray-50 border-transparent text-gray-500 hover:bg-gray-100'
                                                    }`}
                                            >
                                                {r.label}
                                                {reason === r.value && <CheckCircle2 size={12} />}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div className="col-span-2">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] block mb-3">Additional Intelligence (Optional)</label>
                                    <textarea
                                        className="w-full bg-gray-50 border-2 border-transparent focus:bg-white focus:border-primary/20 rounded-2xl p-4 text-xs font-bold text-gray-700 outline-none transition-all min-h-[100px]"
                                        placeholder="Describe the asset failure or discrepancy in detail..."
                                        value={description}
                                        onChange={(e) => setDescription(e.target.value)}
                                    />
                                </div>
                            </section>

                            {/* Summary and Action */}
                            <div className="pt-6 border-t border-gray-100">
                                <div className="flex items-center justify-between mb-6 bg-emerald-500/5 p-6 rounded-3xl border border-emerald-500/10">
                                    <div>
                                        <span className="text-[10px] font-black text-emerald-600 uppercase tracking-widest block mb-1">Estimated Refund Payload</span>
                                        <div className="flex items-center gap-2 text-2xl font-black text-emerald-700 font-mono">
                                            <IndianRupee size={22} />
                                            {selectedItems.reduce((acc, curr) => acc + (curr.price * curr.quantity), 0).toLocaleString()}
                                        </div>
                                    </div>
                                    <div className="flex flex-col items-end">
                                        <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">State Transition</span>
                                        <span className="text-[10px] font-black text-emerald-600 bg-emerald-100 px-3 py-1 rounded-full border border-emerald-200 uppercase">Awaiting Approval</span>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <button
                                        onClick={onClose}
                                        className="h-14 rounded-2xl text-[10px] font-black uppercase tracking-widest text-gray-400 hover:text-gray-600 hover:bg-gray-50 transition-all"
                                    >
                                        Abort RMA
                                    </button>
                                    <button
                                        onClick={handleSubmit}
                                        disabled={loading || selectedItems.length === 0 || !reason}
                                        className="h-14 bg-rose-500 text-white rounded-2xl font-black uppercase text-[10px] tracking-[0.2em] shadow-xl shadow-rose-500/20 hover:bg-rose-600 transition-all disabled:opacity-50 disabled:shadow-none flex items-center justify-center gap-2"
                                    >
                                        {loading ? (
                                            <RotateCcw size={18} className="animate-spin" />
                                        ) : (
                                            <>
                                                <ShoppingBag size={18} />
                                                Authorize Return
                                            </>
                                        )}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
