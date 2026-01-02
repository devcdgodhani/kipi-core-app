import React, { useEffect, useState, useCallback } from 'react';
import {
    Search,
    Filter,
    CheckCircle,
    XCircle,
    Trash2,
    Star,
    Eye,
    EyeOff
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
            toast.success('Review updated successfully');
            fetchReviews();
        } catch (err: any) {
            toast.error(err.response?.data?.message || 'Failed to update review');
        }
    };

    const handleDeleteReview = async (id: string) => {
        setPopup({
            isOpen: true,
            title: 'Delete Review',
            message: 'Are you sure you want to delete this review?',
            type: 'confirm',
            onConfirm: async () => {
                try {
                    setPopup((prev: any) => ({ ...prev, loading: true }));
                    await reviewService.delete(id);
                    toast.success('Review deleted successfully');
                    fetchReviews();
                    setPopup((prev: any) => ({ ...prev, isOpen: false, loading: false }));
                } catch (err: any) {
                    setPopup({
                        isOpen: true,
                        title: 'Error',
                        message: err.response?.data?.message || 'Failed to delete review',
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
            label: 'Review Status',
            type: 'select',
            multiple: true,
            options: [
                { label: 'Pending', value: REVIEW_STATUS.PENDING },
                { label: 'Approved', value: REVIEW_STATUS.APPROVED },
                { label: 'Rejected', value: REVIEW_STATUS.REJECTED }
            ]
        },
        {
            key: 'rating',
            label: 'Rating',
            type: 'select',
            options: [
                { label: '5 Stars', value: 5 },
                { label: '4 Stars', value: 4 },
                { label: '3 Stars', value: 3 },
                { label: '2 Stars', value: 2 },
                { label: '1 Star', value: 1 }
            ]
        },
        {
            key: 'isVisible',
            label: 'Visibility',
            type: 'select',
            options: [
                { label: 'Visible', value: true },
                { label: 'Hidden', value: false }
            ]
        }
    ];

    const columns: Column<Review>[] = [
        {
            header: 'Product & User',
            key: 'product_user',
            render: (review) => (
                <div className="flex flex-col py-1">
                    <span className="font-bold text-gray-900 leading-tight">
                        {review.productId?.name || 'Unknown Product'}
                    </span>
                    <span className="text-xs text-gray-500 mt-1">
                        By {review.userId?.firstName} {review.userId?.lastName}
                    </span>
                </div>
            )
        },
        {
            header: 'Rating & Comment',
            key: 'content',
            render: (review) => (
                <div className="flex flex-col gap-1 max-w-md">
                    <div className="flex items-center gap-1">
                        {[1, 2, 3, 4, 5].map((s) => (
                            <Star
                                key={s}
                                size={12}
                                className={s <= review.rating ? 'text-amber-400 fill-amber-400' : 'text-gray-200'}
                            />
                        ))}
                    </div>
                    <p className="text-xs text-gray-600 italic line-clamp-2">"{review.comment}"</p>
                </div>
            )
        },
        {
            header: 'Status',
            key: 'status',
            render: (review) => (
                <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${review.status === REVIEW_STATUS.APPROVED ? 'bg-emerald-50 text-emerald-600 border-emerald-100' :
                    review.status === REVIEW_STATUS.REJECTED ? 'bg-rose-50 text-rose-500 border-rose-100' :
                        'bg-amber-50 text-amber-600 border-amber-100'
                    }`}>
                    {review.status}
                </div>
            )
        },
        {
            header: 'Visibility',
            key: 'visibility',
            render: (review) => (
                <button
                    onClick={() => handleUpdateStatus(review._id, review.status, !review.isVisible)}
                    className={`p-2 rounded-xl transition-all ${review.isVisible ? 'text-green-500 hover:bg-green-50' : 'text-gray-400 hover:bg-gray-100'}`}
                    title={review.isVisible ? 'Hide' : 'Show'}
                >
                    {review.isVisible ? <Eye size={18} /> : <EyeOff size={18} />}
                </button>
            )
        },
        {
            header: 'Actions',
            key: 'actions',
            align: 'right',
            render: (review) => (
                <div className="flex items-center justify-end gap-2">
                    {review.status !== REVIEW_STATUS.APPROVED && (
                        <button
                            onClick={() => handleUpdateStatus(review._id, REVIEW_STATUS.APPROVED, true)}
                            className="p-2 text-emerald-600 hover:bg-emerald-50 rounded-xl transition-all"
                            title="Approve"
                        >
                            <CheckCircle size={20} />
                        </button>
                    )}
                    {review.status !== REVIEW_STATUS.REJECTED && (
                        <button
                            onClick={() => handleUpdateStatus(review._id, REVIEW_STATUS.REJECTED, false)}
                            className="p-2 text-rose-500 hover:bg-rose-50 rounded-xl transition-all"
                            title="Reject"
                        >
                            <XCircle size={20} />
                        </button>
                    )}
                    <button
                        onClick={() => handleDeleteReview(review._id)}
                        className="p-2 text-gray-400 hover:text-rose-500 hover:bg-rose-50 rounded-xl transition-all"
                        title="Delete"
                    >
                        <Trash2 size={20} />
                    </button>
                </div>
            )
        }
    ];

    return (
        <div className="p-6 space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-[2rem] border border-primary/5 shadow-sm">
                <div>
                    <h1 className="text-3xl font-black text-primary tracking-tight uppercase font-mono">Review Moderation</h1>
                    <p className="text-sm text-gray-500 font-medium">Approve, reject and manage customer product reviews</p>
                </div>
            </div>

            <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1 relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-primary/40" size={20} />
                    <input
                        type="text"
                        placeholder="Search reviews by comment or user..."
                        value={filters.search}
                        onChange={(e) => setFilters((prev: any) => ({ ...prev, search: e.target.value, page: 1 }))}
                        className="w-full bg-white border-2 border-primary/5 rounded-3xl py-4 pl-12 pr-4 focus:outline-none focus:border-primary/20 transition-all font-bold text-gray-700 shadow-xl shadow-gray-100/50"
                    />
                </div>

                <div className="flex gap-3">
                    <button
                        onClick={() => setIsFilterOpen(true)}
                        className="px-6 py-4 rounded-3xl border-2 bg-white border-primary/5 text-primary hover:bg-primary/5 transition-all font-black uppercase text-[10px] tracking-widest flex items-center gap-3"
                    >
                        <Filter size={18} />
                        Filters
                    </button>
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
                emptyMessage="No reviews found"
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
