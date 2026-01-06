import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import shipmentService from '../../services/shipmentService';
import { type IShipment, SHIPMENT_STATUS } from '../../types/shipment.types';
import { StatusBadge } from '../../components/logistics/StatusBadge';
import {
    Search,
    Filter,
    Eye,
    RefreshCw,
    Package,
    RotateCcw,
    Truck,
    Calendar,
    Hash
} from 'lucide-react';
import { Table, type Column } from '../../components/common/Table';
import { CommonFilter, type FilterField } from '../../components/common/CommonFilter';
import { format } from 'date-fns';

const filterFields: FilterField[] = [
    {
        key: 'status',
        label: 'Shipment Status',
        type: 'select',
        options: Object.values(SHIPMENT_STATUS).map(s => ({
            label: s.replace(/_/g, ' '),
            value: s
        }))
    },
    {
        key: 'courierName',
        label: 'Carrier Provider',
        type: 'select',
        options: [
            { label: 'Delhivery', value: 'Delhivery' },
            { label: 'Shiprocket', value: 'Shiprocket' },
            { label: 'Bluedart', value: 'Bluedart' }
        ]
    }
];

export const ShipmentList: React.FC = () => {
    const navigate = useNavigate();
    const [searchParams, setSearchParams] = useSearchParams();

    const [shipments, setShipments] = useState<IShipment[]>([]);
    const [loading, setLoading] = useState(false);
    const [isFilterOpen, setIsFilterOpen] = useState(false);

    const [pagination, setPagination] = useState({
        totalRecords: 0,
        totalPages: 0,
        currentPage: 1,
        limit: 10
    });

    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const search = searchParams.get('search') || '';

    const fetchShipments = useCallback(async () => {
        setLoading(true);
        try {
            const filters: Record<string, string | number | boolean | undefined> = {};
            searchParams.forEach((value, key) => {
                if (value && !['page', 'limit', 'search'].includes(key)) {
                    filters[key] = value;
                }
            });

            const data = await shipmentService.getWithPagination({ ...filters, search }, page, limit);
            if (data) {
                setShipments(data.recordList || []);
                setPagination({
                    totalRecords: data.totalRecords || 0,
                    totalPages: data.totalPages || 0,
                    currentPage: data.currentPage || 1,
                    limit: data.limit || 10
                });
            }
        } catch (error) {
            console.error('Failed to fetch shipments', error);
        } finally {
            setLoading(false);
        }
    }, [searchParams, page, limit, search]);

    useEffect(() => {
        const timer = setTimeout(() => {
            fetchShipments();
        }, 300);
        return () => clearTimeout(timer);
    }, [fetchShipments]);

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

    const columns: Column<IShipment>[] = [
        {
            header: 'Transit Identity',
            key: 'shipmentNumber',
            render: (shipment) => (
                <div className="flex items-center gap-4 py-1">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center text-primary font-black text-xl border border-primary/10 shadow-inner group-hover:scale-105 transition-transform duration-300">
                        <Package size={24} />
                    </div>
                    <div className="flex flex-col">
                        <span className="font-black text-gray-900 leading-tight uppercase tracking-tight">
                            {shipment.shipmentNumber || shipment._id.slice(-8).toUpperCase()}
                        </span>
                        <div className="flex items-center gap-2 mt-1">
                            <Hash size={10} className="text-primary/40" />
                            <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">AWB: {shipment.awb}</span>
                        </div>
                    </div>
                </div>
            )
        },
        {
            header: 'Order Reference',
            key: 'orderNumber',
            render: (shipment) => (
                <div className="flex flex-col gap-1 py-1">
                    <span className="text-sm font-bold text-blue-600 hover:underline cursor-pointer">
                        #{shipment.orderNumber}
                    </span>
                    <div className="flex items-center gap-2 text-[10px] font-black text-gray-400 uppercase tracking-widest">
                        <Calendar size={10} />
                        {format(new Date(shipment.createdAt), 'MMM d, yyyy')}
                    </div>
                </div>
            )
        },
        {
            header: 'Logistics Partner',
            key: 'courierName',
            render: (shipment) => (
                <div className="flex flex-col gap-1 py-1">
                    <div className="flex items-center gap-2 text-xs font-bold text-gray-700">
                        <Truck size={12} className="text-primary/40" />
                        <span>{shipment.courierName}</span>
                    </div>
                </div>
            )
        },
        {
            header: 'Status',
            key: 'status',
            render: (shipment) => (
                <StatusBadge status={shipment.status} size="sm" />
            )
        },
        {
            header: 'Action',
            key: 'actions',
            align: 'right' as const,
            render: (shipment) => (
                <div className="flex items-center justify-end gap-2">
                    <button
                        onClick={() => navigate(`/shipments/${shipment._id}`)}
                        className="p-3 text-primary hover:bg-primary/5 rounded-2xl transition-all hover:scale-110 active:scale-90 border border-transparent hover:border-primary/10"
                        title="View Details"
                    >
                        <Eye size={18} />
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
                    <div className="w-16 h-16 rounded-[1.5rem] bg-amber-500 flex items-center justify-center text-white shadow-xl shadow-amber-500/20">
                        <Package size={32} />
                    </div>
                    <div>
                        <h1 className="text-3xl font-black text-primary tracking-tight uppercase font-mono">Shipment Registry</h1>
                        <p className="text-sm text-gray-500 font-medium">Monitor active transits and delivery lifecycle</p>
                    </div>
                </div>
                <button
                    onClick={fetchShipments}
                    className="p-4 bg-white hover:bg-gray-50 text-gray-700 rounded-2xl border border-gray-100 shadow-sm transition-all hover:scale-105 active:scale-95 flex items-center gap-2 font-black text-[10px] uppercase tracking-widest relative z-10"
                >
                    <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
                    Sync Feed
                </button>
            </div>

            {/* Premium Top Bar */}
            <div className="flex flex-col xl:flex-row gap-4 items-center">
                <div className="flex-1 relative group w-full xl:w-auto">
                    <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-primary/40 group-focus-within:text-primary transition-colors duration-300" size={22} />
                    <input
                        type="text"
                        placeholder="Search shipment by AWB, Order ID or Ref..."
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
                            Reset Hub
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
                        Filter Streams
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
                data={shipments}
                columns={columns}
                isLoading={loading}
                keyExtractor={(s) => s._id}
                emptyMessage="No shipments found in the registry"
                onRowClick={(s) => navigate(`/shipments/${s._id}`)}
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
        </div>
    );
};
