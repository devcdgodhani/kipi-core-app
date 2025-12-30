import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import { couponService, type Coupon } from '../../../api/services/coupon.service';
import { Table, Button, type Column, Pagination } from '../../../components/common';
import { Plus, Edit2, Trash, RefreshCw, Copy } from 'lucide-react';
import { toast } from 'react-hot-toast';

const CouponList = () => {
    const navigate = useNavigate();
    const [coupons, setCoupons] = useState<Coupon[]>([]);
    const [loading, setLoading] = useState(false);
    const [totalRecords, setTotalRecords] = useState(0);
    const [page, setPage] = useState(1);
    const limit = 10;

    const fetchCoupons = async () => {
        setLoading(true);
        try {
            const res = await couponService.getWithPagination({ page, limit });
            setCoupons(res.data.recordList || []);
            setTotalRecords(res.data.totalRecords || 0);
        } catch (error) {
            console.error(error);
            toast.error('Failed to fetch coupons');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCoupons();
    }, [page]);

    const handleEdit = (coupon: Coupon) => {
        navigate(`/offers/coupons/${coupon._id}`);
    };

    const handleDelete = async (id: string) => {
        if (confirm('Are you sure you want to delete this coupon?')) {
            try {
                await couponService.delete(id);
                toast.success('Coupon deleted successfully');
                fetchCoupons();
            } catch (error) {
                console.error(error);
                toast.error('Failed to delete coupon');
            }
        }
    };

    const copyCode = (code: string) => {
        navigator.clipboard.writeText(code);
        toast.success('Code copied!');
    };

    const columns: Column<Coupon>[] = [
        {
            key: 'code',
            header: 'Code',
            width: '20%',
            render: (row) => (
                <div className="flex items-center gap-2 group cursor-pointer" onClick={() => copyCode(row.code)}>
                    <span className="font-mono font-bold text-blue-400 bg-blue-400/10 px-2 py-0.5 rounded border border-blue-400/20">
                        {row.code}
                    </span>
                    <Copy size={12} className="text-text-secondary opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
            )
        },
        {
            key: 'discountValue',
            header: 'Discount',
            width: '15%',
            render: (row) => (
                <span className="font-semibold text-text-primary">
                    {row.discountType === 'PERCENTAGE' ? `${row.discountValue}% OFF` :
                        row.discountType === 'FIXED_AMOUNT' ? `₹${row.discountValue} OFF` :
                            row.discountType === 'BOGO' ? 'BOGO' : 'Free Shipping'}
                </span>
            )
        },
        {
            key: 'applicability',
            header: 'Apply On',
            width: '15%',
            render: (row) => <span className="text-text-secondary capitalize">{row.applicability.replace('_', ' ').toLowerCase()}</span>
        },
        {
            key: 'isActive',
            header: 'Status',
            width: '10%',
            render: (row) => {
                const now = new Date();
                const start = row.startDate ? new Date(row.startDate) : null;
                const end = row.endDate ? new Date(row.endDate) : null;
                let status = row.isActive ? 'Active' : 'Inactive';
                let style = row.isActive ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400';

                // Check expiry logic visually
                if (row.isActive && end && end < now) {
                    status = 'Expired';
                    style = 'bg-yellow-500/10 text-yellow-400';
                } else if (row.isActive && start && start > now) {
                    status = 'Scheduled';
                    style = 'bg-blue-500/10 text-blue-400';
                }

                return (
                    <span className={`px-2 py-1 rounded text-xs font-bold ${style}`}>
                        {status}
                    </span>
                );
            }
        },
        {
            key: 'currentUsageCount',
            header: 'Used',
            width: '10%',
            render: (row) => <span>{row.currentUsageCount || 0}</span>
        },
        {
            key: 'actions',
            header: 'Actions',
            align: 'right',
            render: (row) => (
                <div className="flex justify-end gap-2" onClick={(e) => e.stopPropagation()}>
                    <button
                        onClick={() => handleEdit(row)}
                        className="p-1.5 text-blue-400 hover:bg-blue-400/10 rounded-lg transition-colors"
                    >
                        <Edit2 size={16} />
                    </button>
                    <button
                        onClick={() => handleDelete(row._id)}
                        className="p-1.5 text-red-400 hover:bg-red-400/10 rounded-lg transition-colors"
                    >
                        <Trash size={16} />
                    </button>
                </div>
            ),
        },
    ];

    return (
        <div className="p-6 space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-text-primary">Coupons & Offers</h1>
                    <p className="text-text-secondary text-sm">Create and manage discounts and promotional codes.</p>
                </div>
                <div className="flex gap-3">
                    <Button variant="secondary" onClick={() => fetchCoupons()} className="!p-2.5">
                        <RefreshCw size={18} />
                    </Button>
                    <Button onClick={() => navigate('/offers/coupons/create')} className="flex items-center gap-2">
                        <Plus size={18} /> Create Coupon
                    </Button>
                </div>
            </div>

            <Table<Coupon>
                data={coupons}
                columns={columns}
                isLoading={loading}
                emptyMessage="No coupons found."
                onRowClick={(row) => handleEdit(row)}
            />

            <Pagination
                currentPage={page}
                totalRecords={totalRecords}
                limit={limit}
                onPageChange={setPage}
            />
        </div>
    );
};

export default CouponList;
