import React, { useEffect, useState, useCallback } from 'react';
import {
    Search,
    Filter,
    Plus,
    Edit2,
    Trash2,
    ChevronLeft,
    ChevronRight,
    Loader2,
    RotateCcw,
    Calendar,
    BadgeDollarSign,
    Package
} from 'lucide-react';
import { lotService } from '../../services/lot.service';
import { type ILot, type ILotFilters, LOT_STATUS, LOT_TYPE } from '../../types/lot';
import CustomButton from '../../components/common/Button';
import CustomInput from '../../components/common/Input';
import { Modal } from '../../components/common/Modal';
import { Table } from '../../components/common/Table';
import { CommonFilter, type FilterField } from '../../components/common/CommonFilter';
import { userService } from '../../services/user.service';
import { USER_TYPE } from '../../types/user';

const LotList: React.FC = () => {
    const [lots, setLots] = useState<ILot[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [selectedLot, setSelectedLot] = useState<ILot | null>(null);
    const [isFilterOpen, setIsFilterOpen] = useState(false);

    // Filters & Pagination State
    const [filters, setFilters] = useState<ILotFilters>({
        search: '',
        status: undefined,
        type: undefined,
        startDate: undefined,
        endDate: undefined,
        page: 1,
        limit: 10,
        isPaginate: true
    });

    const [pagination, setPagination] = useState({
        totalRecords: 0,
        totalPages: 0,
        currentPage: 1
    });

    const fetchLots = useCallback(async () => {
        try {
            setLoading(true);
            const response = await lotService.getWithPagination(filters);
            if (response && response.data) {
                setLots(response.data.recordList);
                setPagination({
                    totalRecords: response.data.totalRecords,
                    totalPages: response.data.totalPages,
                    currentPage: response.data.currentPage
                });
            }
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to fetch lots');
        } finally {
            setLoading(false);
        }
    }, [filters]);

    useEffect(() => {
        const timer = setTimeout(() => {
            fetchLots();
        }, 300);
        return () => clearTimeout(timer);
    }, [fetchLots]);

    const handleFilterChange = (updatedFilters: Record<string, any>) => {
        setFilters(prev => ({ ...prev, ...updatedFilters, page: 1 }));
    };

    const handleLimitChange = (newLimit: number) => {
        setFilters(prev => ({ ...prev, limit: newLimit, page: 1 }));
    };

    const handleDeleteLot = async (id: string) => {
        if (window.confirm('Are you sure you want to delete this lot?')) {
            try {
                await lotService.delete(id);
                fetchLots();
            } catch (err: any) {
                alert(err.response?.data?.message || 'Failed to delete lot');
            }
        }
    };

    const filterFields: FilterField[] = [
        {
            key: 'type',
            label: 'Lot Type',
            type: 'select',
            multiple: true,
            options: [
                { label: 'Supplier', value: LOT_TYPE.SUPPLIER },
                { label: 'Self Manufacture', value: LOT_TYPE.SELF_MANUFACTURE }
            ]
        },
        {
            key: 'status',
            label: 'Status',
            type: 'select',
            multiple: true,
            options: [
                { label: 'Active', value: LOT_STATUS.ACTIVE },
                { label: 'Inactive', value: LOT_STATUS.INACTIVE },
                { label: 'Completed', value: LOT_STATUS.COMPLETED }
            ]
        },
        {
            key: 'startDate',
            label: 'Start Date',
            type: 'date-range'
        },
        {
            key: 'endDate',
            label: 'End Date',
            type: 'date-range'
        }
    ];

    const activeFilterCount = Object.keys(filters).filter(k =>
        !['page', 'limit', 'isPaginate', 'search'].includes(k) &&
        filters[k as keyof ILotFilters] !== undefined &&
        (Array.isArray(filters[k as keyof ILotFilters]) ? (filters[k as keyof ILotFilters] as any[]).length > 0 : true)
    ).length;

    const columns = [
        {
            header: 'Lot Details',
            accessor: (lot: ILot) => (
                <div className="flex items-center gap-4 py-1">
                    <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary border border-primary/10 shadow-inner">
                        <Package size={24} />
                    </div>
                    <div className="flex flex-col">
                        <span className="font-bold text-gray-900 leading-tight">{lot.lotNumber}</span>
                        <div className="flex items-center gap-2 mt-0.5">
                            <span className={`px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-tighter border ${lot.type === LOT_TYPE.SUPPLIER ? 'bg-indigo-50 text-indigo-600 border-indigo-100' : 'bg-emerald-50 text-emerald-600 border-emerald-100'}`}>
                                {lot.type.replace('_', ' ')}
                            </span>
                        </div>
                    </div>
                </div>
            )
        },
        {
            header: 'Supplier / Origin',
            accessor: (lot: ILot) => (
                <div className="flex flex-col gap-1 py-1">
                    {lot.type === LOT_TYPE.SUPPLIER && lot.supplierId ? (
                        <>
                            <span className="text-xs font-bold text-gray-900">{lot.supplierId.firstName} {lot.supplierId.lastName}</span>
                            <span className="text-[10px] text-gray-500 font-medium uppercase tracking-widest">{lot.supplierId.mobile}</span>
                        </>
                    ) : (
                        <span className="text-xs font-bold text-gray-400 italic">Internal Manufacture</span>
                    )}
                </div>
            )
        },
        {
            header: 'Inventory',
            accessor: (lot: ILot) => (
                <div className="flex flex-col gap-1.5 py-1">
                    <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-gray-600">Qty:</span>
                        <span className="text-xs font-black text-primary">{lot.remainingQuantity} / {lot.quantity}</span>
                    </div>
                    <div className="w-full bg-gray-100 h-1.5 rounded-full overflow-hidden">
                        <div
                            className="h-full bg-primary"
                            style={{ width: `${(lot.remainingQuantity / lot.quantity) * 100}%` }}
                        />
                    </div>
                </div>
            )
        },
        {
            header: 'Value',
            accessor: (lot: ILot) => (
                <div className="flex items-center gap-2 text-emerald-600 font-black">
                    <BadgeDollarSign size={16} />
                    <span>₹{lot.basePrice}</span>
                </div>
            )
        },
        {
            header: 'Timeline',
            accessor: (lot: ILot) => (
                <div className="flex flex-col gap-1 py-1">
                    <div className="flex items-center gap-1.5 text-[10px] font-bold text-gray-500 uppercase tracking-widest">
                        <Calendar size={12} className="text-primary" />
                        <span>S: {lot.startDate ? new Date(lot.startDate).toLocaleDateString() : 'N/A'}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-[10px] font-bold text-gray-500 uppercase tracking-widest">
                        <Calendar size={12} className="text-rose-400" />
                        <span>E: {lot.endDate ? new Date(lot.endDate).toLocaleDateString() : 'N/A'}</span>
                    </div>
                </div>
            )
        },
        {
            header: 'Status',
            accessor: (lot: ILot) => (
                <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border ${lot.status === LOT_STATUS.ACTIVE ? 'bg-green-50 text-green-600 border-green-100' :
                        lot.status === LOT_STATUS.COMPLETED ? 'bg-blue-50 text-blue-600 border-blue-100' :
                            'bg-gray-50 text-gray-400 border-gray-100'
                    }`}>
                    {lot.status}
                </span>
            )
        },
        {
            header: 'Actions',
            accessor: (lot: ILot) => (
                <div className="flex items-center gap-1">
                    <button
                        onClick={() => { setSelectedLot(lot); setShowEditModal(true); }}
                        className="p-3 text-primary hover:bg-primary/5 rounded-2xl transition-all hover:scale-110 active:scale-90 border border-transparent hover:border-primary/10"
                        title="Edit Lot"
                    >
                        <Edit2 size={18} />
                    </button>
                    <button
                        onClick={() => handleDeleteLot(lot._id)}
                        className="p-3 text-rose-500 hover:bg-rose-50 rounded-2xl transition-all hover:scale-110 active:scale-90 border border-transparent hover:border-rose-100"
                        title="Delete Lot"
                    >
                        <Trash2 size={18} />
                    </button>
                </div>
            )
        }
    ];

    return (
        <div className="p-6 space-y-6">
            {error && (
                <div className="absolute top-4 right-4 bg-red-50 border border-red-100 text-red-600 px-4 py-3 rounded-xl z-20 animate-in fade-in slide-in-from-top-4 duration-300">
                    <span className="text-sm font-medium">{error}</span>
                </div>
            )}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-[2rem] border border-primary/5 shadow-sm">
                <div>
                    <h1 className="text-3xl font-black text-primary tracking-tight uppercase font-mono">Lot Management</h1>
                    <p className="text-sm text-gray-500 font-medium">Manage manufacturing and supplier batches</p>
                </div>
                <CustomButton onClick={() => setShowCreateModal(true)} className="rounded-2xl shadow-xl shadow-primary/20 h-14 px-8">
                    <Plus size={20} className="mr-2" /> Add New Lot
                </CustomButton>
            </div>

            <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1 relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-primary/40" size={20} />
                    <input
                        type="text"
                        placeholder="Search lots by number..."
                        value={filters.search}
                        onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value, page: 1 }))}
                        className="w-full bg-white border-2 border-primary/5 rounded-3xl py-4 pl-12 pr-4 focus:outline-none focus:border-primary/20 transition-all font-bold text-gray-700 shadow-xl shadow-gray-100/50"
                    />
                </div>

                <div className="flex gap-3">
                    {activeFilterCount > 0 && (
                        <button
                            onClick={() => setFilters({
                                search: '',
                                status: undefined,
                                type: undefined,
                                startDate: undefined,
                                endDate: undefined,
                                page: 1,
                                limit: 10,
                                isPaginate: true
                            })}
                            className="px-4 py-4 rounded-3xl bg-rose-50 border-2 border-rose-100 text-rose-500 hover:bg-rose-100 transition-all font-black uppercase text-[10px] tracking-widest flex items-center gap-2"
                        >
                            <RotateCcw size={14} />
                            Clear
                        </button>
                    )}
                    <button
                        onClick={() => setIsFilterOpen(true)}
                        className={`px-6 py-4 rounded-3xl border-2 flex items-center gap-3 transition-all font-black uppercase text-[10px] tracking-widest ${activeFilterCount > 0
                            ? 'bg-primary border-primary text-white shadow-lg shadow-primary/20'
                            : 'bg-white border-primary/5 text-primary hover:bg-primary/5'
                            }`}
                    >
                        <Filter size={18} />
                        Advanced Filters
                        {activeFilterCount > 0 && (
                            <span className="w-5 h-5 bg-white text-primary rounded-full flex items-center justify-center text-[10px]">
                                {activeFilterCount}
                            </span>
                        )}
                    </button>

                    <div className="flex items-center gap-1 bg-white border-2 border-primary/5 rounded-3xl px-4 py-2 shadow-lg shadow-gray-100/50">
                        <span className="text-[10px] font-black text-gray-400 uppercase tracking-tighter">View</span>
                        <select
                            value={filters.limit}
                            onChange={(e) => handleLimitChange(Number(e.target.value))}
                            className="bg-transparent focus:outline-none font-bold text-primary pl-1 cursor-pointer"
                        >
                            <option value={10}>10</option>
                            <option value={20}>20</option>
                            <option value={50}>50</option>
                            <option value={100}>100</option>
                        </select>
                    </div>
                </div>
            </div>

            <CommonFilter
                isOpen={isFilterOpen}
                onClose={() => setIsFilterOpen(false)}
                fields={filterFields}
                onApply={handleFilterChange}
                currentFilters={filters}
            />

            <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-xl shadow-gray-200/50 overflow-hidden min-h-[400px] relative">
                {loading && (
                    <div className="absolute inset-0 bg-white/60 backdrop-blur-[2px] z-10 flex items-center justify-center">
                        <div className="flex flex-col items-center gap-3">
                            <Loader2 size={40} className="text-primary animate-spin" />
                            <p className="text-sm font-bold text-primary uppercase tracking-widest">Loading Lots...</p>
                        </div>
                    </div>
                )}

                <Table
                    data={lots}
                    columns={columns}
                    keyExtractor={(lot) => lot._id}
                />

                {!loading && lots.length === 0 && (
                    <div className="py-20 flex flex-col items-center justify-center text-gray-400">
                        <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mb-4">
                            <Package size={32} className="opacity-20" />
                        </div>
                        <h3 className="text-lg font-bold text-gray-900">No lots found</h3>
                        <p className="text-sm font-medium">Try adjusting your filters or search terms</p>
                    </div>
                )}
            </div>

            {pagination.totalPages > 0 && (
                <div className="flex items-center justify-between bg-white px-8 py-4 rounded-3xl border border-gray-100 shadow-sm">
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">
                        Showing <span className="text-primary">{lots.length}</span> of <span className="text-primary">{pagination.totalRecords}</span> lots
                    </p>
                    <div className="flex items-center gap-2">
                        <button
                            disabled={filters.page === 1 || loading}
                            onClick={() => setFilters(prev => ({ ...prev, page: prev.page! - 1 }))}
                            className="p-2.5 bg-gray-50 text-gray-400 rounded-xl hover:bg-primary/5 hover:text-primary transition-all disabled:opacity-0"
                        >
                            <ChevronLeft size={20} />
                        </button>

                        <div className="flex items-center gap-1 px-4 py-2 bg-primary/5 border border-primary/10 rounded-xl">
                            <span className="text-sm font-black text-primary">{pagination.currentPage}</span>
                            <span className="text-[10px] font-bold text-primary/40 uppercase tracking-tighter">/ {pagination.totalPages}</span>
                        </div>

                        <button
                            disabled={filters.page === pagination.totalPages || loading}
                            onClick={() => setFilters(prev => ({ ...prev, page: prev.page! + 1 }))}
                            className="p-2.5 bg-gray-50 text-gray-400 rounded-xl hover:bg-primary/5 hover:text-primary transition-all disabled:opacity-0"
                        >
                            <ChevronRight size={20} />
                        </button>
                    </div>
                </div>
            )}

            {showCreateModal && (
                <LotFormModal
                    isOpen={showCreateModal}
                    onClose={() => setShowCreateModal(false)}
                    onSuccess={() => { setShowCreateModal(false); fetchLots(); }}
                />
            )}

            {showEditModal && selectedLot && (
                <LotFormModal
                    isOpen={showEditModal}
                    lot={selectedLot}
                    onClose={() => { setShowEditModal(false); setSelectedLot(null); }}
                    onSuccess={() => { setShowEditModal(false); setSelectedLot(null); fetchLots(); }}
                />
            )}
        </div>
    );
};

interface LotFormModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    lot?: ILot;
}

const LotFormModal: React.FC<LotFormModalProps> = ({ isOpen, onClose, onSuccess, lot }) => {
    const isEdit = !!lot;
    const [formData, setFormData] = useState({
        lotNumber: lot?.lotNumber || '',
        type: lot?.type || LOT_TYPE.SELF_MANUFACTURE,
        supplierId: typeof lot?.supplierId === 'object' ? lot?.supplierId?._id : lot?.supplierId || '',
        basePrice: lot?.basePrice || 0,
        quantity: lot?.quantity || 0,
        startDate: lot?.startDate ? new Date(lot.startDate).toISOString().split('T')[0] : '',
        endDate: lot?.endDate ? new Date(lot.endDate).toISOString().split('T')[0] : '',
        status: lot?.status || LOT_STATUS.ACTIVE,
        notes: lot?.notes || '',
    });
    const [suppliers, setSuppliers] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchSuppliers = async () => {
            try {
                const res = await userService.getWithPagination({ type: USER_TYPE.SUPPLIER, isPaginate: false });
                if (res?.data?.recordList) {
                    setSuppliers(res.data.recordList);
                }
            } catch (err) {
                console.error('Failed to fetch suppliers', err);
            }
        };
        fetchSuppliers();
    }, []);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: ['basePrice', 'quantity'].includes(name) ? Number(value) : value
        }));
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
            if (!payload.startDate) delete (payload as any).startDate;
            if (!payload.endDate) delete (payload as any).endDate;

            if (isEdit) {
                await lotService.update(lot!._id, payload as any);
            } else {
                await lotService.create(payload as any);
            }
            onSuccess();
        } catch (err: any) {
            setError(err.response?.data?.message || `Failed to ${isEdit ? 'update' : 'create'} lot`);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={isEdit ? 'Edit Batch Details' : 'Create New Batch'}>
            <form onSubmit={handleSubmit} className="space-y-5">
                {error && (
                    <div className="p-3 text-xs text-red-600 bg-red-50 border border-red-100 rounded-xl text-center font-bold uppercase tracking-wider">
                        {error}
                    </div>
                )}

                <div className="grid grid-cols-2 gap-4">
                    <CustomInput label="Lot Number" name="lotNumber" value={formData.lotNumber} onChange={handleChange} placeholder="LOT-2024-001" required />
                    <div className="flex flex-col gap-1">
                        <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">Origin Type</label>
                        <select
                            name="type"
                            value={formData.type}
                            onChange={handleChange}
                            className="w-full border-2 border-gray-100 bg-gray-50 rounded-2xl py-3 px-4 focus:outline-none focus:border-primary/30 transition-all font-bold text-gray-700"
                        >
                            <option value={LOT_TYPE.SELF_MANUFACTURE}>Self Manufacture</option>
                            <option value={LOT_TYPE.SUPPLIER}>Supplier Provided</option>
                        </select>
                    </div>
                </div>

                {formData.type === LOT_TYPE.SUPPLIER && (
                    <div className="flex flex-col gap-1">
                        <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1 text-indigo-500">Supplier Name</label>
                        <select
                            name="supplierId"
                            value={formData.supplierId}
                            onChange={handleChange}
                            required
                            className="w-full border-2 border-indigo-50 bg-indigo-50/30 rounded-2xl py-3 px-4 focus:outline-none focus:border-indigo-300 transition-all font-bold text-indigo-900"
                        >
                            <option value="">Select a supplier</option>
                            {suppliers.map(s => (
                                <option key={s._id} value={s._id}>{s.firstName} {s.lastName} ({s.mobile})</option>
                            ))}
                        </select>
                    </div>
                )}

                <div className="grid grid-cols-2 gap-4">
                    <CustomInput label="Base Price (₹)" name="basePrice" type="number" value={formData.basePrice} onChange={handleChange} placeholder="0.00" required />
                    <CustomInput label="Total Quantity" name="quantity" type="number" value={formData.quantity} onChange={handleChange} placeholder="100" required disabled={isEdit} />
                </div>

                <div className="grid grid-cols-2 gap-4 text-emerald-600">
                    <CustomInput label="Start Date" name="startDate" type="date" value={formData.startDate} onChange={handleChange} />
                    <CustomInput label="End Date" name="endDate" type="date" value={formData.endDate} onChange={handleChange} />
                </div>

                <div className="flex flex-col gap-1">
                    <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">Execution Status</label>
                    <select
                        name="status"
                        value={formData.status}
                        onChange={handleChange}
                        className="w-full border-2 border-gray-100 bg-gray-50 rounded-2xl py-3 px-4 focus:outline-none focus:border-primary/30 transition-all font-bold text-gray-700"
                    >
                        <option value={LOT_STATUS.ACTIVE}>In Progress / Active</option>
                        <option value={LOT_STATUS.INACTIVE}>Paused / Inactive</option>
                        <option value={LOT_STATUS.COMPLETED}>Completed</option>
                    </select>
                </div>

                <div className="flex flex-col gap-1">
                    <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">Batch Notes</label>
                    <textarea
                        name="notes"
                        value={formData.notes}
                        onChange={handleChange}
                        className="w-full border-2 border-gray-100 bg-gray-50 rounded-2xl py-3 px-4 focus:outline-none focus:border-primary/30 transition-all font-bold text-gray-700 min-h-[100px]"
                        placeholder="Additional details about this batch..."
                    />
                </div>

                <div className="flex gap-3 pt-4 border-t border-gray-100">
                    <button type="button" onClick={onClose} className="flex-1 py-4 text-gray-500 font-bold hover:bg-gray-50 rounded-2xl transition-all">Cancel</button>
                    <CustomButton type="submit" disabled={loading} className="flex-1 rounded-2xl h-14">{loading ? 'Processing...' : isEdit ? 'Update Batch' : 'Create Batch'}</CustomButton>
                </div>
            </form>
        </Modal>
    );
};

export default LotList;
