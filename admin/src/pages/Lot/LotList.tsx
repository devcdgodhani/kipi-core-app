import React, { useEffect, useState, useCallback } from 'react';
import {
    Search,
    Filter,
    Plus,
    Edit2,
    Trash2,
    RotateCcw,
    BadgeDollarSign,
    Package,
    ClipboardList,
    Archive
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { lotService } from '../../services/lot.service';
import { type ILot, type ILotFilters, LOT_STATUS, LOT_TYPE } from '../../types/lot';
import CustomButton from '../../components/common/Button';
import { Table, type Column } from '../../components/common/Table';
import { CommonFilter, type FilterField } from '../../components/common/CommonFilter';
import { AdjustQuantityModal } from '../../components/lot/AdjustQuantityModal';
import { ROUTES } from '../../routes/routeConfig';
import { PopupModal } from '../../components/common/PopupModal';

const LotList: React.FC = () => {
    const navigate = useNavigate();
    const [lots, setLots] = useState<ILot[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [showAdjustModal, setShowAdjustModal] = useState(false);
    const [selectedLot, setSelectedLot] = useState<ILot | null>(null);
    const [isFilterOpen, setIsFilterOpen] = useState(false);
    const [popup, setPopup] = useState<{
        isOpen: boolean;
        title: string;
        message: string;
        type: 'alert' | 'confirm' | 'prompt';
        onConfirm: () => void;
        loading?: boolean;
    }>({
        isOpen: false,
        title: '',
        message: '',
        type: 'alert',
        onConfirm: () => { }
    });

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
        setPopup({
            isOpen: true,
            title: 'Delete Lot',
            message: 'Are you sure you want to delete this lot? This action cannot be undone.',
            type: 'confirm',
            onConfirm: async () => {
                try {
                    setPopup(prev => ({ ...prev, loading: true }));
                    await lotService.delete(id);
                    fetchLots();
                    setPopup(prev => ({ ...prev, isOpen: false, loading: false }));
                } catch (err: any) {
                    setPopup({
                        isOpen: true,
                        title: 'Error',
                        message: err.response?.data?.message || 'Failed to delete lot',
                        type: 'alert',
                        onConfirm: () => setPopup(prev => ({ ...prev, isOpen: false }))
                    });
                }
            }
        });
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
            header: 'Lot Identity',
            key: 'details',
            render: (lot) => (
                <div className="flex items-center gap-4 py-1">
                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center text-primary border border-primary/10 shadow-inner group-hover:scale-110 transition-transform duration-500">
                        <Package size={26} />
                    </div>
                    <div className="flex flex-col">
                        <span className="font-black text-gray-900 leading-tight uppercase tracking-tight">{lot.lotNumber}</span>
                        <div className="flex items-center gap-2 mt-1">
                            <span className={`px-2 py-0.5 rounded-lg text-[9px] font-black uppercase tracking-widest border shadow-xs ${lot.type === LOT_TYPE.SUPPLIER ? 'bg-indigo-50 text-indigo-600 border-indigo-100' : 'bg-emerald-50 text-emerald-600 border-emerald-100'}`}>
                                {lot.type.replace('_', ' ')}
                            </span>
                        </div>
                    </div>
                </div>
            )
        },
        {
            header: 'Strategic Partner',
            key: 'supplier',
            render: (lot) => (
                <div className="flex flex-col gap-1 py-1">
                    {lot.type === LOT_TYPE.SUPPLIER && lot.supplierId ? (
                        <>
                            <span className="text-sm font-black text-gray-900 uppercase tracking-tight leading-none">{lot.supplierId.firstName} {lot.supplierId.lastName}</span>
                            <span className="text-[10px] text-gray-400 font-black uppercase tracking-[0.2em]">{lot.supplierId.mobile}</span>
                        </>
                    ) : (
                        <span className="text-[10px] font-black text-primary/40 uppercase tracking-widest italic leading-none">Internal Logistics</span>
                    )}
                </div>
            )
        },
        {
            header: 'Stock Velocity',
            key: 'inventory',
            render: (lot) => (
                <div className="flex flex-col gap-2 py-1 min-w-[140px]">
                    <div className="flex items-center justify-between">
                        <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Efficiency</span>
                        <span className="text-[10px] font-black text-primary uppercase tracking-widest">{lot.remainingQuantity} / {lot.quantity}</span>
                    </div>
                    <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden shadow-inner">
                        <div
                            className="h-full bg-primary rounded-full"
                            style={{ width: `${(lot.remainingQuantity / lot.quantity) * 100}%` }}
                        />
                    </div>
                </div>
            )
        },
        {
            header: 'Financial Valuation',
            key: 'value',
            render: (lot) => (
                <div className="flex items-center gap-2 text-emerald-600 font-black bg-emerald-50/50 px-4 py-2 rounded-2xl border border-emerald-100/50 shadow-sm w-fit">
                    <BadgeDollarSign size={16} />
                    <span className="tracking-tight italic">₹{lot.basePrice.toLocaleString()}</span>
                </div>
            )
        },
        {
            header: 'Lifecycle Timeline',
            key: 'timeline',
            render: (lot) => (
                <div className="flex flex-col gap-1.5 py-1">
                    <div className="flex items-center gap-2 text-[10px] font-black text-gray-500 uppercase tracking-widest">
                        <div className="w-1.5 h-1.5 rounded-full bg-primary shadow-sm shadow-primary/40" />
                        <span>ENT: {lot.startDate ? new Date(lot.startDate).toLocaleDateString() : 'N/A'}</span>
                    </div>
                    <div className="flex items-center gap-2 text-[10px] font-black text-gray-400/60 uppercase tracking-widest">
                        <div className="w-1.5 h-1.5 rounded-full bg-rose-400/40 shadow-sm" />
                        <span>EXP: {lot.endDate ? new Date(lot.endDate).toLocaleDateString() : 'N/A'}</span>
                    </div>
                </div>
            )
        },
        {
            header: 'Status',
            key: 'status',
            render: (lot) => {
                const colors: any = {
                    ACTIVE: 'bg-emerald-50 text-emerald-600 border-emerald-100',
                    COMPLETED: 'bg-indigo-50 text-indigo-600 border-indigo-100',
                    INACTIVE: 'bg-gray-50 text-gray-400 border-gray-100'
                };
                return (
                    <span className={`px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-[0.1em] border ${colors[lot.status] || 'bg-gray-50 text-gray-600 border-gray-100'}`}>
                        {lot.status}
                    </span>
                );
            }
        },
        {
            header: 'Actions',
            key: 'actions',
            align: 'right' as const,
            render: (lot) => (
                <div className="flex items-center gap-1 justify-end">
                    <button
                        onClick={() => { setSelectedLot(lot); setShowAdjustModal(true); }}
                        className="p-3 text-gray-400 hover:text-orange-500 hover:bg-orange-50 rounded-2xl transition-all border border-transparent hover:border-orange-100 group"
                        title="Calibrate Stock"
                    >
                        <ClipboardList size={18} className="group-hover:scale-110 transition-transform" />
                    </button>
                    <button
                        onClick={() => navigate('/' + ROUTES.DASHBOARD.LOTS_EDIT.replace(':id', lot._id))}
                        className="p-3 text-gray-400 hover:text-primary hover:bg-primary/5 rounded-2xl transition-all border border-transparent hover:border-primary/10 group"
                        title="Modify Strategic Specs"
                    >
                        <Edit2 size={18} className="group-hover:scale-110 transition-transform" />
                    </button>
                    <button
                        onClick={() => handleDeleteLot(lot._id)}
                        className="p-3 text-gray-400 hover:text-rose-500 hover:bg-rose-50 rounded-2xl transition-all border border-transparent hover:border-rose-100 group"
                        title="Terminate Asset"
                    >
                        <Trash2 size={18} className="group-hover:scale-110 transition-transform" />
                    </button>
                </div>
            )
        }
    ];

    return (
        <div className="p-6 space-y-6">
            {error && (
                <div className="fixed top-6 right-6 bg-rose-50 border border-rose-100 text-rose-600 px-6 py-4 rounded-2xl z-50 animate-in fade-in slide-in-from-top-4 duration-500 shadow-2xl shadow-rose-200/50 flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
                    <span className="text-sm font-black uppercase tracking-widest">{error}</span>
                </div>
            )}

            {/* Premium Hero Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-white p-8 rounded-[2.5rem] border border-primary/5 shadow-sm relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full -mr-32 -mt-32 blur-3xl group-hover:bg-primary/10 transition-colors duration-1000" />
                <div className="relative z-10 flex items-center gap-6">
                    <div className="w-16 h-16 rounded-[1.5rem] bg-indigo-500 flex items-center justify-center text-white shadow-xl shadow-indigo-500/20">
                        <Archive size={32} />
                    </div>
                    <div>
                        <h1 className="text-3xl font-black text-primary tracking-tight uppercase font-mono">Lot Ecosystem</h1>
                        <p className="text-sm text-gray-500 font-medium">Monitoring architectural supply chains & manufacturing cycles</p>
                    </div>
                </div>
                <div className="flex items-center gap-4 relative z-10">
                    <div className="bg-primary/5 px-6 py-3 rounded-2xl border border-primary/10 flex flex-col items-center">
                        <span className="text-[10px] font-black text-primary/40 uppercase tracking-widest leading-none mb-1">Active Batches</span>
                        <span className="text-2xl font-black text-primary">{pagination.totalRecords}</span>
                    </div>
                    <CustomButton onClick={() => navigate('/' + ROUTES.DASHBOARD.LOTS_CREATE)} className="rounded-[1.5rem] shadow-xl shadow-primary/20 h-16 px-8 text-sm uppercase tracking-widest font-black">
                        <Plus size={20} className="mr-2" /> Initialize Lot
                    </CustomButton>
                </div>
            </div>

            {/* Advanced Search & Intelligence filtering */}
            <div className="flex flex-col xl:flex-row gap-4">
                <div className="flex-1 relative group">
                    <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-primary/40 group-focus-within:text-primary transition-colors duration-300" size={22} />
                    <input
                        type="text"
                        placeholder="Scan batch identities or supplier references..."
                        value={filters.search}
                        onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value, page: 1 }))}
                        className="w-full bg-white border-2 border-primary/5 rounded-[2rem] py-5 pl-16 pr-6 focus:outline-none focus:border-primary/20 transition-all font-bold text-gray-700 shadow-xl shadow-gray-100/50 placeholder:text-gray-300"
                    />
                </div>

                <div className="flex flex-wrap gap-3">
                    <button
                        onClick={() => setIsFilterOpen(true)}
                        className={`px-8 py-4 rounded-[2rem] border-2 flex items-center gap-3 transition-all font-black uppercase text-[10px] tracking-widest h-16 ${activeFilterCount > 0
                            ? 'bg-primary border-primary text-white shadow-xl shadow-primary/30'
                            : 'bg-white border-primary/5 text-primary hover:bg-primary/5'
                            }`}
                    >
                        <Filter size={18} />
                        Supply Filters
                        {activeFilterCount > 0 && (
                            <span className="w-6 h-6 bg-white text-primary rounded-full flex items-center justify-center text-[10px] font-black shadow-inner">
                                {activeFilterCount}
                            </span>
                        )}
                    </button>

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
                            className="px-6 py-4 rounded-[2rem] bg-rose-50 border-2 border-rose-100 text-rose-500 hover:bg-rose-100 transition-all font-black uppercase text-[10px] tracking-widest flex items-center gap-2 shadow-xl shadow-rose-100/50 h-16"
                        >
                            <RotateCcw size={16} />
                            Reset System
                        </button>
                    )}

                    <div className="flex items-center gap-3 bg-white border-2 border-primary/5 rounded-[2rem] px-6 py-2 shadow-xl shadow-gray-100/30 h-16">
                        <span className="text-[10px] font-black text-gray-300 uppercase tracking-widest">Viewport</span>
                        <select
                            value={filters.limit}
                            onChange={(e) => handleLimitChange(Number(e.target.value))}
                            className="bg-transparent focus:outline-none font-black text-primary cursor-pointer text-sm outline-none border-none"
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
                emptyMessage="No strategic lots discovered in this supply chain"
                onRowClick={(lot) => navigate('/' + ROUTES.DASHBOARD.LOTS_EDIT.replace(':id', lot._id))}
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

            <PopupModal
                isOpen={popup.isOpen}
                onClose={() => setPopup(prev => ({ ...prev, isOpen: false }))}
                title={popup.title}
                message={popup.message}
                type={popup.type}
                onConfirm={popup.onConfirm}
                loading={popup.loading}
            />
        </div>
    );
};

export default LotList;
