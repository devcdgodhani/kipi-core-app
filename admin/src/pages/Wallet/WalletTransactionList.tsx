
import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import {
    History,
    ArrowUpRight,
    ArrowDownLeft,
    RotateCcw,
    ShieldCheck,
    User,
    X,
    Filter,
    Search
} from 'lucide-react';
import { walletService } from '../../services/wallet.service';
import { userService } from '../../services/user.service';
import { toast } from 'react-hot-toast';
import { format } from 'date-fns';
import { Table, type Column } from '../../components/common/Table';
import { CommonFilter, type FilterField } from '../../components/common/CommonFilter';

const WalletTransactionList = () => {
    const [searchParams, setSearchParams] = useSearchParams();
    const navigate = useNavigate();
    const [transactions, setTransactions] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [totalRecords, setTotalRecords] = useState(0);
    const [filteredUser, setFilteredUser] = useState<any>(null);
    const [isFilterOpen, setIsFilterOpen] = useState(false);

    const page = parseInt(searchParams.get('page') || '1');
    const limit = 10;
    const userId = searchParams.get('userId');
    const type = searchParams.get('transactionType');
    const source = searchParams.get('sourceType');

    const fetchFilteredUser = async (id: string) => {
        try {
            const response = await userService.getOne(id);
            if (response?.data) {
                setFilteredUser(response.data);
            }
        } catch (error) {
            console.error('Error fetching filtered user:', error);
        }
    };

    const fetchTransactions = async () => {
        try {
            setLoading(true);
            const filter: any = {};
            if (userId) filter.userId = userId;
            if (type) filter.transactionType = type;
            if (source) filter.sourceType = source;

            const response = await walletService.getTransactions({
                page,
                limit,
                filter,
                sort: { createdAt: -1 }
            });

            const data = response?.data || response;
            if (data) {
                setTransactions(data.recordList || []);
                setTotalRecords(data.totalRecords || 0);
            }
        } catch (error) {
            console.error('Error fetching wallet transactions:', error);
            toast.error('Failed to fetch transactions');
        } finally {
            setLoading(false);
            if (!userId) setFilteredUser(null);
        }
    };

    useEffect(() => {
        fetchTransactions();
        if (userId) {
            fetchFilteredUser(userId);
        }
    }, [page, userId, type, source]);

    const handleApplyFilters = (filters: Record<string, any>) => {
        setSearchParams(prev => {
            const newParams = new URLSearchParams(prev);
            newParams.set('page', '1');

            if (filters.transactionType) newParams.set('transactionType', filters.transactionType);
            else newParams.delete('transactionType');

            if (filters.sourceType) newParams.set('sourceType', filters.sourceType);
            else newParams.delete('sourceType');

            return newParams;
        });
    };

    const handleReset = () => {
        setSearchParams({});
    };

    const removeUserFilter = () => {
        setSearchParams(prev => {
            prev.delete('userId');
            prev.set('page', '1');
            return prev;
        });
    };

    const filterFields: FilterField[] = [
        {
            key: 'transactionType',
            label: 'Transaction Type',
            type: 'select',
            options: [
                { label: 'Credit (In)', value: 'CREDIT' },
                { label: 'Debit (Out)', value: 'DEBIT' }
            ]
        },
        {
            key: 'sourceType',
            label: 'Source',
            type: 'select',
            options: [
                { label: 'Order Payment', value: 'ORDER_PAYMENT' },
                { label: 'Order Refund', value: 'ORDER_REFUND' },
                { label: 'Cashback', value: 'CASHBACK' },
                { label: 'Referral Bonus', value: 'REFERRAL_BONUS' },
                { label: 'Manual Adjustment', value: 'MANUAL_ADJUSTMENT' },
                { label: 'Signup Bonus', value: 'SIGNUP_BONUS' }
            ]
        }
    ];

    const currentFilters = {
        transactionType: type,
        sourceType: source
    };

    const columns: Column<any>[] = [
        {
            header: 'Timestamp',
            render: (tx) => (
                <div className="flex flex-col py-1">
                    <span className="text-xs font-black text-gray-900 uppercase tracking-tight">
                        {format(new Date(tx.createdAt), 'dd MMM, yyyy')}
                    </span>
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-0.5">
                        {format(new Date(tx.createdAt), 'HH:mm:ss')}
                    </span>
                </div>
            )
        },
        {
            header: 'User',
            render: (tx) => (
                <div
                    className="flex items-center gap-3 cursor-pointer group"
                    onClick={() => navigate(`/users/edit/${tx.userId}`)}
                >
                    <div className="w-8 h-8 rounded-xl bg-gray-50 flex items-center justify-center text-gray-400 group-hover:bg-primary/10 group-hover:text-primary transition-colors border border-gray-100">
                        {tx.user?.firstName?.charAt(0) || 'U'}
                    </div>
                    <div className="flex flex-col">
                        <span className="text-xs font-bold text-gray-900 group-hover:text-primary transition-colors">
                            {tx.user?.firstName} {tx.user?.lastName}
                        </span>
                        <span className="text-[9px] font-black text-gray-400 uppercase tracking-tighter">
                            {tx.user?.email}
                        </span>
                    </div>
                </div>
            )
        },
        {
            header: 'Activity',
            render: (tx) => (
                <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-xl flex items-center justify-center shadow-sm ${tx.transactionType === 'CREDIT' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'
                        }`}>
                        {tx.transactionType === 'CREDIT' ? <ArrowUpRight size={14} /> : <ArrowDownLeft size={14} />}
                    </div>
                    <div className="flex flex-col">
                        <span className="text-[10px] font-black text-gray-900 uppercase tracking-widest leading-none">
                            {tx.sourceType?.replace(/_/g, ' ')}
                        </span>
                        <span className="text-[9px] font-bold text-gray-400 uppercase tracking-tighter mt-1 truncate max-w-[200px]">
                            {tx.description || 'System generated entry'}
                        </span>
                    </div>
                </div>
            )
        },
        {
            header: 'Amount',
            render: (tx) => (
                <span className={`text-sm font-black ${tx.transactionType === 'CREDIT' ? 'text-green-600' : 'text-red-600'
                    }`}>
                    {tx.transactionType === 'CREDIT' ? '+' : '-'}₹{tx.amount.toFixed(2)}
                </span>
            )
        },
        {
            header: 'Expiry Date',
            render: (tx) => (
                <div className="flex flex-col py-1">
                    {tx.transactionType === 'CREDIT' && tx.expiryDate ? (
                        <>
                            <span className="text-xs font-black text-amber-600 uppercase tracking-tight">
                                {format(new Date(tx.expiryDate), 'dd MMM, yyyy')}
                            </span>
                            <span className="text-[10px] font-bold text-amber-400 uppercase tracking-widest mt-0.5">
                                Valid until
                            </span>
                        </>
                    ) : (
                        <span className="text-[10px] font-bold text-gray-300 uppercase tracking-widest">
                            N/A
                        </span>
                    )}
                </div>
            )
        },
        {
            header: 'Status',
            render: (tx) => (
                <span className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest border ${tx.status === 'COMPLETED' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' :
                    tx.status === 'PENDING' ? 'bg-amber-50 text-amber-600 border-amber-100' :
                        'bg-gray-50 text-gray-400 border-gray-100'
                    }`}>
                    {tx.status}
                </span>
            )
        }
    ];

    return (
        <div className="p-6 space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-white p-8 rounded-[2.5rem] border border-primary/5 shadow-sm relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full -mr-32 -mt-32 blur-3xl group-hover:bg-primary/10 transition-colors duration-1000" />
                <div className="relative z-10 flex items-center gap-6">
                    <div className="w-16 h-16 rounded-[1.5rem] bg-indigo-500 flex items-center justify-center text-white shadow-xl shadow-indigo-500/20">
                        <History size={32} />
                    </div>
                    <div>
                        <h1 className="text-3xl font-black text-primary tracking-tight uppercase font-mono">Wallet Audit Trail</h1>
                        <p className="text-sm text-gray-500 font-medium">Comprehensive transaction history and logs</p>
                    </div>
                </div>
            </div>

            <div className="flex flex-col xl:flex-row gap-4 items-center">
                <div className="flex-1 w-full xl:w-auto">
                    {/* Placeholder for future search if needed, or just filler to push filters right */}
                    {filteredUser && (
                        <div className="flex items-center gap-3 bg-white border-2 border-primary/5 rounded-[2rem] px-6 h-16 shadow-xl shadow-gray-100/50 w-fit animate-in fade-in slide-in-from-left-4">
                            <div className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                                <User size={16} />
                            </div>
                            <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">
                                Filtering: <span className="text-primary">{filteredUser.firstName} {filteredUser.lastName}</span>
                            </span>
                            <button
                                onClick={removeUserFilter}
                                className="p-2 hover:bg-rose-50 text-gray-400 hover:text-rose-500 rounded-xl transition-all ml-2"
                            >
                                <X size={14} />
                            </button>
                        </div>
                    )}
                </div>

                <div className="flex flex-wrap gap-3 w-full xl:w-auto h-full items-center">
                    <button
                        onClick={() => setIsFilterOpen(true)}
                        className={`px-8 h-16 rounded-[2rem] border-2 transition-all font-black uppercase text-[10px] tracking-widest flex items-center gap-2 shadow-xl ${(type || source)
                                ? 'bg-primary text-white border-primary shadow-primary/20 hover:bg-primary/90'
                                : 'bg-white border-primary/5 text-gray-400 hover:border-primary/20 hover:text-primary shadow-gray-100/50'
                            }`}
                    >
                        <Filter size={18} />
                        {(type || source) ? 'Filters Active' : 'Filter Data'}
                    </button>

                    {(userId || type || source) && (
                        <button
                            onClick={handleReset}
                            className="px-8 h-16 rounded-[2rem] bg-rose-50 border-2 border-rose-100 text-rose-500 hover:bg-rose-100 transition-all font-black uppercase text-[10px] tracking-widest flex items-center gap-2 shadow-xl shadow-rose-100/50"
                        >
                            <RotateCcw size={18} />
                            Reset Hub
                        </button>
                    )}
                </div>
            </div>

            <Table
                data={transactions}
                columns={columns}
                isLoading={loading}
                keyExtractor={(item) => item._id}
                emptyMessage="No transaction entries discovered in this partition"
                pagination={totalRecords > 0 ? {
                    currentPage: page,
                    totalPages: Math.ceil(totalRecords / limit),
                    totalRecords: totalRecords,
                    pageSize: limit,
                    onPageChange: (p) => setSearchParams(prev => { prev.set('page', p.toString()); return prev; }),
                    hasPreviousPage: page > 1,
                    hasNextPage: page < Math.ceil(totalRecords / limit)
                } : undefined}
            />

            <CommonFilter
                isOpen={isFilterOpen}
                onClose={() => setIsFilterOpen(false)}
                fields={filterFields}
                onApply={handleApplyFilters}
                currentFilters={currentFilters}
            />
        </div>
    );
};

export default WalletTransactionList;
