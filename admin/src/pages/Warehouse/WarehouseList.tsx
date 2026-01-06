import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import warehouseService, { type IWarehouse } from '../../services/warehouseService';
import {
    Plus,
    RefreshCw,
    MapPin,
    Phone,
    User,
    CheckCircle2,
    Search,
    Building2,
    Filter,
    RotateCcw
} from 'lucide-react';
import { Table, type Column } from '../../components/common/Table';
import { CommonFilter, type FilterField } from '../../components/common/CommonFilter';
import CustomButton from '../../components/common/Button';
import { PopupModal } from '../../components/common/PopupModal';

const filterFields: FilterField[] = [
    {
        key: 'isActive',
        label: 'Node Status',
        type: 'select',
        options: [
            { label: 'Active', value: true },
            { label: 'Inactive', value: false }
        ]
    },
    {
        key: 'isPrimary',
        label: 'Fulfillment Tier',
        type: 'select',
        options: [
            { label: 'Primary Node', value: true },
            { label: 'Standard Node', value: false }
        ]
    }
];

export const WarehouseList: React.FC = () => {
    const navigate = useNavigate();
    const [searchParams, setSearchParams] = useSearchParams();

    const [warehouses, setWarehouses] = useState<IWarehouse[]>([]);
    const [loading, setLoading] = useState(false);
    const [isFilterOpen, setIsFilterOpen] = useState(false);

    const [pagination, setPagination] = useState({
        totalRecords: 0,
        totalPages: 0,
        currentPage: 1,
        limit: 10
    });

    const [popup, setPopup] = useState<{
        isOpen: boolean;
        title: string;
        message: string;
        type: 'alert' | 'confirm' | 'prompt';
        onConfirm: () => void;
    }>({
        isOpen: false,
        title: '',
        message: '',
        type: 'alert',
        onConfirm: () => { }
    });

    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const search = searchParams.get('search') || '';

    const fetchWarehouses = useCallback(async () => {
        setLoading(true);
        try {
            const filters: Record<string, string | number | boolean | undefined> = {};
            searchParams.forEach((value, key) => {
                if (value && !['page', 'limit'].includes(key)) {
                    filters[key] = value === 'true' ? true : value === 'false' ? false : value;
                }
            });

            const response = await warehouseService.getWithPagination({ ...filters, search }, page, limit);
            if (response.data) {
                setWarehouses(response.data.recordList);
                setPagination({
                    totalRecords: response.data.totalRecords,
                    totalPages: response.data.totalPages,
                    currentPage: response.data.currentPage,
                    limit: response.data.limit
                });
            }
        } catch (error) {
            console.error('Failed to fetch warehouses', error);
        } finally {
            setLoading(false);
        }
    }, [searchParams, page, limit, search]);

    useEffect(() => {
        const timer = setTimeout(() => {
            fetchWarehouses();
        }, 300);
        return () => clearTimeout(timer);
    }, [fetchWarehouses]);

    const handleSearch = (val: string) => {
        setSearchParams(prev => {
            if (val) prev.set('search', val);
            else prev.delete('search');
            prev.set('page', '1');
            return prev;
        });
    };

    const handleFilterApply = (vals: Record<string, unknown>) => {
        setSearchParams(prev => {
            Object.entries(vals).forEach(([key, value]) => {
                if (value !== undefined && value !== null && value !== '') prev.set(key, value.toString());
                else prev.delete(key);
            });
            prev.set('page', '1');
            return prev;
        });
        setIsFilterOpen(false);
    };

    const handleReset = () => {
        setSearchParams({ page: '1', limit: '10' });
    };

    const activeFilterCount = Array.from(searchParams.keys()).filter(k =>
        !['page', 'limit', 'search'].includes(k)
    ).length;

    const columns: Column<IWarehouse>[] = [
        {
            header: 'Warehouse Identity',
            key: 'name',
            render: (warehouse) => (
                <div className="flex items-center gap-4 py-1">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center text-primary font-black text-xl border border-primary/10 shadow-inner group-hover:scale-105 transition-transform duration-300">
                        <Building2 size={24} />
                    </div>
                    <div className="flex flex-col">
                        <span className="font-black text-gray-900 leading-tight uppercase tracking-tight">{warehouse.name}</span>
                        <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-1">CODE: {warehouse.code}</span>
                    </div>
                </div>
            )
        },
        {
            header: 'Logistics Access',
            key: 'address',
            render: (warehouse) => (
                <div className="flex flex-col gap-1 py-1">
                    <div className="flex items-center gap-2 text-xs font-bold text-gray-600">
                        <MapPin size={12} className="text-primary/40" />
                        <span className="truncate max-w-[250px]">{warehouse.address.street}, {warehouse.address.city}</span>
                    </div>
                    <div className="flex items-center gap-2 text-[10px] font-black text-gray-400 uppercase tracking-widest">
                        {warehouse.address.state} - {warehouse.address.pincode}
                    </div>
                </div>
            )
        },
        {
            header: 'Personnel',
            key: 'contact',
            render: (warehouse) => (
                <div className="flex flex-col gap-1 py-1">
                    <div className="flex items-center gap-2 text-xs font-bold text-gray-700">
                        <User size={12} className="text-primary/40" />
                        <span>{warehouse.contactPerson}</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs font-bold text-gray-600">
                        <Phone size={12} className="text-primary/40" />
                        <span>{warehouse.mobile}</span>
                    </div>
                </div>
            )
        },
        {
            header: 'Status & Tier',
            key: 'status',
            render: (warehouse) => (
                <div className="flex flex-col gap-2">
                    <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest w-fit border ${warehouse.isActive
                        ? 'bg-emerald-50 text-emerald-600 border-emerald-100'
                        : 'bg-gray-50 text-gray-400 border-gray-100'}`}>
                        {warehouse.isActive ? 'Active Node' : 'Inactive'}
                    </div>
                    {warehouse.isPrimary && (
                        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest w-fit bg-primary text-white border border-primary animate-pulse">
                            <CheckCircle2 size={10} /> Primary Fulfillment
                        </div>
                    )}
                </div>
            )
        },
        {
            header: 'Action',
            key: 'actions',
            align: 'right' as const,
            render: (warehouse) => (
                <div className="flex items-center justify-end gap-2">
                    <button
                        onClick={() => navigate(`/warehouses/${warehouse._id}`)}
                        className="p-3 text-primary hover:bg-primary/5 rounded-2xl transition-all hover:scale-110 active:scale-90 border border-transparent hover:border-primary/10"
                        title="Configure Details"
                    >
                        <RefreshCw size={18} />
                    </button>
                </div>
            )
        }
    ];

    return (
        <div className="p-6 space-y-6">
            {/* Premium Hero Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-white p-8 rounded-[2.5rem] border border-primary/5 shadow-sm relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full -mr-32 -mt-32 blur-3xl group-hover:bg-primary/10 transition-colors duration-1000" />
                <div className="relative z-10 flex items-center gap-6">
                    <div className="w-16 h-16 rounded-[1.5rem] bg-indigo-500 flex items-center justify-center text-white shadow-xl shadow-indigo-500/20">
                        <MapPin size={32} />
                    </div>
                    <div>
                        <h1 className="text-3xl font-black text-primary tracking-tight uppercase font-mono">Warehouse Grid</h1>
                        <p className="text-sm text-gray-500 font-medium">Manage logistics nodes and primary fulfillment points</p>
                    </div>
                </div>
                <CustomButton onClick={() => navigate('/warehouses/new')} className="rounded-2xl shadow-xl shadow-primary/20 h-14 px-8 relative z-10">
                    <Plus size={20} className="mr-2" /> Add New Node
                </CustomButton>
            </div>

            {/* Premium Top Bar */}
            <div className="flex flex-col xl:flex-row gap-4 items-center">
                <div className="flex-1 relative group w-full xl:w-auto">
                    <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-primary/40 group-focus-within:text-primary transition-colors duration-300" size={22} />
                    <input
                        type="text"
                        placeholder="Scan nodes by name, code or location..."
                        value={search}
                        onChange={(e) => handleSearch(e.target.value)}
                        className="w-full bg-white border-2 border-primary/5 rounded-[2rem] py-5 h-16 pl-16 pr-6 focus:outline-none focus:border-primary/20 transition-all font-bold text-gray-700 shadow-xl shadow-gray-100/50"
                    />
                </div>

                <div className="flex flex-wrap gap-3 w-full xl:w-auto">
                    {activeFilterCount > 0 && (
                        <button
                            onClick={handleReset}
                            className="px-6 h-16 rounded-[2rem] bg-rose-50 border-2 border-rose-100 text-rose-500 hover:bg-rose-100 transition-all font-black uppercase text-[10px] tracking-widest flex items-center gap-2 shadow-xl shadow-rose-100/50"
                        >
                            <RotateCcw size={16} />
                            Reset
                        </button>
                    )}
                    <button
                        onClick={() => setIsFilterOpen(true)}
                        className={`px-8 h-16 rounded-[2rem] border-2 flex items-center gap-3 transition-all font-black uppercase text-[10px] tracking-widest shadow-xl ${activeFilterCount > 0
                            ? 'bg-primary border-primary text-white shadow-primary/20'
                            : 'bg-white border-primary/5 text-primary hover:bg-primary/5 shadow-gray-100/50'
                            }`}
                    >
                        <Filter size={20} />
                        Filter Hub
                        {activeFilterCount > 0 && (
                            <span className="w-6 h-6 bg-white text-primary rounded-full flex items-center justify-center text-[10px] font-black">
                                {activeFilterCount}
                            </span>
                        )}
                    </button>

                    <div className="flex items-center gap-2 bg-white border-2 border-primary/5 rounded-[2rem] px-6 h-16 shadow-xl shadow-gray-100/50">
                        <span className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Scale</span>
                        <select
                            value={limit}
                            onChange={(e) => setSearchParams(prev => { prev.set('limit', e.target.value); prev.set('page', '1'); return prev; })}
                            className="bg-transparent focus:outline-none font-black text-primary pl-2 cursor-pointer text-sm"
                        >
                            <option value={10}>10</option>
                            <option value={20}>20</option>
                            <option value={50}>50</option>
                        </select>
                    </div>
                </div>
            </div>

            <CommonFilter
                isOpen={isFilterOpen}
                onClose={() => setIsFilterOpen(false)}
                fields={filterFields}
                onApply={handleFilterApply}
                currentFilters={Object.fromEntries(searchParams)}
            />

            <Table
                data={warehouses}
                columns={columns}
                isLoading={loading}
                keyExtractor={(w) => w._id}
                emptyMessage="No warehouse nodes discovered in the grid"
                onRowClick={(w) => navigate(`/warehouses/${w._id}`)}
                pagination={{
                    currentPage: pagination.currentPage,
                    totalPages: pagination.totalPages,
                    totalRecords: pagination.totalRecords,
                    pageSize: pagination.limit,
                    onPageChange: (p) => setSearchParams(prev => { prev.set('page', p.toString()); return prev; }),
                    hasPreviousPage: pagination.currentPage > 1,
                    hasNextPage: pagination.currentPage < pagination.totalPages
                }}
            />

            <PopupModal
                isOpen={popup.isOpen}
                onClose={() => setPopup(prev => ({ ...prev, isOpen: false }))}
                title={popup.title}
                message={popup.message}
                type={popup.type}
                onConfirm={popup.onConfirm}
            />
        </div>
    );
};
