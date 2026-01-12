
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Plus,
    Edit2,
    Trash2,
    Play,
    Square,
    CheckCircle2,
    Calendar,
    Clock
} from 'lucide-react';
import { walletService } from '../../services/wallet.service';
import { toast } from 'react-hot-toast';
import { format } from 'date-fns';
import Button from '../../components/common/Button';
import { Table, type Column } from '../../components/common/Table';

const WalletRuleList = () => {
    const navigate = useNavigate();
    const [rules, setRules] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [page, setPage] = useState(1);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [totalRecords, setTotalRecords] = useState(0);

    const fetchRules = async () => {
        try {
            setLoading(true);
            const payload = {
                page: page,
                limit: rowsPerPage,
                filter: {}
            };

            const response = await walletService.getRules(payload);
            const data = response?.data || response;
            if (data) {
                setRules(data.recordList || []);
                setTotalRecords(data.totalRecords || 0);
            }
        } catch (error) {
            console.error('Error fetching wallet rules:', error);
            toast.error('Failed to fetch wallet rules');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchRules();
    }, [page, rowsPerPage]);

    const handleActivate = async (id: string, e: React.MouseEvent) => {
        e.stopPropagation();
        try {
            await walletService.activateRule(id);
            toast.success('Rule activated successfully');
            fetchRules();
        } catch (error) {
            toast.error('Failed to activate rule');
        }
    };

    const handleDeactivate = async (id: string, e: React.MouseEvent) => {
        e.stopPropagation();
        try {
            await walletService.deactivateRule(id);
            toast.success('Rule deactivated successfully');
            fetchRules();
        } catch (error) {
            toast.error('Failed to deactivate rule');
        }
    };

    const handleDelete = async (id: string, e: React.MouseEvent) => {
        e.stopPropagation();
        if (confirm('Are you sure you want to delete this rule?')) {
            try {
                await walletService.deleteRule({ _id: id });
                toast.success('Rule deleted successfully');
                fetchRules();
            } catch (error) {
                toast.error('Failed to delete rule');
            }
        }
    };

    const getStatusStyles = (status: string) => {
        switch (status) {
            case 'ACTIVE': return 'bg-emerald-50 text-emerald-600 border-emerald-100';
            case 'INACTIVE': return 'bg-gray-50 text-gray-500 border-gray-100';
            case 'EXPIRED': return 'bg-rose-50 text-rose-500 border-rose-100';
            case 'SCHEDULED': return 'bg-amber-50 text-amber-600 border-amber-100';
            default: return 'bg-gray-50 text-gray-500 border-gray-100';
        }
    };

    const columns: Column<any>[] = [
        {
            header: 'Rule Info',
            render: (rule) => (
                <div className="flex flex-col py-1">
                    <span className="font-bold text-gray-900">{rule.name}</span>
                    <span className="text-[10px] text-gray-400 font-medium uppercase tracking-widest mt-0.5 truncate max-w-[200px]">
                        {rule.description || 'No description'}
                    </span>
                </div>
            )
        },
        {
            header: 'Type',
            render: (rule) => (
                <span className="px-3 py-1 bg-gray-50 text-gray-600 rounded-lg text-[10px] font-black uppercase tracking-widest border border-gray-100">
                    {rule.ruleType}
                </span>
            )
        },
        {
            header: 'Benefit',
            render: (rule) => (
                <div className="flex flex-col">
                    <span className="text-sm font-black text-primary">
                        {rule.valueType === 'PERCENTAGE' ? `${rule.value}%` : `₹${rule.value}`}
                    </span>
                    {rule.maxCashbackAmount > 0 && (
                        <span className="text-[9px] text-gray-400 font-bold uppercase tracking-wider">
                            Max: ₹{rule.maxCashbackAmount}
                        </span>
                    )}
                </div>
            )
        },
        {
            header: 'Validity',
            render: (rule) => (
                <div className="space-y-1">
                    <div className="flex items-center gap-1.5 text-[10px] text-gray-400 font-bold uppercase">
                        <Calendar size={10} className="text-gray-300" />
                        <span>{rule.startDate ? format(new Date(rule.startDate), 'dd MMM yyyy') : 'Immediate'}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-[10px] text-gray-400 font-bold uppercase">
                        <Clock size={10} className="text-gray-300" />
                        <span>{rule.endDate ? format(new Date(rule.endDate), 'dd MMM yyyy') : 'Forevers'}</span>
                    </div>
                </div>
            )
        },
        {
            header: 'Status',
            render: (rule) => (
                <span className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest border ${getStatusStyles(rule.status)}`}>
                    {rule.status}
                </span>
            )
        },
        {
            header: 'Priority',
            align: 'center',
            render: (rule) => (
                <span className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center text-xs font-black text-gray-400 border border-gray-100">
                    {rule.priority}
                </span>
            )
        },
        {
            header: 'Actions',
            align: 'right',
            render: (rule) => (
                <div className="flex items-center justify-end gap-2">
                    {rule.status === 'ACTIVE' ? (
                        <button
                            onClick={(e) => handleDeactivate(rule._id, e)}
                            className="p-2 bg-amber-50 text-amber-600 rounded-xl hover:bg-amber-100 transition-colors border border-amber-100"
                            title="Deactivate"
                        >
                            <Square size={16} fill="currentColor" />
                        </button>
                    ) : (
                        <button
                            onClick={(e) => handleActivate(rule._id, e)}
                            className="p-2 bg-emerald-50 text-emerald-600 rounded-xl hover:bg-emerald-100 transition-colors border border-emerald-100"
                            title="Activate"
                        >
                            <Play size={16} fill="currentColor" />
                        </button>
                    )}
                    <button
                        onClick={(e) => { e.stopPropagation(); navigate(`/wallet/rules/edit/${rule._id}`); }}
                        className="p-2 bg-blue-50 text-blue-600 rounded-xl hover:bg-blue-100 transition-colors border border-blue-100"
                        title="Edit"
                    >
                        <Edit2 size={16} />
                    </button>
                    <button
                        onClick={(e) => handleDelete(rule._id, e)}
                        className="p-2 bg-red-50 text-red-600 rounded-xl hover:bg-red-100 transition-colors border border-red-100"
                        title="Delete"
                    >
                        <Trash2 size={16} />
                    </button>
                </div>
            )
        }
    ];

    return (
        <div className="p-6 space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-white p-8 rounded-[2.5rem] border border-primary/5 shadow-sm relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full -mr-32 -mt-32 blur-3xl group-hover:bg-primary/10 transition-colors duration-1000" />
                <div className="relative z-10 flex items-center gap-6">
                    <div className="w-16 h-16 rounded-[1.5rem] bg-indigo-500 flex items-center justify-center text-white shadow-xl shadow-indigo-500/20">
                        <CheckCircle2 size={32} />
                    </div>
                    <div>
                        <h1 className="text-3xl font-black text-primary tracking-tight uppercase font-mono">Wallet Rules</h1>
                        <p className="text-sm text-gray-500 font-medium">Manage rewards and cashback policies</p>
                    </div>
                </div>
                <Button
                    onClick={() => navigate('/wallet/rules/create')}
                    className="rounded-2xl shadow-xl shadow-primary/20 h-14 px-8 relative z-10"
                >
                    <Plus size={20} className="mr-2" />
                    <span>Create Rule</span>
                </Button>
            </div>

            <Table
                data={rules}
                columns={columns}
                isLoading={loading}
                keyExtractor={(item) => item._id}
                onRowClick={(item) => navigate(`/wallet/rules/edit/${item._id}`)}
                emptyMessage="No wallet rules defined"
                pagination={totalRecords > 0 ? {
                    currentPage: page,
                    totalPages: Math.ceil(totalRecords / rowsPerPage),
                    totalRecords: totalRecords,
                    pageSize: rowsPerPage,
                    onPageChange: setPage,
                    hasPreviousPage: page > 1,
                    hasNextPage: page < Math.ceil(totalRecords / rowsPerPage)
                } : undefined}
            />
        </div>
    );
};

export default WalletRuleList;
