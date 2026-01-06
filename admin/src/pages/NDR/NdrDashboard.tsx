import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import ndrService, { type INDR } from '../../services/ndrService';
import {
    RefreshCw,
    CheckCircle2,
    XCircle,
    Clock,
    ExternalLink,
    Search,
    Filter,
    RotateCcw,
    AlertTriangle,
    ShieldAlert
} from 'lucide-react';
import { Table, type Column } from '../../components/common/Table';
import { CommonFilter, type FilterField } from '../../components/common/CommonFilter';
import { format } from 'date-fns';

const filterFields: FilterField[] = [
    {
        key: 'status',
        label: 'Resolution Status',
        type: 'select',
        options: [
            { label: 'Pending', value: 'PENDING' },
            { label: 'Resolved', value: 'RESOLVED' },
            { label: 'Cancelled', value: 'CANCELLED' }
        ]
    }
];

export const NdrDashboard: React.FC = () => {
    const [searchParams, setSearchParams] = useSearchParams();
    const [ndrs, setNdrs] = useState<INDR[]>([]);
    const [loading, setLoading] = useState(false);
    const [selectedNdr, setSelectedNdr] = useState<INDR | null>(null);
    const [resolving, setResolving] = useState(false);
    const [isFilterOpen, setIsFilterOpen] = useState(false);

    // Resolution Modal State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [resolutionData, setResolutionData] = useState({
        resolution: 'RE-ATTEMPT',
        customerAction: '',
        rescheduledDate: '',
        updatedAddress: ''
    });

    const [pagination, setPagination] = useState({
        totalRecords: 0,
        totalPages: 0,
        currentPage: 1,
        limit: 10
    });

    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const search = searchParams.get('search') || '';

    const fetchNdrs = useCallback(async () => {
        setLoading(true);
        try {
            const filters: Record<string, string | number | boolean | undefined> = {};
            searchParams.forEach((value, key) => {
                if (value && !['page', 'limit', 'search'].includes(key)) {
                    filters[key] = value;
                }
            });
            const response = await ndrService.getAll({ ...filters, search }, page, limit);
            if (response.data) {
                setNdrs(response.data.recordList || []);
                setPagination({
                    totalRecords: response.data.totalRecords,
                    totalPages: response.data.totalPages,
                    currentPage: response.data.currentPage,
                    limit: response.data.limit
                });
            }
        } catch (error) {
            console.error('Failed to fetch NDRs', error);
        } finally {
            setLoading(false);
        }
    }, [searchParams, page, limit, search]);

    useEffect(() => {
        const timer = setTimeout(() => {
            fetchNdrs();
        }, 300);
        return () => clearTimeout(timer);
    }, [fetchNdrs]);

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

    const handleResolve = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedNdr) return;

        setResolving(true);
        try {
            await ndrService.resolve(selectedNdr._id, resolutionData);
            setIsModalOpen(false);
            fetchNdrs();
        } catch (error) {
            console.error('Failed to resolve NDR', error);
        } finally {
            setResolving(false);
        }
    };

    const openResolveModal = (ndr: INDR) => {
        setSelectedNdr(ndr);
        setIsModalOpen(true);
    };

    const activeFilterCount = Array.from(searchParams.keys()).filter(k =>
        !['page', 'limit', 'search'].includes(k)
    ).length;

    const columns: Column<INDR>[] = [
        {
            header: 'Shipment Intel',
            key: 'awb',
            render: (ndr) => (
                <div className="flex items-center gap-4 py-1">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-rose-500/10 to-rose-500/5 flex items-center justify-center text-rose-600 border border-rose-500/10 shadow-inner group-hover:scale-105 transition-transform duration-300">
                        <AlertTriangle size={24} />
                    </div>
                    <div className="flex flex-col">
                        <span className="font-black text-gray-900 leading-tight uppercase tracking-tight">{ndr.awb}</span>
                        <div className="flex items-center gap-1 mt-0.5 text-[10px] font-black text-blue-600 uppercase tracking-widest cursor-pointer hover:underline">
                            ID: {ndr.shipmentId.slice(-8)} <ExternalLink size={10} />
                        </div>
                    </div>
                </div>
            )
        },
        {
            header: 'Failure Context',
            key: 'ndrReason',
            render: (ndr) => (
                <div className="flex flex-col gap-1 py-1">
                    <span className="text-xs font-bold text-gray-800 uppercase tracking-tight">{ndr.ndrReason}</span>
                    <span className="text-[10px] text-gray-400 font-medium uppercase truncate max-w-[180px]">{ndr.ndrReasonText}</span>
                </div>
            )
        },
        {
            header: 'Attempt',
            key: 'attemptNumber',
            render: (ndr) => (
                <div className="inline-flex items-center px-2.5 py-0.5 rounded-full bg-gray-100 text-[10px] font-black text-gray-600 uppercase tracking-widest border border-gray-200">
                    Pulse #{ndr.attemptNumber}
                </div>
            )
        },
        {
            header: 'Status',
            key: 'status',
            render: (ndr) => (
                <div className="flex items-center gap-1.5">
                    {ndr.status === 'RESOLVED' ? <CheckCircle2 size={12} className="text-emerald-500" /> :
                        ndr.status === 'PENDING' ? <Clock size={12} className="text-amber-500" /> :
                            <XCircle size={12} className="text-rose-500" />}
                    <span className={`text-[10px] font-black uppercase tracking-[0.1em] ${ndr.status === 'RESOLVED' ? 'text-emerald-600' : 'text-amber-600'
                        }`}>
                        {ndr.status}
                    </span>
                </div>
            )
        },
        {
            header: 'Detection',
            key: 'ndrDate',
            render: (ndr) => (
                <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                    {format(new Date(ndr.ndrDate), 'MMM d, HH:mm')}
                </div>
            )
        },
        {
            header: 'Action',
            key: 'actions',
            align: 'right' as const,
            render: (ndr) => (
                <div className="flex items-center justify-end">
                    {ndr.status !== 'RESOLVED' ? (
                        <button
                            onClick={() => openResolveModal(ndr)}
                            className="bg-primary text-white px-4 py-2 rounded-xl hover:bg-primary/90 transition-all text-[10px] font-black uppercase tracking-widest shadow-lg shadow-primary/20 active:scale-95"
                        >
                            Resolve
                        </button>
                    ) : (
                        <span className="text-[10px] font-black text-gray-300 uppercase tracking-widest italic">Archived</span>
                    )}
                </div>
            )
        }
    ];

    return (
        <div className="p-6 space-y-6">
            {/* Premium Hero Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-white p-8 rounded-[2.5rem] border border-primary/5 shadow-sm relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-64 h-64 bg-rose-500/5 rounded-full -mr-32 -mt-32 blur-3xl group-hover:bg-rose-500/10 transition-colors duration-1000" />
                <div className="relative z-10 flex items-center gap-6">
                    <div className="w-16 h-16 rounded-[1.5rem] bg-rose-500 flex items-center justify-center text-white shadow-xl shadow-rose-500/20">
                        <ShieldAlert size={32} />
                    </div>
                    <div>
                        <h1 className="text-3xl font-black text-primary tracking-tight uppercase font-mono">NDR Dashboard</h1>
                        <p className="text-sm text-gray-500 font-medium">Mitigate RTO risk through intelligent delivery resolution</p>
                    </div>
                </div>
                <button
                    onClick={fetchNdrs}
                    className="p-4 bg-white hover:bg-gray-50 text-gray-700 rounded-2xl border border-gray-100 shadow-sm transition-all hover:scale-105 active:scale-95 flex items-center gap-2 font-black text-[10px] uppercase tracking-widest relative z-10"
                >
                    <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
                    Sync Radar
                </button>
            </div>

            {/* Premium Top Bar */}
            <div className="flex flex-col xl:flex-row gap-4 items-center">
                <div className="flex-1 relative group w-full xl:w-auto">
                    <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-primary/40 group-focus-within:text-primary transition-colors duration-300" size={22} />
                    <input
                        type="text"
                        placeholder="Scan reports by AWB or Shipment ID..."
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
                        Filter Events
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
                data={ndrs}
                columns={columns}
                isLoading={loading}
                keyExtractor={(n) => n._id}
                emptyMessage="No delivery reports detected on radar"
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

            {/* Resolution Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
                    <div className="bg-white rounded-[2rem] shadow-2xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in duration-200">
                        <div className="p-8 border-b bg-gray-50 flex justify-between items-center">
                            <div>
                                <h2 className="text-2xl font-black text-primary tracking-tight uppercase">Manual Resolution</h2>
                                <p className="text-sm text-gray-500 font-bold mt-1 uppercase tracking-widest flex items-center gap-2">
                                    AWB: <span className="text-blue-600 font-mono tracking-normal">{selectedNdr?.awb}</span>
                                </p>
                            </div>
                            <button onClick={() => setIsModalOpen(false)} className="w-10 h-10 rounded-full hover:bg-gray-200 flex items-center justify-center transition-colors">&times;</button>
                        </div>
                        <form onSubmit={handleResolve} className="p-8 space-y-6">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] px-1">Resolution Strategy</label>
                                <select
                                    className="w-full h-14 px-4 bg-gray-50 border-2 border-gray-100 rounded-2xl focus:outline-none focus:border-primary/20 font-bold text-gray-700 transition-all cursor-pointer"
                                    value={resolutionData.resolution}
                                    onChange={(e) => setResolutionData({ ...resolutionData, resolution: e.target.value })}
                                >
                                    <option value="RE-ATTEMPT">Request Re-attempt</option>
                                    <option value="ADDRESS-UPDATE">Integrate Address Core Update</option>
                                    <option value="RTO-CONFIRMED">Terminate to RTO</option>
                                    <option value="ON-HOLD">Quarantine (On Hold)</option>
                                </select>
                            </div>

                            {resolutionData.resolution === 'ADDRESS-UPDATE' && (
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] px-1">Updated Address Core</label>
                                    <textarea
                                        className="w-full p-4 bg-gray-50 border-2 border-gray-100 rounded-2xl focus:outline-none focus:border-primary/20 font-bold text-gray-700 transition-all h-24"
                                        placeholder="Enter the refined delivery endpoint..."
                                        value={resolutionData.updatedAddress}
                                        onChange={(e) => setResolutionData({ ...resolutionData, updatedAddress: e.target.value })}
                                    ></textarea>
                                </div>
                            )}

                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] px-1">Operational Intel / Notes</label>
                                <input
                                    type="text"
                                    className="w-full h-14 px-4 bg-gray-50 border-2 border-gray-100 rounded-2xl focus:outline-none focus:border-primary/20 font-bold text-gray-700 transition-all"
                                    placeholder="e.g. Verified customer uptime"
                                    value={resolutionData.customerAction}
                                    onChange={(e) => setResolutionData({ ...resolutionData, customerAction: e.target.value })}
                                />
                            </div>

                            <div className="flex justify-end gap-3 pt-4">
                                <button
                                    type="button"
                                    onClick={() => setIsModalOpen(false)}
                                    className="px-6 h-14 rounded-2xl text-gray-400 font-black uppercase text-[10px] tracking-widest hover:bg-gray-100 transition-all"
                                >
                                    Abort
                                </button>
                                <button
                                    type="submit"
                                    disabled={resolving}
                                    className="px-8 h-14 bg-primary text-white font-black uppercase text-[10px] tracking-widest rounded-2xl hover:bg-primary/90 shadow-xl shadow-primary/20 disabled:opacity-50 transition-all active:scale-95"
                                >
                                    {resolving ? 'Encrypting...' : 'Commit Status'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};
