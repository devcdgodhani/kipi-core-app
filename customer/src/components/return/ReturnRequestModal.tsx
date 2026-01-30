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

    const getIdentifier = (item: any) => {
        const id = item.skuId?._id || item.skuId || item.productId?._id || item.productId;
        return id?.toString() || '';
    };

    const toggleItem = (item: any) => {
        const itemKey = getIdentifier(item);
        setSelectedItems(prev => {
            const exists = prev.find(i => getIdentifier(i) === itemKey);
            if (exists) return prev.filter(i => getIdentifier(i) !== itemKey);
            return [...prev, {
                productId: item.productId?._id || item.productId,
                skuId: item.skuId?._id || item.skuId,
                quantity: 1,
                price: item.price,
                name: item.name,
                image: item.image,
                reason: ''
            }];
        });
    };

    const updateItemQty = (id: string, qty: number) => {
        setSelectedItems(prev => prev.map(i => getIdentifier(i) === id ? { ...i, quantity: qty } : i));
    };

    const handleSubmit = async () => {
        console.log('RMA Execution Attempt', { items: selectedItems.length, reason });

        if (selectedItems.length === 0) {
            toast.error('Protocol Error: Identify at least one asset for return');
            return;
        }
        if (!reason) {
            toast.error('Protocol Error: Specify a classification reason');
            return;
        }

        try {
            setLoading(true);
            const totalRefundAmount = selectedItems.reduce((acc, curr) => {
                const price = Number(curr.price) || 0;
                const qty = Number(curr.quantity) || 0;
                return acc + (price * qty);
            }, 0);

            const payload = {
                orderId: order._id,
                items: selectedItems.map(item => ({
                    skuId: getIdentifier(item),
                    quantity: item.quantity,
                    price: item.price,
                    reason: reason,
                    description: description
                })),
                totalRefundAmount,
                pickupAddress: order.shippingAddress
            };

            await returnService.requestReturn(payload);
            toast.success('Return Request Protocol Initialized');
            onSuccess();
            onClose();
        } catch (err: any) {
            console.error('RMA System Failure', err);
            toast.error(err.response?.data?.message || 'Failed to initialize return protocol');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            {/* Backdrop */}
            <div
                className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
                onClick={onClose}
            />

            {/* Modal Content container with scroll if needed */}
            <div className="relative z-[110] w-full max-w-4xl max-h-[90vh] overflow-hidden bg-background rounded-[2.5rem] shadow-2xl border border-primary/10 animate-in fade-in zoom-in duration-300">
                <div className="flex h-full flex-col md:flex-row">
                    {/* Sidebar Order Info */}
                    <div className="w-full md:w-72 bg-primary/5 border-r border-primary/10 p-8">
                        <div className="flex items-center gap-4 mb-8">
                            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                                <RotateCcw size={20} />
                            </div>
                            <div>
                                <h2 className="text-sm font-black text-primary uppercase font-mono tracking-tight leading-none">RMA Initiation</h2>
                                <p className="text-[10px] font-bold text-secondary/50 uppercase tracking-widest mt-1">Source Order</p>
                            </div>
                        </div>

                        <div className="space-y-6">
                            <div>
                                <span className="text-[10px] font-black text-secondary/50 uppercase tracking-widest block mb-2">Original Reference</span>
                                <p className="text-xs font-black text-primary">#{order.orderNumber}</p>
                            </div>

                            <div>
                                <span className="text-[10px] font-black text-secondary/50 uppercase tracking-widest block mb-2">Financial Payload</span>
                                <p className="text-sm font-black text-primary">₹{order.totalAmount.toLocaleString()}</p>
                            </div>

                            <div>
                                <span className="text-[10px] font-black text-secondary/50 uppercase tracking-widest block mb-2">Checkout Timestamp</span>
                                <p className="text-[10px] font-bold text-secondary uppercase">
                                    {new Date(order.createdAt).toLocaleDateString(undefined, {
                                        year: 'numeric',
                                        month: 'short',
                                        day: 'numeric'
                                    })}
                                </p>
                            </div>

                            <div className="pt-6 border-t border-primary/5">
                                <span className="text-[10px] font-black text-secondary/50 uppercase tracking-widest block mb-2">Pickup Protocol Address</span>
                                <div className="p-3 bg-background rounded-xl border border-primary/20">
                                    <p className="text-[10px] font-black text-primary mb-1">{order.shippingAddress.name}</p>
                                    <p className="text-[9px] font-bold text-secondary leading-relaxed uppercase">
                                        {order.shippingAddress.street}, {order.shippingAddress.city}, {order.shippingAddress.pincode}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="flex-1 p-8 overflow-y-auto custom-scrollbar">
                        <div className="flex items-center justify-between mb-8">
                            <h3 className="text-lg font-black text-primary tracking-tight uppercase">Construct Request</h3>
                            <button onClick={onClose} className="p-2 hover:bg-primary/10 text-secondary/50 hover:text-primary rounded-xl transition-all">
                                <X size={20} />
                            </button>
                        </div>

                        <div className="space-y-8">
                            {/* Item Selection */}
                            <section>
                                <div className="flex items-center justify-between mb-4">
                                    <h4 className="text-[10px] font-black text-secondary/50 uppercase tracking-[0.2em] flex items-center gap-2">
                                        <Package size={14} className="text-rose-500" />
                                        Asset Identification
                                    </h4>
                                    <span className="text-[10px] font-black text-rose-500 bg-rose-50 px-2 py-0.5 rounded">
                                        {selectedItems.length} Selected
                                    </span>
                                </div>
                                <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                                    {order.items.map((item, idx) => {
                                        const itemKey = getIdentifier(item);
                                        const isSelected = selectedItems.find(i => getIdentifier(i) === itemKey);
                                        return (
                                            <div
                                                key={idx}
                                                onClick={() => toggleItem(item)}
                                                className={`p-4 rounded-2xl border-2 transition-all cursor-pointer flex items-center gap-4 ${isSelected ? 'bg-rose-500/10 border-rose-500/20' : 'bg-background border-primary/10 hover:border-primary/20'
                                                    }`}
                                            >
                                                <div className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all ${isSelected ? 'bg-rose-500 border-rose-500 text-white' : 'border-primary/20'
                                                    }`}>
                                                </div>
                                                <div className="w-16 h-16 bg-primary/5 rounded-xl overflow-hidden flex-shrink-0 border border-primary/10">
                                                    <img src={item.image || '/placeholder-product.png'} alt={item.name} className="w-full h-full object-cover" />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-sm font-bold text-primary truncate">{item.name}</p>
                                                    <p className="text-[10px] font-black text-secondary/50 uppercase tracking-widest mt-1">₹{item.price} • Max Units: {item.quantity}</p>
                                                </div>
                                                {isSelected && (
                                                    <div className="flex items-center gap-3 bg-background p-1 rounded-xl shadow-sm border border-rose-100" onClick={(e) => e.stopPropagation()}>
                                                        <button
                                                            onClick={() => updateItemQty(itemKey, Math.max(1, isSelected.quantity - 1))}
                                                            className="w-8 h-8 rounded-lg hover:bg-primary/5 flex items-center justify-center text-secondary/50"
                                                        >-</button>
                                                        <span className="text-sm font-black text-rose-500 w-4 text-center">{isSelected.quantity}</span>
                                                        <button
                                                            onClick={() => updateItemQty(itemKey, Math.min(item.quantity, isSelected.quantity + 1))}
                                                            className="w-8 h-8 rounded-lg hover:bg-primary/5 flex items-center justify-center text-secondary/50"
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
                                    <h3 className="text-[10px] font-black text-secondary/50 uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
                                        <HelpCircle size={14} className="text-rose-500" />
                                        Classification Header
                                    </h3>
                                    <div className="grid grid-cols-2 gap-3">
                                        {RETURN_REASONS.map((r) => (
                                            <button
                                                key={r.value}
                                                onClick={() => setReason(r.value)}
                                                className={`px-4 py-3 rounded-xl border-2 text-[10px] font-black uppercase tracking-widest transition-all text-left flex items-center justify-between ${reason === r.value ? 'bg-primary text-background border-primary shadow-lg shadow-primary/20 scale-[1.02]' : 'bg-primary/5 border-transparent text-secondary hover:bg-primary/10'
                                                    }`}
                                            >
                                                {r.label}
                                                {reason === r.value && <CheckCircle2 size={12} />}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div className="col-span-2">
                                    <label className="text-[10px] font-black text-secondary/50 uppercase tracking-[0.2em] block mb-3">Additional Intelligence (Optional)</label>
                                    <textarea
                                        className="w-full bg-primary/5 border-2 border-transparent focus:bg-background focus:border-primary/20 rounded-2xl p-4 text-xs font-bold text-secondary outline-none transition-all min-h-[100px]"
                                        placeholder="Describe the asset failure or discrepancy in detail..."
                                        value={description}
                                        onChange={(e) => setDescription(e.target.value)}
                                    />
                                </div>
                            </section>

                            {/* Summary and Action */}
                            <div className="pt-6 border-t border-primary/10">
                                <div className="flex items-center justify-between mb-6 bg-emerald-500/5 p-6 rounded-3xl border border-emerald-500/10">
                                    <div>
                                        <span className="text-[10px] font-black text-emerald-600 uppercase tracking-widest block mb-1">Estimated Refund Payload</span>
                                        <div className="flex items-center gap-2 text-2xl font-black text-emerald-700 font-mono">
                                            <IndianRupee size={22} />
                                            {selectedItems.reduce((acc, curr) => acc + (curr.price * curr.quantity), 0).toLocaleString()}
                                        </div>
                                    </div>
                                    <div className="flex flex-col items-end">
                                        <span className="text-[10px] font-black text-secondary/50 uppercase tracking-widest mb-1">State Transition</span>
                                        <span className="text-[10px] font-black text-emerald-600 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20 uppercase">Awaiting Approval</span>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <button
                                        onClick={onClose}
                                        className="h-14 rounded-2xl text-[10px] font-black uppercase tracking-widest text-secondary/50 hover:text-secondary hover:bg-primary/5 transition-all"
                                    >
                                        Abort RMA
                                    </button>
                                    <button
                                        onClick={handleSubmit}
                                        className="h-14 bg-rose-500 text-background rounded-2xl font-black uppercase text-[10px] tracking-[0.2em] shadow-xl shadow-rose-500/20 hover:bg-rose-600 transition-all flex items-center justify-center gap-2"
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
