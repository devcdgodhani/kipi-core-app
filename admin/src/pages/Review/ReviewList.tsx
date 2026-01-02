import React, { useEffect, useState, useCallback } from 'react';
import {
    Search,
    Filter,
    CheckCircle,
    XCircle,
    Trash2,
    Star,
    Eye,
    EyeOff,
    MessageSquareQuote,
    RotateCcw,
    UserCircle,
    Box
} from 'lucide-react';
import { reviewService } from '../../services/review.service';
import { type Review, REVIEW_STATUS } from '../../types/review';
import { Table, type Column } from '../../components/common/Table';
import { CommonFilter, type FilterField } from '../../components/common/CommonFilter';
import { PopupModal } from '../../components/common/PopupModal';
import { toast } from 'react-hot-toast';

const ReviewList: React.FC = () => {
    const [reviews, setReviews] = useState<Review[]>([]);
    const [loading, setLoading] = useState(true);
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
    const [filters, setFilters] = useState<any>({
        search: '',
        status: undefined,
        rating: undefined,
        isVisible: undefined,
        page: 1,
        limit: 10,
        isPaginate: true,
        populate: ['productId', 'userId']
    });

    const [pagination, setPagination] = useState({
        totalRecords: 0,
        totalPages: 0,
        currentPage: 1
    });

    const fetchReviews = useCallback(async () => {
        try {
            setLoading(true);
            const response = await reviewService.getAll(filters);
            if (response && response.data) {
                setReviews(response.data.recordList);
                setPagination({
                    totalRecords: response.data.totalRecords,
                    totalPages: response.data.totalPages,
                    currentPage: response.data.currentPage
                });
            }
        } catch (err: any) {
            toast.error(err.response?.data?.message || 'Failed to fetch reviews');
        } finally {
            setLoading(false);
        }
    }, [filters]);

    useEffect(() => {
        const timer = setTimeout(() => {
            fetchReviews();
        }, 300);
        return () => clearTimeout(timer);
    }, [fetchReviews]);

    const handleFilterChange = (updatedFilters: Record<string, any>) => {
        setFilters((prev: any) => ({ ...prev, ...updatedFilters, page: 1 }));
    };

    const handleUpdateStatus = async (id: string, status: REVIEW_STATUS, isVisible?: boolean) => {
        try {
            await reviewService.updateStatus(id, { status, isVisible });
            toast.success('Review protocol updated');
            fetchReviews();
        } catch (err: any) {
            toast.error(err.response?.data?.message || 'Update failed');
        }
    };

    const handleDeleteReview = async (id: string) => {
        setPopup({
            isOpen: true,
            title: 'Decommission Feedback',
            message: 'Are you sure you want to permanently remove this customer sentiment?',
            type: 'confirm',
            onConfirm: async () => {
                try {
                    setPopup((prev: any) => ({ ...prev, loading: true }));
                    await reviewService.delete(id);
                    toast.success('Sentiment removed');
                    fetchReviews();
                    setPopup((prev: any) => ({ ...prev, isOpen: false, loading: false }));
                } catch (err: any) {
                    setPopup({
                        isOpen: true,
                        title: 'Operational Error',
                        message: err.response?.data?.message || 'Deletion phase failed',
                        type: 'alert',
                        onConfirm: () => setPopup((prev: any) => ({ ...prev, isOpen: false }))
                    });
                }
            }
        });
    };

    const filterFields: FilterField[] = [
        {
            key: 'status',
            label: 'Moderation State',
            type: 'select',
            multiple: true,
            options: [
                { label: 'Pending Assessment', value: REVIEW_STATUS.PENDING },
                { label: 'Verified / Approved', value: REVIEW_STATUS.APPROVED },
                { label: 'Redacted / Rejected', value: REVIEW_STATUS.REJECTED }
            ]
        },
        {
            key: 'rating',
            label: 'Sentiment Score',
            type: 'select',
            options: [
                { label: 'Maximum (5/5)', value: 5 },
                { label: 'High (4/5)', value: 4 },
                { label: 'Mid (3/5)', value: 3 },
                { label: 'Low (2/5)', value: 2 },
                { label: 'Critical (1/5)', value: 1 }
            ]
        },
        {
            key: 'isVisible',
            label: 'Public Visibility',
            type: 'select',
            options: [
                { label: 'Visible to Ecosystem', value: true },
                { label: 'Internal Only', value: false }
            ]
        }
    ];

    const activeFilterCount = Object.keys(filters).filter(k =>
        !['search', 'page', 'limit', 'isPaginate', 'populate'].includes(k) &&
        filters[k] !== undefined &&
        (Array.isArray(filters[k]) ? filters[k].length > 0 : true)
    ).length;

    const columns: Column<Review>[] = [
        {
            header: 'Subject & Identity',
            key: 'product_user',
            render: (review) => (
                <div className="flex items-center gap-4 py-1">
                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center text-primary border border-primary/10 shadow-inner group-hover:scale-110 transition-transform duration-500">
                        {review.productId?.image?.preSignedUrl ? (
                            <img src={review.productId.image.preSignedUrl} alt="" className="w-full h-full object-cover rounded-2xl" />
                        ) : (
                            <Box size={26} />
                        )}
                    </div>
                    <div className="flex flex-col">
                        <span className="font-black text-gray-900 leading-tight uppercase tracking-tight line-clamp-1 max-w-[200px]">
                            {review.productId?.name || 'Decommissioned Product'}
                        </span>
                        <div className="flex items-center gap-2 mt-1">
                            <UserCircle size={10} className="text-primary/40" />
                            <span className="text-[10px] font-black text-primary/40 uppercase tracking-widest">
                                {review.userId?.firstName} {review.userId?.lastName}
                            </span>
                        </div>
                    </div>
                </div>
            )
        },
        {
            header: 'Sentiment Insight',
            key: 'content',
            render: (review) => (
                <div className="flex flex-col gap-2 py-1 max-w-md">
                    <div className="flex items-center gap-1">
                        {[1, 2, 3, 4, 5].map((s) => (
                            <Star
                                key={s}
                                size={14}
                                className={s <= review.rating ? 'text-amber-400 fill-amber-400 drop-shadow-sm' : 'text-gray-200'}
                            />
                        ))}
                    </div>
                    <p className="text-[11px] text-gray-600 font-medium italic leading-relaxed line-clamp-2 bg-gray-50/50 p-2 rounded-xl border border-gray-100/50">
                        "{review.comment}"
                    </p>
                </div>
            )
        },
        {
            header: 'Moderation Status',
            key: 'status',
            render: (review) => {
                const colors: any = {
                    APPROVED: 'bg-emerald-50 text-emerald-600 border-emerald-100',
                    REJECTED: 'bg-rose-50 text-rose-500 border-rose-100',
                    PENDING: 'bg-amber-50 text-amber-600 border-amber-100'
                };
                return (
                    <span className={`px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-sm border ${colors[review.status] || 'bg-gray-50 text-gray-400 border-gray-100'}`}>
                        {review.status}
                    </span>
                );
            }
        },
        {
            header: 'System Visibility',
            key: 'visibility',
            align: 'center',
            render: (review) => (
                <button
                    onClick={(e) => { e.stopPropagation(); handleUpdateStatus(review._id, review.status, !review.isVisible); }}
                    className={`p-3 rounded-2xl transition-all border ${review.isVisible
                        ? 'text-emerald-500 bg-emerald-50 border-emerald-100 hover:scale-110 shadow-sm'
                        : 'text-gray-400 bg-gray-50 border-gray-100 hover:text-primary hover:bg-primary/5 hover:border-primary/10'
                        }`}
                    title={review.isVisible ? 'Deactivate Visibility' : 'Activate Visibility'}
                >
                    {review.isVisible ? <Eye size={18} /> : <EyeOff size={18} />}
                </button>
            )
        },
        {
            header: 'Action Hub',
            key: 'actions',
            align: 'right',
            render: (review) => (
                <div className="flex items-center justify-end gap-2">
                    {review.status !== REVIEW_STATUS.APPROVED && (
                        <button
                            onClick={(e) => { e.stopPropagation(); handleUpdateStatus(review._id, REVIEW_STATUS.APPROVED, true); }}
                            className="p-3 text-emerald-600 hover:bg-emerald-50 rounded-2xl transition-all border border-transparent hover:border-emerald-100 group"
                            title="Verify Sentiment"
                        >
                            <CheckCircle size={18} className="group-hover:scale-110 transition-transform" />
                        </button>
                    )}
                    {review.status !== REVIEW_STATUS.REJECTED && (
                        <button
                            onClick={(e) => { e.stopPropagation(); handleUpdateStatus(review._id, REVIEW_STATUS.REJECTED, false); }}
                            className="p-3 text-rose-500 hover:bg-rose-50 rounded-2xl transition-all border border-transparent hover:border-rose-100 group"
                            title="Redact Sentiment"
                        >
                            <XCircle size={18} className="group-hover:scale-110 transition-transform" />
                        </button>
                    )}
                    <button
                        onClick={(e) => { e.stopPropagation(); handleDeleteReview(review._id); }}
                        className="p-3 text-gray-400 hover:text-rose-500 hover:bg-rose-50 rounded-2xl transition-all border border-transparent hover:border-rose-100 group"
                        title="Purge Feedback"
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
                <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full -mr-32 -mt-32 blur-3xl group-hover:bg-primary/10 transition-colors duration-1000" />
                <div className="relative z-10 flex items-center gap-6">
                    <div className="w-16 h-16 rounded-[1.5rem] bg-amber-500 flex items-center justify-center text-white shadow-xl shadow-amber-500/20">
                        <MessageSquareQuote size={32} />
                    </div>
                    <div>
                        <h1 className="text-3xl font-black text-primary tracking-tight uppercase font-mono">Feedback Hub</h1>
                        <p className="text-sm text-gray-500 font-medium">Moderating customer intelligence and sentiment analysis</p>
                    </div>
                </div>
                <div className="flex items-center gap-4 relative z-10">
                    <div className="bg-primary/5 px-6 py-3 rounded-2xl border border-primary/10 flex flex-col items-center">
                        <span className="text-[10px] font-black text-primary/40 uppercase tracking-widest leading-none mb-1">Total Mentions</span>
                        <span className="text-2xl font-black text-primary">{pagination.totalRecords}</span>
                    </div>
                </div>
            </div>

            {/* Intelligence Search Bar */}
            <div className="flex flex-col xl:flex-row gap-4">
                <div className="flex-1 relative group">
                    <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-primary/40 group-focus-within:text-primary transition-colors duration-300" size={22} />
                    <input
                        type="text"
                        placeholder="Scan sentiment repository by user identity or commentary..."
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
                            : 'bg-white border-primary/5 text-primary hover:bg-primary/5'
                            }`}
                    >
                        <Filter size={18} />
                        Neural Assessment
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
                                rating: undefined,
                                isVisible: undefined,
                                page: 1,
                                limit: 10,
                                isPaginate: true,
                                populate: ['productId', 'userId']
                            })}
                            className="px-6 py-4 rounded-[2rem] bg-rose-50 border-2 border-rose-100 text-rose-500 hover:bg-rose-100 transition-all font-black uppercase text-[10px] tracking-widest flex items-center gap-2 shadow-xl shadow-rose-100/50 h-16"
                        >
                            <RotateCcw size={16} />
                            Reset Hub
                        </button>
                    )}

                    <div className="flex items-center gap-3 bg-white border-2 border-primary/5 rounded-[2rem] px-6 py-2 shadow-xl shadow-gray-100/30 h-16">
                        <span className="text-[10px] font-black text-gray-300 uppercase tracking-widest">Viewport</span>
                        <select
                            value={filters.limit}
                            onChange={(e) => setFilters((prev: any) => ({ ...prev, limit: Number(e.target.value), page: 1 }))}
                            className="bg-transparent focus:outline-none font-black text-primary cursor-pointer text-sm outline-none border-none"
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
                onApply={handleFilterChange}
                currentFilters={filters}
            />

            <Table
                data={reviews}
                columns={columns}
                isLoading={loading}
                keyExtractor={(review) => review._id}
                emptyMessage="No customer sentiment discovered in this network"
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

            <PopupModal
                isOpen={popup.isOpen}
                onClose={() => setPopup((prev: any) => ({ ...prev, isOpen: false }))}
                title={popup.title}
                message={popup.message}
                type={popup.type}
                onConfirm={popup.onConfirm}
                loading={popup.loading}
            />
        </div>
    );
};

export default ReviewList;
