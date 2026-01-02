import React, { useEffect, useState } from 'react';
import {
    Search, Filter, RefreshCw,
    Activity, Clock, Package,
    RotateCcw, FileText, PlusCircle,
    ArrowUpRight, ArrowDownLeft,
    Database, Hash
} from 'lucide-react';
import { useSearchParams } from 'react-router-dom';
import { inventoryAuditService } from '../../services/inventoryAudit.service';
import type { IInventoryAudit } from '../../types/inventoryAudit';
import { Table, type Column } from '../../components/common/Table';
import { CommonFilter, type FilterField } from '../../components/common/CommonFilter';
import CustomButton from '../../components/common/Button';
import { toast } from 'react-hot-toast';

const filterFields: FilterField[] = [
    {
        key: 'transactionType',
        label: 'Transaction Type',
        type: 'select',
        options: [
            { label: 'Order Fulfillment', value: 'ORDER_FULFILLMENT' },
            { label: 'Order Cancel', value: 'ORDER_CANCEL' },
            { label: 'Lot Inward', value: 'LOT_INWARD' },
            { label: 'Admin Adjustment', value: 'ADMIN_ADJUSTMENT' },
            { label: 'Return Restock', value: 'RETURN_RESTOCK' }
        ]
    },
    {
        key: 'referenceType',
        label: 'Reference Entity',
        type: 'select',
        options: [
            { label: 'Order', value: 'ORDER' },
            { label: 'Lot', value: 'LOT' },
            { label: 'User', value: 'USER' }
        ]
    }
];

const transactionIcons: Record<string, any> = {
    ORDER_FULFILLMENT: { icon: Package, color: 'text-amber-500', bg: 'bg-amber-50' },
    ORDER_CANCEL: { icon: RotateCcw, color: 'text-rose-500', bg: 'bg-rose-50' },
    LOT_INWARD: { icon: PlusCircle, color: 'text-emerald-500', bg: 'bg-emerald-50' },
    ADMIN_ADJUSTMENT: { icon: FileText, color: 'text-indigo-500', bg: 'bg-indigo-50' },
    RETURN_RESTOCK: { icon: RotateCcw, color: 'text-purple-500', bg: 'bg-purple-50' }
};

const InventoryAuditList = () => {
    const [logs, setLogs] = useState<IInventoryAudit[]>([]);
    const [loading, setLoading] = useState(true);
    const [totalRecords, setTotalRecords] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const [isFilterOpen, setIsFilterOpen] = useState(false);

    const [searchParams, setSearchParams] = useSearchParams();
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const search = searchParams.get('search') || '';

    const fetchLogs = async () => {
        try {
            setLoading(true);
            const filters: any = {
                page,
                limit,
                search,
                transactionType: searchParams.get('transactionType'),
                referenceType: searchParams.get('referenceType'),
                skuId: searchParams.get('skuId'),
                populate: ['skuId', 'referenceId']
            };

            const response = await inventoryAuditService.getWithPagination(filters);
            if (response) {
                const { recordList, totalRecords, totalPages } = response;
                setLogs(recordList);
                setTotalRecords(totalRecords);
                setTotalPages(totalPages);
            }
        } catch (err) {
            console.error('Failed to fetch audit logs', err);
            toast.error('Failed to load inventory ledger');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchLogs();
    }, [page, limit, search, searchParams]);

    const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setSearchParams(prev => {
            if (value) prev.set('search', value);
            else prev.delete('search');
            prev.set('page', '1');
            return prev;
        });
    };

    const handleFilterApply = (filters: any) => {
        setSearchParams(prev => {
            Object.entries(filters).forEach(([key, value]) => {
                if (value) prev.set(key, value as string);
                else prev.delete(key);
            });
            prev.set('page', '1');
            return prev;
        });
        setIsFilterOpen(false);
    };

    const columns: Column<IInventoryAudit>[] = [
        {
            header: 'Timestamp & Type',
            key: 'createdAt',
            render: (log) => {
                const config = transactionIcons[log.transactionType] || { icon: Activity, color: 'text-gray-500', bg: 'bg-gray-50' };
                return (
                    <div className="flex items-center gap-4">
                        <div className={`w-10 h-10 rounded-xl ${config.bg} flex items-center justify-center ${config.color} border border-white shadow-sm`}>
                            <config.icon size={20} />
                        </div>
                        <div className="flex flex-col">
                            <span className="text-[10px] font-black uppercase tracking-widest text-gray-900 leading-tight">
                                {log.transactionType.replace(/_/g, ' ')}
                            </span>
                            <div className="flex items-center gap-1.5 text-gray-400 mt-1">
                                <Clock size={12} />
                                <span className="text-[10px] font-bold uppercase tracking-tight">
                                    {new Date(log.createdAt).toLocaleDateString()} {new Date(log.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </span>
                            </div>
                        </div>
                    </div>
                );
            }
        },
        {
            header: 'SKU Intelligence',
            key: 'skuId',
            render: (log) => (
                <div className="flex flex-col">
                    <span className="font-bold text-gray-900 text-xs truncate max-w-[200px]">
                        {log.skuId?.skuName || 'De-indexed SKU'}
                    </span>
                    <div className="flex items-center gap-2 mt-1">
                        <span className="text-[10px] font-black text-primary/60 uppercase tracking-widest font-mono bg-primary/5 px-2 py-0.5 rounded border border-primary/10">
                            {log.skuId?.skuCode || 'N/A'}
                        </span>
                    </div>
                </div>
            )
        },
        {
            header: 'Delta Payload',
            key: 'changeQuantity',
            render: (log) => {
                const isPositive = log.changeQuantity > 0;
                return (
                    <div className="flex items-center gap-3">
                        <div className={`flex items-center gap-1 font-black text-sm ${isPositive ? 'text-emerald-500' : 'text-rose-500'}`}>
                            {isPositive ? <PlusCircle size={14} /> : <ArrowDownLeft size={14} />}
                            {isPositive ? `+${log.changeQuantity}` : log.changeQuantity}
                        </div>
                        <div className="h-4 w-px bg-gray-100" />
                        <div className="flex flex-col">
                            <div className="flex items-center gap-1 text-[9px] font-bold text-gray-400 uppercase tracking-widest">
                                <span className="text-gray-900 font-black">{log.previousQuantity}</span>
                                <ArrowUpRight size={8} />
                                <span className="text-primary font-black">{log.newQuantity}</span>
                            </div>
                        </div>
                    </div>
                );
            }
        },
        {
            header: 'Reference Chain',
            key: 'referenceId',
            render: (log) => (
                <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-2 text-gray-900 font-black text-[10px] uppercase tracking-wider bg-gray-50 px-2 py-1 rounded-lg border border-gray-100 w-fit">
                        <Hash size={12} className="text-primary/60" />
                        {log.referenceType || 'SYSTEM'} #{(log.referenceId as any)?.orderNumber || (log.referenceId as any)?.lotNumber || (log.referenceId as any)?._id?.toString().slice(-6).toUpperCase() || 'INFRA'}
                    </div>
                    {log.reason && (
                        <span className="text-[10px] font-bold text-gray-400 truncate max-w-[150px] italic">
                            "{log.reason}"
                        </span>
                    )}
                </div>
            )
        }
    ];

    return (
        <div className="p-6 space-y-6 flex flex-col h-full bg-gray-50/50 animate-in fade-in duration-500 overflow-hidden">
            {/* Premium Hero Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-white p-8 rounded-[2.5rem] border border-primary/5 shadow-sm relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full -mr-32 -mt-32 blur-3xl group-hover:bg-primary/10 transition-colors duration-1000" />
                <div className="relative z-10 flex items-center gap-6">
                    <div className="w-16 h-16 rounded-[1.5rem] bg-indigo-500 flex items-center justify-center text-white shadow-xl shadow-indigo-500/20">
                        <Database size={32} />
                    </div>
                    <div className="flex flex-col min-w-0">
                        <h1 className="text-3xl font-black text-primary tracking-tight uppercase font-mono truncate">Stock Ledger</h1>
                        <p className="text-sm text-gray-500 font-medium truncate">Immutable audit trail of all inventory movements</p>
                    </div>
                </div>
                <div className="flex items-center gap-3 relative z-10">
                    <div className="hidden lg:flex flex-col items-end mr-6 text-right border-r border-gray-100 pr-6">
                        <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Total Transactions</span>
                        <span className="text-2xl font-mono font-black text-primary leading-none">{totalRecords}</span>
                    </div>
                    <CustomButton
                        onClick={() => fetchLogs()}
                        className="bg-gray-50 text-gray-600 hover:bg-gray-100 shadow-none border border-gray-200 h-14 w-14 p-0 rounded-2xl flex items-center justify-center transition-all active:scale-95"
                    >
                        <RefreshCw size={20} className={loading ? 'animate-spin' : ''} />
                    </CustomButton>
                </div>
            </div>

            {/* Intelligence Control Bar */}
            <div className="bg-white p-4 rounded-[2rem] shadow-sm border border-primary/5 flex flex-col md:flex-row items-center justify-between gap-4">
                <div className="relative w-full md:w-96 group">
                    <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-primary/40 group-focus-within:text-primary transition-colors duration-300" size={22} />
                    <input
                        type="text"
                        placeholder="Scan ledger by identity, SKU or ref..."
                        className="w-full pl-14 pr-6 py-4 bg-gray-50/50 border-2 border-transparent focus:bg-white focus:border-primary/20 rounded-[1.5rem] outline-none transition-all font-bold text-gray-700 h-14"
                        onChange={handleSearch}
                        value={search}
                    />
                </div>

                <div className="flex items-center gap-3">
                    <button
                        onClick={() => setIsFilterOpen(true)}
                        className={`flex items-center gap-2 px-6 h-14 rounded-2xl font-black uppercase text-[10px] tracking-widest transition-all ${searchParams.get('transactionType') || searchParams.get('referenceType')
                            ? 'bg-primary/10 text-primary border-2 border-primary/20 shadow-lg shadow-primary/5'
                            : 'bg-white text-gray-500 border-2 border-gray-100 hover:bg-gray-50'
                            }`}
                    >
                        <Filter size={18} />
                        Strategic Filtering
                    </button>

                    <CustomButton
                        onClick={() => setSearchParams({})}
                        className="h-14 px-6 bg-gray-50 text-gray-400 hover:bg-gray-100 rounded-2xl border border-gray-200 shadow-none font-black uppercase text-[10px] tracking-widest"
                    >
                        Reset Ledger
                    </CustomButton>
                </div>
            </div>

            {/* Neural Data Grid */}
            <div className="flex-1 min-h-0 bg-white rounded-[2.5rem] border border-primary/5 shadow-sm overflow-hidden flex flex-col">
                <Table
                    columns={columns}
                    data={logs}
                    isLoading={loading}
                    keyExtractor={(item) => item._id}
                    pagination={{
                        currentPage: page,
                        totalPages: totalPages,
                        totalRecords: totalRecords,
                        pageSize: limit,
                        onPageChange: (p: number) => setSearchParams(prev => { prev.set('page', p.toString()); return prev; }),
                        hasPreviousPage: page > 1,
                        hasNextPage: page < totalPages
                    }}
                />
            </div>

            <CommonFilter
                isOpen={isFilterOpen}
                onClose={() => setIsFilterOpen(false)}
                fields={filterFields}
                onApply={handleFilterApply}
                currentFilters={Object.fromEntries(searchParams)}
            />
        </div>
    );
};

export default InventoryAuditList;
