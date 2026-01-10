import React, { useEffect, useState, useCallback } from 'react';
import { loyaltyService } from '../../services/loyalty.service';
import {
    Coins,
    ArrowUpCircle,
    ArrowDownCircle,
    RotateCcw,
    History,
    RefreshCw,
    ExternalLink,
    Search,
    Filter
} from 'lucide-react';
import { format } from 'date-fns';
import { Table, type Column } from '../../components/common/Table';
import { CommonFilter, type FilterField } from '../../components/common/CommonFilter';

const LoyaltyAuditList: React.FC = () => {
    const [ledger, setLedger] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [isFilterOpen, setIsFilterOpen] = useState(false);

    // Filters & Pagination State
    const [filters, setFilters] = useState<any>({
        search: '',
        type: undefined,
        page: 1,
        limit: 10
    });

    const [pagination, setPagination] = useState({
        totalRecords: 0,
        totalPages: 0,
        currentPage: 1
    });

    const fetchLedger = useCallback(async () => {
        setLoading(true);
        try {
            const res = await loyaltyService.getLedger({
                page: filters.page,
                limit: filters.limit,
                search: filters.search,
                populate: ['userId'],
                ...(filters.type ? { type: filters.type } : {})
            });

            if (res) {
                setLedger(res.recordList || []);
                setPagination({
                    totalRecords: res.totalRecords || 0,
                    totalPages: res.totalPages || 0,
                    currentPage: res.currentPage || 1
                });
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    }, [filters]);

    useEffect(() => {
        const timer = setTimeout(() => {
            fetchLedger();
        }, 300);
        return () => clearTimeout(timer);
    }, [fetchLedger]);

    const handleFilterChange = (updatedFilters: Record<string, any>) => {
        setFilters((prev: any) => ({ ...prev, ...updatedFilters, page: 1 }));
    };

    const handleLimitChange = (newLimit: number) => {
        setFilters((prev: any) => ({ ...prev, limit: newLimit, page: 1 }));
    };

    const filterFields: FilterField[] = [
        {
            key: 'type',
            label: 'Transaction Type',
            type: 'select',
            multiple: true,
            options: [
                { label: 'Earned', value: 'EARNED' },
                { label: 'Spent', value: 'SPENT' },
                { label: 'Refunded', value: 'REFUNDED' },
                { label: 'Expired', value: 'EXPIRED' }
            ]
        }
    ];

    const activeFilterCount = Object.keys(filters).filter(k =>
        !['page', 'limit', 'search'].includes(k) &&
        filters[k] !== undefined &&
        (Array.isArray(filters[k]) ? filters[k].length > 0 : true)
    ).length;

    const columns: Column<any>[] = [
        {
            header: 'Timestamp',
            key: 'createdAt',
            render: (item) => (
                <div className="flex flex-col py-1">
                    <span className="text-[11px] font-black text-gray-900 uppercase tracking-tight">
                        {format(new Date(item.createdAt), 'dd MMM yyyy')}
                    </span>
                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-0.5">
                        {format(new Date(item.createdAt), 'HH:mm:ss')}
                    </span>
                </div>
            )
        },
        {
            header: 'Strategic Identity',
            key: 'userId',
            render: (item) => (
                <div className="flex items-center gap-4 py-1">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center text-primary border border-primary/10 shadow-inner">
                        <Coins size={18} />
                    </div>
                    <div className="flex flex-col">
                        <span className="text-xs font-black text-gray-900 leading-tight uppercase tracking-tight truncate w-40">
                            {item.userId?.firstName ? `${item.userId.firstName} ${item.userId.lastName}` : (typeof item.userId === 'string' ? item.userId : 'Anonymous Node')}
                        </span>
                        {item.orderId && (
                            <span className="text-[9px] font-black text-primary/60 uppercase flex items-center gap-1 tracking-widest mt-1">
                                <ExternalLink size={8} /> Order ID: {typeof item.orderId === 'string' ? item.orderId.substring(item.orderId.length - 8) : '...'}
                            </span>
                        )}
                    </div>
                </div>
            )
        },
        {
            header: 'Protocol Type',
            key: 'type',
            align: 'center',
            render: (item) => {
                const styles: any = {
                    EARNED: 'bg-emerald-50 text-emerald-600 border-emerald-100',
                    SPENT: 'bg-amber-50 text-amber-600 border-amber-100',
                    REFUNDED: 'bg-blue-50 text-blue-600 border-blue-100',
                    EXPIRED: 'bg-gray-50 text-gray-500 border-gray-100'
                };
                const icons: any = {
                    EARNED: <ArrowUpCircle size={12} />,
                    SPENT: <ArrowDownCircle size={12} />,
                    REFUNDED: <RotateCcw size={12} />,
                    EXPIRED: <History size={12} />
                };
                return (
                    <span className={`px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest border flex items-center gap-2 w-fit mx-auto ${styles[item.type] || 'bg-gray-50 text-gray-400 border-gray-100'}`}>
                        {icons[item.type]}
                        {item.type}
                    </span>
                );
            }
        },
        {
            header: 'Points Delta',
            key: 'points',
            align: 'right',
            render: (item) => (
                <span className={`text-sm font-black tracking-tight ${item.points > 0 ? 'text-emerald-600' : 'text-rose-500'}`}>
                    {item.points > 0 ? '▲' : '▼'} {Math.abs(item.points).toLocaleString()}
                </span>
            )
        },
        {
            header: 'Ledger Balance',
            key: 'balanceAfter',
            align: 'right',
            render: (item) => (
                <div className="flex flex-col items-end py-1">
                    <span className="text-sm font-black text-gray-900 tracking-tight">
                        {item.balanceAfter.toLocaleString()}
                    </span>
                    <span className="text-[9px] font-black text-gray-300 uppercase tracking-widest mt-0.5">Residual Pts</span>
                </div>
            )
        },
        {
            header: 'Intelligence / Message',
            key: 'message',
            render: (item) => (
                <p className="text-[11px] font-medium text-gray-500 italic max-w-xs leading-relaxed">
                    "{item.message}"
                </p>
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
                        <Coins size={32} className="animate-pulse" />
                    </div>
                    <div>
                        <h1 className="text-3xl font-black text-primary tracking-tight uppercase font-mono">Loyalty Ledger</h1>
                        <p className="text-sm text-gray-500 font-medium tracking-tight">Auditing the global rewards & social currency ecosystem</p>
                    </div>
                </div>
                <div className="flex items-center gap-4 relative z-10">
                    <div className="bg-primary/5 px-6 py-3 rounded-2xl border border-primary/10 flex flex-col items-center">
                        <span className="text-[10px] font-black text-primary/40 uppercase tracking-widest leading-none mb-1">Total Logs</span>
                        <span className="text-2xl font-black text-primary">{pagination.totalRecords}</span>
                    </div>
                    <button
                        onClick={fetchLedger}
                        className="p-4 bg-gray-50 text-gray-400 hover:text-primary hover:bg-primary/5 rounded-2xl transition-all border border-gray-100 hover:border-primary/10 shadow-sm"
                        title="Pulse Refresh"
                    >
                        <RefreshCw size={24} className={loading ? 'animate-spin' : ''} />
                    </button>
                </div>
            </div>

            {/* Intelligence Control Bar */}
            <div className="flex flex-col xl:flex-row gap-4">
                <div className="flex-1 relative group">
                    <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-primary/40 group-focus-within:text-primary transition-colors duration-300" size={22} />
                    <input
                        type="text"
                        placeholder="Scan ledger by identity, reference or message..."
                        value={filters.search}
                        onChange={(e) => setFilters((prev: any) => ({ ...prev, search: e.target.value, page: 1 }))}
                        className="w-full bg-white border-2 border-primary/5 rounded-[2rem] py-5 pl-16 pr-6 focus:outline-none focus:border-primary/20 transition-all font-bold text-gray-700 shadow-xl shadow-gray-100/50 placeholder:text-gray-300"
                    />
                </div>

                <div className="flex flex-wrap gap-3">
                    <button
                        onClick={() => setIsFilterOpen(true)}
                        className={`px-8 py-4 rounded-[2rem] border-2 flex items-center gap-3 transition-all font-black uppercase text-[10px] tracking-widest h-16 ${activeFilterCount > 0
                            ? 'bg-primary border-primary text-white shadow-xl shadow-primary/30'
                            : 'bg-white border-primary/5 text-primary hover:bg-primary/5 shadow-xl shadow-gray-100/30'
                            }`}
                    >
                        <Filter size={18} />
                        Strategic filters
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
                                type: undefined,
                                page: 1,
                                limit: 10
                            })}
                            className="px-6 py-4 rounded-[2rem] bg-rose-50 border-2 border-rose-100 text-rose-500 hover:bg-rose-100 transition-all font-black uppercase text-[10px] tracking-widest flex items-center gap-2 shadow-xl shadow-rose-100/50 h-16"
                        >
                            <RotateCcw size={16} />
                            Reset hub
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
                data={ledger}
                columns={columns}
                isLoading={loading}
                keyExtractor={(item) => item._id}
                emptyMessage="No strategic reward activity discovered in this sector"
                pagination={pagination.totalRecords > 0 ? {
                    currentPage: pagination.currentPage,
                    totalPages: pagination.totalPages,
                    totalRecords: pagination.totalRecords,
                    pageSize: filters.limit || 10,
                    onPageChange: (page) => setFilters((prev: any) => ({ ...prev, page })),
                    hasPreviousPage: pagination.currentPage > 1,
                    hasNextPage: pagination.currentPage < pagination.totalPages
                } : undefined}
            />
        </div>
    );
};

export default LoyaltyAuditList;
