import React, { useState } from 'react';
import { Trash2 } from 'lucide-react';
import { Modal } from '../common/Modal';
import CustomButton from '../common/Button';
import { lotService } from '../../services/lot.service';
import { type ILot, ADJUST_QUANTITY_TYPE } from '../../types/lot';

interface AdjustQuantityModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    lot: ILot;
}

export const AdjustQuantityModal: React.FC<AdjustQuantityModalProps> = ({ isOpen, onClose, onSuccess, lot }) => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [formData, setFormData] = useState<{
        quantity: number | '';
        type: ADJUST_QUANTITY_TYPE;
        reason: string;
    }>({
        quantity: '',
        type: ADJUST_QUANTITY_TYPE.USED,
        reason: ''
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: name === 'quantity' ? Number(value) : value
        }));
    };

    const handleAddAdjustment = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.quantity) return;
        setLoading(true);
        setError(null);
        try {
            await lotService.update(lot._id, {
                $push: {
                    adjustQuantity: {
                        ...formData,
                        date: new Date()
                    }
                }
            } as any);
            onSuccess();
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to add adjustment');
            setLoading(false);
        }
    };

    const handleRemoveAdjustment = async (adjId?: string) => {
        if (!adjId) return;
        if (!window.confirm('Are you sure you want to remove this adjustment? Record will be deleted.')) return;

        setLoading(true);
        try {
            await lotService.update(lot._id, {
                $pull: {
                    adjustQuantity: { _id: adjId }
                }
            } as any);
            onSuccess();
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to remove adjustment');
            setLoading(false);
        }
    };

    const totalAdjusted = (lot.adjustQuantity || []).reduce((acc, curr) => acc + curr.quantity, 0);

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Adjust Quantity">
            <div className="space-y-6">
                <div className="flex gap-4 p-4 bg-primary/5 rounded-2xl border border-primary/10">
                    <div className="flex-1">
                        <p className="text-xs text-gray-500 font-bold uppercase tracking-widest">Total Quantity</p>
                        <p className="text-xl font-black text-gray-900">{lot.quantity}</p>
                    </div>
                    <div className="flex-1 border-l border-primary/10 pl-4">
                        <p className="text-xs text-gray-500 font-bold uppercase tracking-widest">Adjusted</p>
                        <p className="text-xl font-black text-orange-500">{totalAdjusted}</p>
                    </div>
                    <div className="flex-1 border-l border-primary/10 pl-4">
                        <p className="text-xs text-gray-500 font-bold uppercase tracking-widest">Remaining</p>
                        <p className="text-xl font-black text-primary">{lot.remainingQuantity}</p>
                    </div>
                </div>

                <form onSubmit={handleAddAdjustment} className="p-4 border-2 border-dashed border-gray-200 rounded-2xl bg-gray-50">
                    <h3 className="text-sm font-black text-gray-700 uppercase tracking-widest mb-3">Add New Adjustment</h3>

                    {error && (
                        <div className="mb-4 p-3 text-xs text-red-600 bg-red-50 border border-red-100 rounded-xl font-bold">
                            {error}
                        </div>
                    )}

                    <div className="grid grid-cols-2 gap-3 mb-3">
                        <div className="flex flex-col gap-1">
                            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Type</label>
                            <select
                                name="type"
                                value={formData.type}
                                onChange={handleChange}
                                className="w-full border-2 border-gray-200 bg-white rounded-xl py-2 px-3 text-sm font-bold focus:outline-none focus:border-primary/30"
                            >
                                {Object.values(ADJUST_QUANTITY_TYPE).map(t => (
                                    <option key={t} value={t}>{t}</option>
                                ))}
                            </select>
                        </div>
                        <div className="flex flex-col gap-1">
                            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Quantity</label>
                            <input
                                type="number"
                                name="quantity"
                                value={formData.quantity}
                                onChange={handleChange}
                                placeholder="0"
                                required
                                className="w-full border-2 border-gray-200 bg-white rounded-xl py-2 px-3 text-sm font-bold focus:outline-none focus:border-primary/30"
                            />
                        </div>
                    </div>
                    <div className="flex flex-col gap-1 mb-4">
                        <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Reason</label>
                        <input
                            type="text"
                            name="reason"
                            value={formData.reason}
                            onChange={handleChange}
                            placeholder="Reason for adjustment"
                            required
                            className="w-full border-2 border-gray-200 bg-white rounded-xl py-2 px-3 text-sm font-bold focus:outline-none focus:border-primary/30"
                        />
                    </div>
                    <CustomButton type="submit" disabled={loading} className="w-full h-10 rounded-xl text-sm">
                        {loading ? 'Processing...' : 'Add Adjustment'}
                    </CustomButton>
                </form>

                <div className="space-y-3">
                    <h3 className="text-sm font-black text-gray-700 uppercase tracking-widest">History</h3>
                    <div className="max-h-[200px] overflow-y-auto space-y-2 pr-1">
                        {lot.adjustQuantity?.length ? (
                            [...lot.adjustQuantity].reverse().map((adj, i) => (
                                <div key={i} className="flex items-center justify-between p-3 bg-white border border-gray-100 rounded-xl shadow-sm">
                                    <div>
                                        <div className="flex items-center gap-2 mb-1">
                                            <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-widest ${adj.type === ADJUST_QUANTITY_TYPE.LOST || adj.type === ADJUST_QUANTITY_TYPE.DAMAGE ? 'bg-red-50 text-red-500' : 'bg-blue-50 text-blue-500'
                                                }`}>
                                                {adj.type}
                                            </span>
                                            <span className="text-xs text-gray-400 font-bold">{adj.date ? new Date(adj.date).toLocaleDateString() : 'N/A'}</span>
                                        </div>
                                        <p className="text-sm font-medium text-gray-700">{adj.reason}</p>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <span className="text-sm font-black text-primary">-{adj.quantity}</span>
                                        <button
                                            onClick={() => handleRemoveAdjustment(adj._id)}
                                            disabled={loading}
                                            className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                                        >
                                            <Trash2 size={14} />
                                        </button>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <p className="text-center text-sm text-gray-400 py-4 italic">No adjustments recorded</p>
                        )}
                    </div>
                </div>
            </div>
        </Modal>
    );
};
