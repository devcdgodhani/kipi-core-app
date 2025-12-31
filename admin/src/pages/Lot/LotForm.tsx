import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ChevronLeft, Trash2 } from 'lucide-react';
import { lotService } from '../../services/lot.service';
import { userService } from '../../services/user.service';
import { type ILot, LOT_STATUS, LOT_TYPE, ADJUST_QUANTITY_TYPE } from '../../types/lot';
import { USER_TYPE } from '../../types/user';
import CustomInput from '../../components/common/Input';
import CustomButton from '../../components/common/Button';
import { ROUTES } from '../../routes/routeConfig';
import { AdjustQuantityModal } from '../../components/lot/AdjustQuantityModal';
import { Plus } from 'lucide-react';

const LotForm: React.FC = () => {
    const navigate = useNavigate();
    const { id } = useParams<{ id: string }>();
    const isEdit = !!id;

    const [formData, setFormData] = useState<{
        lotNumber: string;
        type: LOT_TYPE;
        supplierId: string;
        basePrice: number;
        quantity: number;
        startDate: string;
        endDate: string;
        status: LOT_STATUS;
        notes: string;
    }>({
        lotNumber: '',
        type: LOT_TYPE.SELF_MANUFACTURE,
        supplierId: '',
        basePrice: 0,
        quantity: 0,
        startDate: '',
        endDate: '',
        status: LOT_STATUS.ACTIVE,
        notes: '',
    });
    const [suppliers, setSuppliers] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [pageLoading, setPageLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [showAdjustModal, setShowAdjustModal] = useState(false);
    const [currentLot, setCurrentLot] = useState<ILot | null>(null);


    const fetchInitialData = useCallback(async () => {
        setPageLoading(true);
        try {
            // Fetch suppliers
            const supplierRes = await userService.getWithPagination({ type: USER_TYPE.SUPPLIER, isPaginate: false });
            if (supplierRes?.data?.recordList) {
                setSuppliers(supplierRes.data.recordList);
            }

            // If edit mode, fetch lot details
            if (isEdit) {
                const lotRes = await lotService.getOne(id);
                if (lotRes?.data) {
                    const lot = lotRes.data;
                    setCurrentLot(lot);
                    setFormData({
                        lotNumber: lot.lotNumber,
                        type: lot.type,
                        supplierId: typeof lot.supplierId === 'object' ? lot.supplierId?._id : lot.supplierId || '',
                        basePrice: lot.basePrice,
                        quantity: lot.quantity,
                        startDate: lot.startDate ? new Date(lot.startDate).toISOString().split('T')[0] : '',
                        endDate: lot.endDate ? new Date(lot.endDate).toISOString().split('T')[0] : '',
                        status: lot.status,
                        notes: lot.notes || '',
                    });
                }
            }
        } catch (err: any) {
            console.error('Failed to fetch data', err);
            setError(err.response?.data?.message || 'Failed to load data');
        } finally {
            setPageLoading(false);
        }
    }, [id, isEdit]);

    useEffect(() => {
        fetchInitialData();
    }, [fetchInitialData]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: ['basePrice', 'quantity'].includes(name) ? Number(value) : value
        }));
    };

    const handleRemoveAdjustment = async (adjId?: string) => {
        if (!adjId || !currentLot) return;
        if (!window.confirm('Are you sure you want to remove this adjustment? Record will be deleted.')) return;

        setLoading(true);
        try {
            await lotService.update(currentLot._id, {
                $pull: {
                    adjustQuantity: { _id: adjId }
                }
            } as any);
            await fetchInitialData();
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to remove adjustment');
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            const payload = { ...formData };
            if (payload.type === LOT_TYPE.SELF_MANUFACTURE) {
                delete (payload as any).supplierId;
            }
            if (!payload.supplierId) delete (payload as any).supplierId;
            if (!payload.startDate) delete (payload as any).startDate;
            if (!payload.endDate) delete (payload as any).endDate;

            if (isEdit) {
                await lotService.update(id, payload as any);
            } else {
                await lotService.create(payload as any);
            }
            navigate('/' + ROUTES.DASHBOARD.LOTS);
        } catch (err: any) {
            setError(err.response?.data?.message || `Failed to ${isEdit ? 'update' : 'create'} lot`);
        } finally {
            setLoading(false);
        }
    };

    if (pageLoading) {
        return <div className="p-8 text-center text-gray-500 font-bold">Loading...</div>;
    }

    return (
        <div className="p-6 space-y-6">
            <div className="flex items-center gap-4 bg-white p-6 rounded-[2rem] border border-primary/5 shadow-sm">
                <button
                    onClick={() => navigate(-1)}
                    className="p-3 bg-gray-50 rounded-2xl hover:bg-gray-100 transition-colors"
                >
                    <ChevronLeft size={24} className="text-gray-700" />
                </button>
                <div>
                    <h1 className="text-3xl font-black text-primary tracking-tight uppercase font-mono">{isEdit ? 'Edit Lot Details' : 'Create New Lot'}</h1>
                    <p className="text-sm text-gray-500 font-medium">{isEdit ? 'Update existing lot information' : 'Register a new manufacturing or supplier lot'}</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                <div className="lg:col-span-8 bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-xl shadow-gray-200/50">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {error && (
                            <div className="p-4 text-sm text-red-600 bg-red-50 border border-red-100 rounded-2xl text-center font-bold uppercase tracking-wider">
                                {error}
                            </div>
                        )}

                        <div className="grid grid-cols-2 gap-6">
                            <CustomInput label="Lot Number" name="lotNumber" value={formData.lotNumber} onChange={handleChange} placeholder="LOT-2024-001" required />
                            <div className="flex flex-col gap-2">
                                <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">Origin Type</label>
                                <select
                                    name="type"
                                    value={formData.type}
                                    onChange={handleChange}
                                    className="w-full border-2 border-gray-100 bg-gray-50 rounded-2xl py-4 px-4 focus:outline-none focus:border-primary/30 transition-all font-bold text-gray-700"
                                >
                                    <option value={LOT_TYPE.SELF_MANUFACTURE}>Self Manufacture</option>
                                    <option value={LOT_TYPE.SUPPLIER}>Supplier Provided</option>
                                </select>
                            </div>
                        </div>

                        {formData.type === LOT_TYPE.SUPPLIER && (
                            <div className="flex flex-col gap-2">
                                <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1 text-indigo-500">Supplier Name</label>
                                <select
                                    name="supplierId"
                                    value={formData.supplierId}
                                    onChange={handleChange}
                                    required
                                    className="w-full border-2 border-indigo-50 bg-indigo-50/30 rounded-2xl py-4 px-4 focus:outline-none focus:border-indigo-300 transition-all font-bold text-indigo-900"
                                >
                                    <option value="">Select a supplier</option>
                                    {suppliers.map(s => (
                                        <option key={s._id} value={s._id}>{s.firstName} {s.lastName} ({s.mobile})</option>
                                    ))}
                                </select>
                            </div>
                        )}

                        <div className="grid grid-cols-2 gap-6">
                            <CustomInput label="Base Price (₹)" name="basePrice" type="number" value={formData.basePrice} onChange={handleChange} placeholder="0.00" required />
                            <div className="relative">
                                <CustomInput label="Total Quantity" name="quantity" type="number" value={formData.quantity} onChange={handleChange} placeholder="100" required disabled={isEdit} />
                                {isEdit && (
                                    <button
                                        type="button"
                                        onClick={() => setShowAdjustModal(true)}
                                        className="absolute top-0 right-0 text-[10px] bg-primary/10 text-primary px-3 py-1 rounded-full font-black uppercase tracking-widest hover:bg-primary/20 transition-all"
                                    >
                                        Adjust Stock
                                    </button>
                                )}
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-6 text-emerald-600">
                            <CustomInput label="Start Date" name="startDate" type="date" value={formData.startDate} onChange={handleChange} />
                            <CustomInput label="End Date" name="endDate" type="date" value={formData.endDate} onChange={handleChange} />
                        </div>

                        <div className="flex flex-col gap-2">
                            <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">Execution Status</label>
                            <select
                                name="status"
                                value={formData.status}
                                onChange={handleChange}
                                className="w-full border-2 border-gray-100 bg-gray-50 rounded-2xl py-4 px-4 focus:outline-none focus:border-primary/30 transition-all font-bold text-gray-700"
                            >
                                <option value={LOT_STATUS.ACTIVE}>In Progress / Active</option>
                                <option value={LOT_STATUS.INACTIVE}>Paused / Inactive</option>
                                <option value={LOT_STATUS.COMPLETED}>Completed</option>
                            </select>
                        </div>

                        <div className="flex flex-col gap-2">
                            <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">Lot Notes</label>
                            <textarea
                                name="notes"
                                value={formData.notes}
                                onChange={handleChange}
                                className="w-full border-2 border-gray-100 bg-gray-50 rounded-2xl py-4 px-4 focus:outline-none focus:border-primary/30 transition-all font-bold text-gray-700 min-h-[120px]"
                                placeholder="Additional details about this lot..."
                            />
                        </div>

                        <div className="flex gap-4 pt-6 border-t border-gray-100">
                            <button
                                type="button"
                                onClick={() => navigate(-1)}
                                className="flex-1 py-4 text-gray-500 font-bold hover:bg-gray-50 rounded-2xl transition-all"
                            >
                                Cancel
                            </button>
                            <CustomButton type="submit" disabled={loading} className="flex-1 rounded-2xl h-14">
                                {loading ? 'Processing...' : isEdit ? 'Update Lot' : 'Create Lot'}
                            </CustomButton>
                        </div>
                    </form>
                </div>

                {isEdit && currentLot && (
                    <div className="lg:col-span-4 space-y-6">
                        <div className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-xl shadow-gray-200/50">
                            <h3 className="text-sm font-black text-gray-700 uppercase tracking-widest mb-4">Stock Statistics</h3>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100">
                                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Total</p>
                                    <p className="text-xl font-black text-gray-900">{currentLot.quantity}</p>
                                </div>
                                <div className="p-4 bg-primary/5 rounded-2xl border border-primary/10">
                                    <p className="text-[10px] font-bold text-primary/50 uppercase tracking-widest mb-1">Remaining</p>
                                    <p className="text-xl font-black text-primary">{currentLot.remainingQuantity}</p>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-xl shadow-gray-200/50">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-sm font-black text-gray-700 uppercase tracking-widest">Adjustment History</h3>
                                <button
                                    onClick={() => setShowAdjustModal(true)}
                                    className="p-2 bg-primary text-white rounded-xl hover:bg-primary/90 transition-all shadow-lg shadow-primary/20"
                                >
                                    <Plus size={18} />
                                    <span className="sr-only">Add Adjustment</span>
                                </button>
                            </div>

                            <div className="space-y-3 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
                                {currentLot.adjustQuantity?.length ? (
                                    [...currentLot.adjustQuantity].reverse().map((adj, i) => (
                                        <div key={i} className="group p-4 bg-gray-50 rounded-2xl border border-gray-100 hover:border-primary/20 transition-all">
                                            <div className="flex items-center justify-between mb-2">
                                                <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-widest ${adj.type === ADJUST_QUANTITY_TYPE.LOST || adj.type === ADJUST_QUANTITY_TYPE.DAMAGE ? 'bg-red-50 text-red-500' : 'bg-blue-50 text-blue-500'
                                                    }`}>
                                                    {adj.type}
                                                </span>
                                                <span className="text-[10px] text-gray-400 font-bold">{adj.date ? new Date(adj.date).toLocaleDateString() : 'N/A'}</span>
                                            </div>
                                            <div className="flex items-start justify-between gap-4">
                                                <p className="text-xs font-medium text-gray-600 leading-relaxed">{adj.reason}</p>
                                                <div className="flex flex-col items-end gap-2">
                                                    <span className="text-sm font-black text-primary">-{adj.quantity}</span>
                                                    <button
                                                        onClick={() => handleRemoveAdjustment(adj._id)}
                                                        className="text-gray-400 hover:text-red-500 p-1.5 text-gray-300 hover:text-red-500 bg-white rounded-lg border border-gray-100 hover:border-red-100 transition-all shadow-sm"
                                                    >
                                                        <Trash2 size={12} />
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="py-12 text-center">
                                        <p className="text-xs text-gray-400 font-bold italic uppercase tracking-widest">No adjustments made</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </div>


            {isEdit && currentLot && showAdjustModal && (
                <AdjustQuantityModal
                    isOpen={showAdjustModal}
                    lot={currentLot}
                    onClose={() => setShowAdjustModal(false)}
                    onSuccess={() => {
                        setShowAdjustModal(false);
                        fetchInitialData();
                    }}
                />
            )}
        </div>
    );
};

export default LotForm;
