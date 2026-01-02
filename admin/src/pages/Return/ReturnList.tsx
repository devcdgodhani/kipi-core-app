import React, { useEffect, useState } from 'react';
import {
    Search, Filter, RefreshCw,
    Eye, CheckCircle2,
    CornerUpLeft, Clock,
    IndianRupee, User, ShoppingBag
} from 'lucide-react';
import { useSearchParams } from 'react-router-dom';
import { returnService } from '../../services/returnService';
import type { IReturn } from '../../types/return.types';
import { RETURN_STATUS } from '../../types/return.types';
import { Table } from '../../components/common/Table';
import { CommonFilter, type FilterField } from '../../components/common/CommonFilter';
import CustomButton from '../../components/common/Button';
import { toast } from 'react-hot-toast';
import { ReturnDetailSidebar } from '../../components/return/ReturnDetailSidebar';

const filterFields: FilterField[] = [
    {
        key: 'status',
        label: 'Return Status',
        type: 'select',
        options: Object.values(RETURN_STATUS).map(s => ({ label: s, value: s }))
    },
    {
        key: 'refundStatus',
        label: 'Refund Status',
        type: 'select',
        options: [
            { label: 'Pending', value: 'PENDING' },
            { label: 'Processed', value: 'PROCESSED' },
            { label: 'Failed', value: 'FAILED' }
        ]
    }
];

const statusStyles: Record<string, string> = {
    [RETURN_STATUS.PENDING]: 'bg-amber-50 text-amber-600 border-amber-100',
    [RETURN_STATUS.APPROVED]: 'bg-blue-50 text-blue-600 border-blue-100',
    [RETURN_STATUS.PICKED_UP]: 'bg-indigo-50 text-indigo-600 border-indigo-100',
    [RETURN_STATUS.RECEIVED]: 'bg-purple-50 text-purple-600 border-purple-100',
    [RETURN_STATUS.COMPLETED]: 'bg-emerald-50 text-emerald-600 border-emerald-100',
    [RETURN_STATUS.REJECTED]: 'bg-rose-50 text-rose-600 border-rose-100',
    [RETURN_STATUS.CANCELLED]: 'bg-gray-50 text-gray-600 border-gray-100'
};

export const ReturnList = () => {
    const [returns, setReturns] = useState<IReturn[]>([]);
    const [loading, setLoading] = useState(true);
    const [totalRecords, setTotalRecords] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const [isFilterOpen, setIsFilterOpen] = useState(false);
    const [selectedReturnId, setSelectedReturnId] = useState<string | null>(null);

    const [searchParams, setSearchParams] = useSearchParams();
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const search = searchParams.get('search') || '';

    const fetchReturns = async () => {
        try {
            setLoading(true);
            const filters: any = {
                page,
                limit,
                search,
                status: searchParams.get('status'),
                refundStatus: searchParams.get('refundStatus')
            };

            const response = await returnService.getWithPagination(filters);
            if (response.data?.data) {
                const { recordList, totalRecords, totalPages } = response.data.data;
                setReturns(recordList);
                setTotalRecords(totalRecords);
                setTotalPages(totalPages);
            }
        } catch (err) {
            console.error('Failed to fetch returns', err);
            toast.error('Failed to load return requests');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchReturns();
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

    const columns = [
        {
            header: 'ID & Timeline',
            key: 'returnNumber',
            render: (ret: IReturn) => (
                <div className="flex flex-col gap-1.5">
                    <div className="flex items-center gap-2">
                        <span className="bg-primary/5 text-primary text-[10px] font-black px-2 py-0.5 rounded-md border border-primary/10 tracking-widest uppercase font-mono">
                            {ret.returnNumber}
                        </span>
                    </div>
                    <div className="flex items-center gap-1.5 text-gray-400">
                        <Clock size={12} />
                        <span className="text-[10px] font-bold uppercase tracking-tight">
                            {new Date(ret.createdAt).toLocaleDateString()}
                        </span>
                    </div>
                </div>
            )
        },
        {
            header: 'Source Entity',
            key: 'order',
            render: (ret: IReturn) => (
                <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-2 text-gray-900 font-black text-xs uppercase tracking-tight">
                        <ShoppingBag size={14} className="text-primary/60" />
                        {ret.orderId?.orderNumber || 'Unknown Order'}
                    </div>
                    <div className="flex items-center gap-2 text-gray-500 font-bold text-[10px] uppercase">
                        <User size={12} className="text-gray-400" />
                        {ret.userId?.firstName} {ret.userId?.lastName}
                    </div>
                </div>
            )
        },
        {
            header: 'Asset Manifest',
            key: 'items',
            render: (ret: IReturn) => (
                <div className="flex flex-col gap-1">
                    <span className="text-xs font-black text-gray-700 uppercase">
                        {ret.items.length} Units Targeted
                    </span>
                    <span className="text-[10px] font-bold text-gray-400 uppercase italic">
                        {ret.items[0]?.reason.replace(/_/g, ' ')}
                    </span>
                </div>
            )
        },
        {
            header: 'Financial Delta',
            key: 'refund',
            render: (ret: IReturn) => (
                <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-1 text-emerald-600 font-black text-xs">
                        <IndianRupee size={12} />
                        {ret.totalRefundAmount.toLocaleString()}
                    </div>
                    <div className={`text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full border w-fit ${ret.refundStatus === 'PROCESSED' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' :
                            ret.refundStatus === 'FAILED' ? 'bg-rose-50 text-rose-600 border-rose-100' :
                                'bg-amber-50 text-amber-600 border-amber-100'
                        }`}>
                        {ret.refundStatus}
                    </div>
                </div>
            )
        },
        {
            header: 'Workflow State',
            key: 'status',
            render: (ret: IReturn) => (
                <div className={`px-4 py-1.5 rounded-xl border text-[10px] font-black uppercase tracking-widest text-center transition-all ${statusStyles[ret.status] || 'bg-gray-50 text-gray-500'}`}>
                    {ret.status.replace(/_/g, ' ')}
                </div>
            )
        },
        {
            header: 'Admin Hub',
            key: 'actions',
            render: (ret: IReturn) => (
                <div className="flex items-center gap-2">
                    <button
                        onClick={() => setSelectedReturnId(ret._id)}
                        className="p-2.5 bg-gray-50 text-gray-400 hover:text-primary hover:bg-white hover:shadow-md rounded-xl transition-all border border-transparent hover:border-primary/10 group"
                        title="Neural View"
                    >
                        <Eye size={18} className="group-hover:scale-110 transition-transform" />
                    </button>
                    <button className="p-2.5 bg-gray-50 text-gray-400 hover:text-emerald-500 hover:bg-white hover:shadow-md rounded-xl transition-all border border-transparent hover:border-emerald-100 group">
                        <CheckCircle2 size={18} className="group-hover:scale-110 transition-transform" />
                    </button>
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
                    <div className="w-16 h-16 rounded-[1.5rem] bg-rose-500 flex items-center justify-center text-white shadow-xl shadow-rose-500/20">
                        <CornerUpLeft size={32} />
                    </div>
                    <div className="flex flex-col min-w-0">
                        <h1 className="text-3xl font-black text-primary tracking-tight uppercase font-mono truncate">RMA Repository</h1>
                        <p className="text-sm text-gray-500 font-medium truncate">Customer return requests & refund lifecycle management</p>
                    </div>
                </div>
                <div className="flex items-center gap-3 relative z-10">
                    <div className="hidden lg:flex flex-col items-end mr-6 text-right border-r border-gray-100 pr-6">
                        <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Active Claims</span>
                        <span className="text-2xl font-mono font-black text-primary leading-none">{totalRecords}</span>
                    </div>
                    <CustomButton
                        onClick={() => fetchReturns()}
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
                        placeholder="Scan directory by ID, customer or order..."
                        className="w-full pl-14 pr-6 py-4 bg-gray-50/50 border-2 border-transparent focus:bg-white focus:border-primary/20 rounded-[1.5rem] outline-none transition-all font-bold text-gray-700 h-14"
                        onChange={handleSearch}
                        value={search}
                    />
                </div>

                <div className="flex items-center gap-3">
                    <button
                        onClick={() => setIsFilterOpen(true)}
                        className={`flex items-center gap-2 px-6 h-14 rounded-2xl font-black uppercase text-[10px] tracking-widest transition-all ${searchParams.get('status') || searchParams.get('refundStatus')
                                ? 'bg-primary/10 text-primary border-2 border-primary/20 shadow-lg shadow-primary/5'
                                : 'bg-white text-gray-500 border-2 border-gray-100 hover:bg-gray-50'
                            }`}
                    >
                        <Filter size={18} />
                        Neural Assessment
                    </button>

                    <CustomButton
                        onClick={() => setSearchParams({})}
                        className="h-14 px-6 bg-gray-50 text-gray-400 hover:bg-gray-100 rounded-2xl border border-gray-200 shadow-none font-black uppercase text-[10px] tracking-widest"
                    >
                        Reset Hub
                    </CustomButton>
                </div>
            </div>

            {/* Neural Data Grid */}
            <div className="flex-1 min-h-0 bg-white rounded-[2.5rem] border border-primary/5 shadow-sm overflow-hidden flex flex-col">
                <Table
                    columns={columns as any}
                    data={returns}
                    isLoading={loading}
                    keyExtractor={(item: IReturn) => item._id}
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

            <ReturnDetailSidebar
                isOpen={!!selectedReturnId}
                onClose={() => setSelectedReturnId(null)}
                returnId={selectedReturnId}
                onStatusUpdate={fetchReturns}
            />
        </div>
    );
};
