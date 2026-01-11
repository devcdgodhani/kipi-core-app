
import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
    Search,
    Trash2,
    RotateCcw,
    User,
    BarChart3,
    Hash,
    Clock,
    Filter
} from 'lucide-react';
import { searchQueryService } from '../../services/searchQuery.service';
import { SEARCH_QUERY_STATUS } from '../../types/searchQuery.types';
import type { SearchQuery } from '../../types/searchQuery.types';
import toast from 'react-hot-toast';
import { Table, type Column } from '../../components/common/Table';
import { PopupModal } from '../../components/common/PopupModal';

const SearchQueryList: React.FC = () => {
    const [searchParams, setSearchParams] = useSearchParams();

    const [queries, setQueries] = useState<SearchQuery[]>([]);
    const [loading, setLoading] = useState(true);
    const [totalRecords, setTotalRecords] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [queryToDelete, setQueryToDelete] = useState<string | null>(null);

    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const search = searchParams.get('search') || '';
    const status = searchParams.get('status') || '';

    const fetchQueries = useCallback(async () => {
        try {
            setLoading(true);
            const params = {
                page,
                limit,
                search: search || undefined,
                status: status || undefined,
            };
            const response = await searchQueryService.getWithPagination(params);
            if (response && response.data) {
                setQueries(response.data.recordList || []);
                setTotalRecords(response.data.totalRecords || 0);
                setTotalPages(response.data.totalPages || 0);
            }
        } catch (error) {
            console.error('Error fetching search queries:', error);
            toast.error('Failed to fetch search queries');
        } finally {
            setLoading(false);
        }
    }, [page, limit, search, status]);

    useEffect(() => {
        const timer = setTimeout(() => {
            fetchQueries();
        }, 300);
        return () => clearTimeout(timer);
    }, [fetchQueries]);

    const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchParams(prev => {
            prev.set('search', e.target.value);
            prev.set('page', '1');
            return prev;
        });
    };

    const handleFilterChange = (key: string, value: string) => {
        setSearchParams(prev => {
            if (value) {
                prev.set(key, value);
            } else {
                prev.delete(key);
            }
            prev.set('page', '1');
            return prev;
        });
    };

    const handleDelete = (id: string) => {
        setQueryToDelete(id);
        setIsDeleteModalOpen(true);
    };

    const confirmDelete = async () => {
        if (!queryToDelete) return;
        try {
            await searchQueryService.deleteByFilter(queryToDelete);
            toast.success('Query entry purged successfully');
            fetchQueries();
        } catch (error) {
            console.error('Error deleting query:', error);
            toast.error('Failed to purge query');
        } finally {
            setIsDeleteModalOpen(false);
            setQueryToDelete(null);
        }
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleString('en-US', {
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const columns: Column<SearchQuery>[] = [
        {
            header: 'Search Intent',
            key: 'query',
            render: (item) => (
                <div className="flex items-center gap-4 py-1">
                    <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-500 border border-indigo-100 italic font-mono font-bold">
                        "
                    </div>
                    <div className="flex flex-col">
                        <p className="font-black text-gray-900 leading-tight tracking-wide text-lg">"{item.query}"</p>
                        <p className="text-[10px] font-semibold text-gray-400 mt-1 uppercase tracking-widest flex items-center gap-1">
                            <Hash size={10} /> {item._id}
                        </p>
                    </div>
                </div>
            )
        },
        {
            header: 'Analytical Results',
            key: 'resultCount',
            render: (item) => (
                <div className="flex flex-col gap-1 py-1">
                    <div className={`flex items-center gap-2 px-3 py-1 rounded-full border w-fit ${item.resultCount > 0 ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-rose-50 text-rose-500 border-rose-100'}`}>
                        <BarChart3 size={12} />
                        <span className="text-[11px] font-black uppercase tracking-widest">{item.resultCount} Matches</span>
                    </div>
                </div>
            )
        },
        {
            header: 'User Attribution',
            key: 'userId',
            render: (item) => (
                <div className="flex items-center gap-2 py-1">
                    <div className="w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center text-gray-400 border border-gray-100">
                        <User size={14} />
                    </div>
                    <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest truncate max-w-[120px]">
                        {item.userId || 'Guest Consumer'}
                    </span>
                </div>
            )
        },
        {
            header: 'Timestamp',
            key: 'createdAt',
            render: (item) => (
                <div className="flex items-center gap-2 py-1">
                    <Clock size={12} className="text-gray-400" />
                    <span className="text-[10px] font-bold text-gray-500 uppercase tracking-tight">
                        {formatDate(item.createdAt)}
                    </span>
                </div>
            )
        },
        {
            header: 'Status',
            key: 'status',
            render: (item) => (
                <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-[0.15em] border ${item.status === SEARCH_QUERY_STATUS.ACTIVE ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-gray-50 text-gray-400 border-gray-100'}`}>
                    {item.status}
                </span>
            )
        },
        {
            header: 'Action',
            key: 'actions',
            align: 'right',
            render: (item) => (
                <div className="flex items-center justify-end gap-2">
                    <button
                        onClick={() => handleDelete(item._id)}
                        className="p-3 text-rose-500 hover:bg-rose-50 rounded-2xl transition-all border border-transparent hover:border-rose-100 group"
                        title="Purge Entry"
                    >
                        <Trash2 size={18} className="group-hover:scale-110 transition-transform" />
                    </button>
                </div>
            )
        }
    ];

    return (
        <div className="p-6 space-y-6">
            {/* Premium Hero Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-white p-8 rounded-[2.5rem] border border-primary/5 shadow-sm relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/5 rounded-full -mr-32 -mt-32 blur-3xl group-hover:bg-indigo-500/10 transition-colors duration-1000" />
                <div className="relative z-10 flex items-center gap-6">
                    <div className="w-16 h-16 rounded-[1.5rem] bg-indigo-600 flex items-center justify-center text-white shadow-xl shadow-indigo-600/20">
                        <Search size={32} />
                    </div>
                    <div>
                        <h1 className="text-3xl font-black text-primary tracking-tight uppercase font-mono">Search Intelligence</h1>
                        <p className="text-sm text-gray-500 font-medium">Monitoring consumer intent and product discovery patterns</p>
                    </div>
                </div>
            </div>

            {/* Analytics Bar */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-emerald-50 flex items-center justify-center text-emerald-600 border border-emerald-100">
                        <BarChart3 size={24} />
                    </div>
                    <div>
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Total Logs</p>
                        <p className="text-2xl font-black text-gray-900">{totalRecords}</p>
                    </div>
                </div>
                <div className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-amber-50 flex items-center justify-center text-amber-600 border border-amber-100">
                        <Search size={24} />
                    </div>
                    <div>
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Active Filters</p>
                        <p className="text-2xl font-black text-gray-900">{search || status ? 'Enabled' : 'None'}</p>
                    </div>
                </div>
                <div className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-600 border border-indigo-100">
                        <Clock size={24} />
                    </div>
                    <div>
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Tracking Mode</p>
                        <p className="text-2xl font-black text-gray-900">Real-time</p>
                    </div>
                </div>
            </div>

            {/* Top Bar with Search and Filters */}
            <div className="flex flex-col xl:flex-row gap-4 items-center">
                <div className="flex-1 relative group w-full xl:w-auto">
                    <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-primary/40 group-focus-within:text-primary transition-colors duration-300" size={22} />
                    <input
                        type="text"
                        placeholder="Scan for specific keywords or intents..."
                        value={search}
                        onChange={handleSearch}
                        className="w-full bg-white border-2 border-primary/5 rounded-[2rem] py-5 pl-16 pr-6 focus:outline-none focus:border-primary/20 transition-all font-bold text-gray-700 shadow-xl shadow-gray-100/50 h-16"
                    />
                </div>

                <div className="flex flex-wrap gap-3 w-full xl:w-auto h-full items-center">
                    <div className="flex items-center gap-3 bg-white border-2 border-primary/5 rounded-[2rem] px-6 h-16 shadow-xl shadow-gray-100/50">
                        <Filter className="text-primary/40" size={18} />
                        <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-1">Status</span>
                        <select
                            className="bg-transparent focus:outline-none font-black text-primary uppercase text-[10px] tracking-widest cursor-pointer"
                            value={status}
                            onChange={(e) => handleFilterChange('status', e.target.value)}
                        >
                            <option value="">All Logs</option>
                            {Object.values(SEARCH_QUERY_STATUS).map(s => (
                                <option key={s} value={s}>{s}</option>
                            ))}
                        </select>
                    </div>

                    {(search || status) && (
                        <button
                            onClick={() => setSearchParams({ page: '1', limit: '10' })}
                            className="px-8 h-16 rounded-[2rem] bg-rose-50 border-2 border-rose-100 text-rose-500 hover:bg-rose-100 transition-all font-black uppercase text-[10px] tracking-widest flex items-center gap-2 shadow-xl shadow-rose-100/50"
                        >
                            <RotateCcw size={18} />
                            Flush Filters
                        </button>
                    )}
                </div>
            </div>

            <Table
                data={queries}
                columns={columns}
                isLoading={loading}
                keyExtractor={(item) => item._id}
                emptyMessage="No search telemetry captured yet"
                pagination={totalRecords > 0 ? {
                    currentPage: page,
                    totalPages: totalPages,
                    totalRecords: totalRecords,
                    pageSize: limit,
                    onPageChange: (p) => setSearchParams(prev => { prev.set('page', p.toString()); return prev; }),
                    hasPreviousPage: page > 1,
                    hasNextPage: page < totalPages
                } : undefined}
            />

            {isDeleteModalOpen && (
                <PopupModal
                    isOpen={isDeleteModalOpen}
                    onClose={() => {
                        setIsDeleteModalOpen(false);
                        setQueryToDelete(null);
                    }}
                    title="Purge Telemetry"
                    message="Are you sure you want to remove this search log? Analytical data for this specific intent will be lost."
                    type="confirm"
                    onConfirm={confirmDelete}
                    confirmLabel="Purge"
                    cancelLabel="Retain"
                />
            )}
        </div>
    );
};

export default SearchQueryList;
