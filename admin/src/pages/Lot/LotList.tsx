import React, { useEffect, useState, useCallback } from 'react';
import {
    Search,
    Filter,
    Plus,
    Edit2,
    Trash2,
    RotateCcw,
    Calendar,
    BadgeDollarSign,
    Package,
    ClipboardList
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { lotService } from '../../services/lot.service';
import { type ILot, type ILotFilters, LOT_STATUS, LOT_TYPE } from '../../types/lot';
import CustomButton from '../../components/common/Button';
import { Table, type Column } from '../../components/common/Table';
import { CommonFilter, type FilterField } from '../../components/common/CommonFilter';
import { AdjustQuantityModal } from '../../components/lot/AdjustQuantityModal';
import { ROUTES } from '../../routes/routeConfig';

const LotList: React.FC = () => {
    const navigate = useNavigate();
    const [lots, setLots] = useState<ILot[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [showAdjustModal, setShowAdjustModal] = useState(false);
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

    const columns: Column<ILot>[] = [
        {
            header: 'Lot Details',
            key: 'details',
            render: (lot) => (
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
            key: 'supplier',
            render: (lot) => (
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
            key: 'inventory',
            render: (lot) => (
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
            key: 'value',
            render: (lot) => (
                <div className="flex items-center gap-2 text-emerald-600 font-black">
                    <BadgeDollarSign size={16} />
                    <span>₹{lot.basePrice}</span>
                </div>
            )
        },
        {
            header: 'Timeline',
            key: 'timeline',
            render: (lot) => (
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
            key: 'status',
            render: (lot) => (
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
            key: 'actions',
            align: 'right' as const,
            render: (lot) => (
                <div className="flex items-center gap-1 justify-end">
                    <button
                        onClick={() => { setSelectedLot(lot); setShowAdjustModal(true); }}
                        className="p-3 text-orange-500 hover:bg-orange-50 rounded-2xl transition-all hover:scale-110 active:scale-90 border border-transparent hover:border-orange-100"
                        title="Adjust Quantity"
                    >
                        <ClipboardList size={18} />
                    </button>
                    <button
                        onClick={() => navigate('/' + ROUTES.DASHBOARD.LOTS_EDIT.replace(':id', lot._id))}
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
                    <p className="text-sm text-gray-500 font-medium">Manage manufacturing and supplier lots</p>
                </div>
                <CustomButton onClick={() => navigate('/' + ROUTES.DASHBOARD.LOTS_CREATE)} className="rounded-2xl shadow-xl shadow-primary/20 h-14 px-8">
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

            <Table
                data={lots}
                columns={columns}
                isLoading={loading}
                keyExtractor={(lot) => lot._id}
                emptyMessage="No lots found"
                pagination={pagination.totalRecords > 0 ? {
                    currentPage: pagination.currentPage,
                    totalPages: pagination.totalPages,
                    totalRecords: pagination.totalRecords,
                    pageSize: filters.limit || 10,
                    onPageChange: (page) => setFilters(prev => ({ ...prev, page })),
                    hasPreviousPage: pagination.currentPage > 1,
                    hasNextPage: pagination.currentPage < pagination.totalPages
                } : undefined}
            />

            {showAdjustModal && selectedLot && (
                <AdjustQuantityModal
                    isOpen={showAdjustModal}
                    lot={selectedLot}
                    onClose={() => { setShowAdjustModal(false); setSelectedLot(null); }}
                    onSuccess={() => { setShowAdjustModal(false); setSelectedLot(null); fetchLots(); }}
                />
            )}
        </div>
    );
};

export default LotList;
