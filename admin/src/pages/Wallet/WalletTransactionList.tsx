import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import {
    History,
    ArrowUpRight,
    ArrowDownLeft,
    RotateCcw,
    ShieldCheck,
    User,
    X
} from 'lucide-react';
import { walletService } from '../../services/wallet.service';
import { userService } from '../../services/user.service';
import { toast } from 'react-hot-toast';
import { format } from 'date-fns';
import { Table, type Column } from '../../components/common/Table';

const WalletTransactionList = () => {
    const [searchParams, setSearchParams] = useSearchParams();
    const navigate = useNavigate();
    const [transactions, setTransactions] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [totalRecords, setTotalRecords] = useState(0);
    const [filteredUser, setFilteredUser] = useState<any>(null);

    const page = parseInt(searchParams.get('page') || '1');
    const limit = 10;
    const userId = searchParams.get('userId');
    const type = searchParams.get('type');
    const source = searchParams.get('source');

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
        }
    };

    useEffect(() => {
        fetchTransactions();
        if (userId) {
            fetchFilteredUser(userId);
        } else {
            setFilteredUser(null);
        }
    }, [page, userId, type, source]);

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
                            {tx.sourceType}
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
            header: 'Audit ID',
            render: (tx) => (
                <span className="px-2 py-0.5 bg-gray-50 text-gray-500 rounded-md text-[8px] font-black uppercase tracking-tighter border border-gray-200 font-mono">
                    {tx._id.slice(-10)}
                </span>
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
        <div className="p-8 max-w-[1600px] mx-auto space-y-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="flex items-center gap-6">
                    <div className="w-16 h-16 rounded-[1.5rem] bg-indigo-500 flex items-center justify-center text-white shadow-xl shadow-indigo-500/20">
                        <History size={32} />
                    </div>
                    <div className="space-y-1">
                        <h1 className="text-4xl font-black text-primary tracking-tighter uppercase font-mono">Wallet Audit Trail</h1>
                        <div className="flex items-center gap-3">
                            <p className="text-gray-400 font-bold uppercase tracking-[0.2em] text-[10px] flex items-center gap-2">
                                <ShieldCheck size={14} className="text-primary" />
                                Comprehensive transaction history
                            </p>
                            {filteredUser && (
                                <div className="flex items-center gap-2 bg-primary/10 text-primary px-3 py-1 rounded-full border border-primary/20">
                                    <User size={12} />
                                    <span className="text-[10px] font-black uppercase tracking-widest leading-none">
                                        Filtering: {filteredUser.firstName} {filteredUser.lastName}
                                    </span>
                                    <button
                                        onClick={removeUserFilter}
                                        className="hover:scale-110 transition-transform"
                                    >
                                        <X size={12} />
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <select
                        className="h-14 px-6 rounded-2xl bg-white border-2 border-primary/5 text-[10px] font-black uppercase tracking-widest text-gray-600 focus:outline-none focus:border-primary/20 transition-all shadow-sm"
                        value={type || ''}
                        onChange={(e) => setSearchParams(prev => {
                            if (e.target.value) prev.set('type', e.target.value);
                            else prev.delete('type');
                            prev.set('page', '1');
                            return prev;
                        })}
                    >
                        <option value="">All Types</option>
                        <option value="CREDIT">Credits Only</option>
                        <option value="DEBIT">Debits Only</option>
                    </select>

                    {(userId || type || source) && (
                        <button
                            onClick={handleReset}
                            className="h-14 px-8 rounded-2xl bg-rose-50 border-2 border-rose-100 text-rose-500 hover:bg-rose-100 transition-all font-black uppercase text-[10px] tracking-widest flex items-center gap-2 shadow-xl shadow-rose-100/50"
                        >
                            <RotateCcw size={16} />
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
                pagination={{
                    currentPage: page,
                    totalPages: Math.ceil(totalRecords / limit),
                    totalRecords: totalRecords,
                    pageSize: limit,
                    onPageChange: (p) => setSearchParams(prev => { prev.set('page', p.toString()); return prev; }),
                    hasPreviousPage: page > 1,
                    hasNextPage: page < Math.ceil(totalRecords / limit)
                }}
            />
        </div>
    );
};

export default WalletTransactionList;
