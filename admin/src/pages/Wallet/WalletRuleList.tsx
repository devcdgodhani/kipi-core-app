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
            case 'ACTIVE': return 'bg-green-50 text-green-600 border-green-100';
            case 'INACTIVE': return 'bg-gray-50 text-gray-500 border-gray-100';
            case 'EXPIRED': return 'bg-red-50 text-red-600 border-red-100';
            case 'SCHEDULED': return 'bg-amber-50 text-amber-600 border-amber-100';
            default: return 'bg-gray-50 text-gray-500 border-gray-100';
        }
    };

    const columns: Column<any>[] = [
        {
            header: 'Rule Info',
            render: (rule) => (
                <div className="flex flex-col">
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
                <span className="px-3 py-1 bg-gray-100 text-gray-600 rounded-lg text-[10px] font-black uppercase tracking-widest border border-gray-200">
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
                            className="p-2 bg-green-50 text-green-600 rounded-xl hover:bg-green-100 transition-colors border border-green-100"
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
        <div className="p-8 max-w-[1600px] mx-auto space-y-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h1 className="text-4xl font-black text-gray-900 uppercase tracking-tighter">Wallet Rules</h1>
                    <p className="text-gray-400 font-bold uppercase tracking-[0.2em] text-[10px] mt-2 flex items-center gap-2">
                        <CheckCircle2 size={14} className="text-primary" />
                        Manage rewards and cashback policies
                    </p>
                </div>
                <Button
                    onClick={() => navigate('/wallet/rules/create')}
                    className="h-14 px-8 rounded-2xl bg-gray-900 hover:bg-black text-white shadow-2xl shadow-gray-200 transition-all flex items-center gap-3"
                >
                    <Plus size={20} />
                    <span className="font-black uppercase tracking-widest text-xs">Create Rule</span>
                </Button>
            </div>

            <Table
                data={rules}
                columns={columns}
                isLoading={loading}
                keyExtractor={(item) => item._id}
                onRowClick={(item) => navigate(`/wallet/rules/edit/${item._id}`)}
                pagination={{
                    currentPage: page,
                    totalPages: Math.ceil(totalRecords / rowsPerPage),
                    totalRecords: totalRecords,
                    pageSize: rowsPerPage,
                    onPageChange: setPage,
                    hasPreviousPage: page > 1,
                    hasNextPage: page < Math.ceil(totalRecords / rowsPerPage)
                }}
            />
        </div>
    );
};

export default WalletRuleList;
