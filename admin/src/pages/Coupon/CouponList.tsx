import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import {
    Plus,
    Search,
    Edit,
    Trash2,
    Calendar,
    Ticket,
    RotateCcw
} from 'lucide-react';
import { couponService } from '../../services/couponService';
import { COUPON_STATUS, COUPON_TYPE } from '../../types/coupon.types';
import type { Coupon } from '../../types/coupon.types';
import toast from 'react-hot-toast';
import Button from '../../components/common/Button';
import { Table, type Column } from '../../components/common/Table';

const CouponList: React.FC = () => {
    const [searchParams, setSearchParams] = useSearchParams();
    const navigate = useNavigate();

    const [coupons, setCoupons] = useState<Coupon[]>([]);
    const [loading, setLoading] = useState(true);
    const [totalRecords, setTotalRecords] = useState(0);
    const [totalPages, setTotalPages] = useState(0);

    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const search = searchParams.get('search') || '';
    const status = searchParams.get('status') || '';

    const fetchCoupons = useCallback(async () => {
        try {
            setLoading(true);
            const params = {
                page,
                limit,
                search: search || undefined,
                status: status || undefined,
            };
            const data = await couponService.getWithPagination(params);
            if (data) {
                setCoupons(data.recordList || []);
                setTotalRecords(data.totalRecords || 0);
                setTotalPages(data.totalPages || 0);
            }
        } catch (error) {
            console.error('Error fetching coupons:', error);
            toast.error('Failed to fetch coupons');
        } finally {
            setLoading(false);
        }
    }, [page, limit, search, status]);

    useEffect(() => {
        const timer = setTimeout(() => {
            fetchCoupons();
        }, 300);
        return () => clearTimeout(timer);
    }, [fetchCoupons]);

    const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchParams(prev => {
            prev.set('search', e.target.value);
            prev.set('page', '1');
            return prev;
        });
    };

    const handleStatusFilter = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setSearchParams(prev => {
            if (e.target.value) {
                prev.set('status', e.target.value);
            } else {
                prev.delete('status');
            }
            prev.set('page', '1');
            return prev;
        });
    };

    const handleDelete = async (id: string) => {
        if (!window.confirm('Are you sure you want to delete this coupon?')) return;
        try {
            await couponService.deleteById(id);
            toast.success('Coupon deleted successfully');
            fetchCoupons();
        } catch (error) {
            console.error('Error deleting coupon:', error);
            toast.error('Failed to delete coupon');
        }
    };

    const getStatusColor = (status: COUPON_STATUS) => {
        switch (status) {
            case COUPON_STATUS.ACTIVE: return 'bg-emerald-50 text-emerald-600 border-emerald-100';
            case COUPON_STATUS.INACTIVE: return 'bg-gray-50 text-gray-500 border-gray-100';
            case COUPON_STATUS.EXPIRED: return 'bg-rose-50 text-rose-500 border-rose-100';
            default: return 'bg-gray-50 text-gray-500 border-gray-100';
        }
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    const columns: Column<Coupon>[] = [
        {
            header: 'Coupon Info',
            key: 'code',
            render: (coupon) => (
                <div className="flex items-center gap-4 py-1">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center text-primary border border-primary/10 shadow-inner">
                        <Ticket size={24} />
                    </div>
                    <div className="flex flex-col">
                        <p className="font-bold text-gray-900 uppercase leading-tight tracking-wide">{coupon.code}</p>
                        <p className="text-[10px] font-semibold text-gray-400 mt-1 uppercase tracking-tighter truncate max-w-[200px]">
                            {coupon.description || 'Global promotional offer'}
                        </p>
                    </div>
                </div>
            )
        },
        {
            header: 'Discount Details',
            key: 'discount',
            render: (coupon) => (
                <div className="flex flex-col py-1">
                    <span className="font-black text-primary text-base">
                        {coupon.type === COUPON_TYPE.PERCENTAGE ? `${coupon.value}% OFF` : `₹${coupon.value} OFF`}
                    </span>
                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-1">
                        Min. Order: ₹{coupon.minOrderAmount}
                    </span>
                </div>
            )
        },
        {
            header: 'Validity Period',
            key: 'validity',
            render: (coupon) => (
                <div className="flex flex-col gap-1.5 py-1">
                    <div className="flex items-center gap-2 px-2 py-0.5 bg-gray-50 rounded-lg border border-gray-100 w-fit">
                        <Calendar size={10} className="text-primary/40" />
                        <span className="text-[10px] font-black text-gray-500 uppercase tracking-tight">{formatDate(coupon.startDate)}</span>
                    </div>
                    <div className="flex items-center gap-2 px-2 py-0.5 bg-gray-50 rounded-lg border border-gray-100 w-fit">
                        <Calendar size={10} className="text-primary/40" />
                        <span className="text-[10px] font-black text-gray-500 uppercase tracking-tight">{formatDate(coupon.endDate)}</span>
                    </div>
                </div>
            )
        },
        {
            header: 'Usage Progress',
            key: 'usage',
            render: (coupon) => (
                <div className="flex flex-col gap-2 py-1">
                    <div className="flex items-center justify-between gap-4">
                        <span className="text-[10px] font-black text-gray-900 uppercase tracking-widest">{coupon.usageCount} applied</span>
                        <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Limit: {coupon.usageLimit || '∞'}</span>
                    </div>
                    <div className="w-32 h-2 bg-gray-100 rounded-full overflow-hidden border border-gray-50">
                        <div
                            className="h-full bg-primary transition-all duration-500 shadow-[0_0_8px_rgba(var(--primary-rgb),0.3)]"
                            style={{
                                width: coupon.usageLimit
                                    ? `${Math.min((coupon.usageCount / coupon.usageLimit) * 100, 100)}%`
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
            render: (coupon) => (
                <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-[0.15em] border ${getStatusColor(coupon.status)}`}>
                    {coupon.status}
                </span>
            )
        },
        {
            header: 'Action',
            key: 'actions',
            align: 'right',
            render: (coupon) => (
                <div className="flex items-center justify-end gap-2">
                    <button
                        onClick={() => navigate(`/coupons/edit/${coupon._id}`)}
                        className="p-3 text-primary hover:bg-primary/5 rounded-2xl transition-all border border-transparent hover:border-primary/10 group"
                        title="Edit"
                    >
                        <Edit size={18} className="group-hover:scale-110 transition-transform" />
                    </button>
                    <button
                        onClick={() => handleDelete(coupon._id)}
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
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-[2rem] border border-primary/5 shadow-sm">
                <div>
                    <h1 className="text-3xl font-black text-primary tracking-tight uppercase font-mono">Coupons & Offers</h1>
                    <p className="text-sm text-gray-500 font-medium">Manage discount codes and promotional campaigns</p>
                </div>
                <Button
                    onClick={() => navigate('/coupons/new')}
                    className="rounded-2xl shadow-xl shadow-primary/20 h-14 px-8"
                >
                    <Plus size={20} className="mr-2" />
                    <span>Create New Coupon</span>
                </Button>
            </div>

            {/* Filters */}
            <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1 relative group">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-primary/40 group-focus-within:text-primary transition-colors" size={20} />
                    <input
                        type="text"
                        placeholder="Search by coupon code..."
                        value={search}
                        onChange={handleSearch}
                        className="w-full bg-white border-2 border-primary/5 rounded-3xl py-4 pl-12 pr-4 focus:outline-none focus:border-primary/20 transition-all font-bold text-gray-700 shadow-xl shadow-gray-100/50"
                    />
                </div>

                <div className="flex gap-3">
                    <div className="flex items-center gap-2 bg-white border-2 border-primary/5 rounded-3xl px-6 py-2 shadow-lg shadow-gray-100/50">
                        <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-1">Status</span>
                        <select
                            className="bg-transparent focus:outline-none font-black text-primary uppercase text-[10px] tracking-widest cursor-pointer"
                            value={status}
                            onChange={handleStatusFilter}
                        >
                            <option value="">All Statuses</option>
                            {Object.values(COUPON_STATUS).map(s => (
                                <option key={s} value={s}>{s}</option>
                            ))}
                        </select>
                    </div>

                    {(search || status) && (
                        <button
                            onClick={() => setSearchParams({ page: '1', limit: '10' })}
                            className="px-6 py-4 rounded-3xl bg-rose-50 border-2 border-rose-100 text-rose-500 hover:bg-rose-100 transition-all font-black uppercase text-[10px] tracking-widest flex items-center gap-2 shadow-xl shadow-gray-100/50"
                        >
                            <RotateCcw size={18} />
                            Reset
                        </button>
                    )}
                </div>
            </div>

            <Table
                data={coupons}
                columns={columns}
                isLoading={loading}
                keyExtractor={(coupon) => coupon._id}
                emptyMessage="No promotional codes found"
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
        </div>
    );
};

export default CouponList;
