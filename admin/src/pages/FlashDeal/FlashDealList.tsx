
import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import {
    Plus,
    Search,
    Edit,
    Trash2,
    Zap,
    RotateCcw,
    Clock
} from 'lucide-react';
import { flashDealService } from '../../services/flashDeal.service';
import { FLASH_DEAL_STATUS, FLASH_DEAL_DISCOUNT_TYPE } from '../../types/flashDeal.types';
import type { FlashDeal } from '../../types/flashDeal.types';
import toast from 'react-hot-toast';
import Button from '../../components/common/Button';
import { Table, type Column } from '../../components/common/Table';
import { PopupModal } from '../../components/common/PopupModal';

const FlashDealList: React.FC = () => {
    const [searchParams, setSearchParams] = useSearchParams();
    const navigate = useNavigate();

    const [flashDeals, setFlashDeals] = useState<FlashDeal[]>([]);
    const [loading, setLoading] = useState(true);
    const [totalRecords, setTotalRecords] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [dealToDelete, setDealToDelete] = useState<string | null>(null);

    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const search = searchParams.get('search') || '';
    const status = searchParams.get('status') || '';

    const fetchFlashDeals = useCallback(async () => {
        try {
            setLoading(true);
            const params = {
                page,
                limit,
                search: search || undefined,
                status: status || undefined,
            };
            const response = await flashDealService.getWithPagination(params);
            if (response && response.data) {
                setFlashDeals(response.data.recordList || []);
                setTotalRecords(response.data.totalRecords || 0);
                setTotalPages(response.data.totalPages || 0);
            }
        } catch (error) {
            console.error('Error fetching flash deals:', error);
            toast.error('Failed to fetch flash deals');
        } finally {
            setLoading(false);
        }
    }, [page, limit, search, status]);

    useEffect(() => {
        const timer = setTimeout(() => {
            fetchFlashDeals();
        }, 300);
        return () => clearTimeout(timer);
    }, [fetchFlashDeals]);

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
        setDealToDelete(id);
        setIsDeleteModalOpen(true);
    };

    const confirmDelete = async () => {
        if (!dealToDelete) return;
        try {
            await flashDealService.deleteByFilter(dealToDelete);
            toast.success('Flash deal deleted successfully');
            fetchFlashDeals();
        } catch (error) {
            console.error('Error deleting flash deal:', error);
            toast.error('Failed to delete flash deal');
        } finally {
            setIsDeleteModalOpen(false);
            setDealToDelete(null);
        }
    };

    const getStatusColor = (status: FLASH_DEAL_STATUS) => {
        switch (status) {
            case FLASH_DEAL_STATUS.ACTIVE: return 'bg-emerald-50 text-emerald-600 border-emerald-100';
            case FLASH_DEAL_STATUS.DRAFT: return 'bg-gray-50 text-gray-400 border-gray-100';
            case FLASH_DEAL_STATUS.COMPLETED: return 'bg-blue-50 text-blue-500 border-blue-100';
            case FLASH_DEAL_STATUS.CANCELLED: return 'bg-rose-50 text-rose-500 border-rose-100';
            default: return 'bg-gray-50 text-gray-500 border-gray-100';
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

    const columns: Column<FlashDeal>[] = [
        {
            header: 'Campaign',
            key: 'name',
            render: (deal) => (
                <div className="flex items-center gap-4 py-1">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-400/20 to-amber-600/5 flex items-center justify-center text-amber-600 border border-amber-500/10 shadow-inner">
                        <Zap size={24} />
                    </div>
                    <div className="flex flex-col">
                        <p className="font-bold text-gray-900 leading-tight tracking-wide">{deal.name}</p>
                        <p className="text-[10px] font-semibold text-gray-400 mt-1 uppercase tracking-tighter truncate max-w-[200px]">
                            {deal.description || 'Flash promotion'}
                        </p>
                    </div>
                </div>
            )
        },
        {
            header: 'Economics',
            key: 'discountValue',
            render: (deal) => (
                <div className="flex flex-col py-1">
                    <span className="font-black text-amber-600 text-base">
                        {deal.discountType === FLASH_DEAL_DISCOUNT_TYPE.PERCENTAGE ? `${deal.discountValue}% OFF` : `₹${deal.discountValue} OFF`}
                    </span>
                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-1">
                        {deal.productIds?.length || 0} Targeted Items
                    </span>
                </div>
            )
        },
        {
            header: 'Live Window',
            key: 'startTime',
            render: (deal) => (
                <div className="flex flex-col gap-1.5 py-1">
                    <div className="flex items-center gap-2 px-2 py-0.5 bg-gray-50 rounded-lg border border-gray-100 w-fit">
                        <Clock size={10} className="text-amber-500/40" />
                        <span className="text-[10px] font-black text-gray-500 uppercase tracking-tight">{formatDate(deal.startTime)}</span>
                    </div>
                    <div className="flex items-center gap-2 px-2 py-0.5 bg-gray-50 rounded-lg border border-gray-100 w-fit">
                        <Clock size={10} className="text-rose-500/40" />
                        <span className="text-[10px] font-black text-gray-500 uppercase tracking-tight">{formatDate(deal.endTime)}</span>
                    </div>
                </div>
            )
        },
        {
            header: 'Throttling / Sold',
            key: 'usage',
            render: (deal) => (
                <div className="flex flex-col gap-2 py-1">
                    <div className="flex items-center justify-between gap-4">
                        <span className="text-[10px] font-black text-gray-900 uppercase tracking-widest">{deal.currentQuantitySold || 0} units</span>
                        <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Cap: {deal.totalQuantityLimit || '∞'}</span>
                    </div>
                    <div className="w-32 h-2 bg-gray-100 rounded-full overflow-hidden border border-gray-50">
                        <div
                            className="h-full bg-amber-500 transition-all duration-500 shadow-[0_0_8px_rgba(245,158,11,0.3)]"
                            style={{
                                width: deal.totalQuantityLimit
                                    ? `${Math.min(((deal.currentQuantitySold || 0) / deal.totalQuantityLimit) * 100, 100)}%`
                                    : '0%'
                            }}
                        />
                    </div>
                </div>
            )
        },
        {
            header: 'Status',
            key: 'status',
            render: (deal) => (
                <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-[0.15em] border ${getStatusColor(deal.status)}`}>
                    {deal.status}
                </span>
            )
        },
        {
            header: 'Action',
            key: 'actions',
            align: 'right',
            render: (deal) => (
                <div className="flex items-center justify-end gap-2">
                    <button
                        onClick={() => navigate(`/flash-deals/edit/${deal._id}`)}
                        className="p-3 text-primary hover:bg-primary/5 rounded-2xl transition-all border border-transparent hover:border-primary/10 group"
                        title="Edit"
                    >
                        <Edit size={18} className="group-hover:scale-110 transition-transform" />
                    </button>
                    <button
                        onClick={() => handleDelete(deal._id)}
                        className="p-3 text-rose-500 hover:bg-rose-50 rounded-2xl transition-all border border-transparent hover:border-rose-100 group"
                        title="Delete"
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
                <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/5 rounded-full -mr-32 -mt-32 blur-3xl group-hover:bg-amber-500/10 transition-colors duration-1000" />
                <div className="relative z-10 flex items-center gap-6">
                    <div className="w-16 h-16 rounded-[1.5rem] bg-amber-500 flex items-center justify-center text-white shadow-xl shadow-amber-500/20">
                        <Zap size={32} />
                    </div>
                    <div>
                        <h1 className="text-3xl font-black text-primary tracking-tight uppercase font-mono">Flash Deals</h1>
                        <p className="text-sm text-gray-500 font-medium">Coordinate high-urgency, time-restricted price drops</p>
                    </div>
                </div>
                <Button
                    onClick={() => navigate('/flash-deals/create')}
                    className="rounded-2xl shadow-xl shadow-amber-500/20 h-14 px-8 relative z-10 bg-amber-500 hover:bg-amber-600 border-none"
                >
                    <Plus size={20} className="mr-2" />
                    <span>Initiate Campaign</span>
                </Button>
            </div>

            {/* Top Bar with Search and Filters */}
            <div className="flex flex-col xl:flex-row gap-4 items-center">
                <div className="flex-1 relative group w-full xl:w-auto">
                    <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-primary/40 group-focus-within:text-primary transition-colors duration-300" size={22} />
                    <input
                        type="text"
                        placeholder="Scan for active campaigns..."
                        value={search}
                        onChange={handleSearch}
                        className="w-full bg-white border-2 border-primary/5 rounded-[2rem] py-5 pl-16 pr-6 focus:outline-none focus:border-primary/20 transition-all font-bold text-gray-700 shadow-xl shadow-gray-100/50 h-16"
                    />
                </div>

                <div className="flex flex-wrap gap-3 w-full xl:w-auto h-full items-center">
                    <div className="flex items-center gap-3 bg-white border-2 border-primary/5 rounded-[2rem] px-6 h-16 shadow-xl shadow-gray-100/50">
                        <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-1">Status</span>
                        <select
                            className="bg-transparent focus:outline-none font-black text-primary uppercase text-[10px] tracking-widest cursor-pointer"
                            value={status}
                            onChange={(e) => handleFilterChange('status', e.target.value)}
                        >
                            <option value="">All Statuses</option>
                            {Object.values(FLASH_DEAL_STATUS).map(s => (
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
                            Reset Hub
                        </button>
                    )}
                </div>
            </div>

            <Table
                data={flashDeals}
                columns={columns}
                isLoading={loading}
                keyExtractor={(deal) => deal._id}
                emptyMessage="No flash deal campaigns active"
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
                        setDealToDelete(null);
                    }}
                    title="Terminate Campaign"
                    message="Are you sure you want to delete this flash deal? Current purchasers will be affected by the sudden termination."
                    type="confirm"
                    onConfirm={confirmDelete}
                    confirmLabel="Terminate"
                    cancelLabel="Hold"
                />
            )}
        </div>
    );
};

export default FlashDealList;
