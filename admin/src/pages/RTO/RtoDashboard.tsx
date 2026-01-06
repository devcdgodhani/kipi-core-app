import React, { useState, useEffect } from 'react';
import rtoService from '../../services/rtoService';
import type { IRtoScore, IRtoStats } from '../../types/rto.types';
import { RTO_RISK_LEVEL } from '../../types/rto.types';
import {
    AlertTriangle, ShieldAlert, TrendingDown, RefreshCw,
    Search, Filter, Activity, ShieldCheck, Zap,
    MapPin, User, DollarSign, Clock
} from 'lucide-react';
import { useSearchParams } from 'react-router-dom';
import { Table, type Column } from '../../components/common/Table';
import { CommonFilter, type FilterField } from '../../components/common/CommonFilter';
import CustomButton from '../../components/common/Button';
import { toast } from 'react-hot-toast';

const filterFields: FilterField[] = [
    {
        key: 'riskLevel',
        label: 'Risk Level',
        type: 'select',
        options: [
            { label: 'Low', value: 'LOW' },
            { label: 'Medium', value: 'MEDIUM' },
            { label: 'High', value: 'HIGH' },
            { label: 'Critical', value: 'CRITICAL' }
        ]
    },
    {
        key: 'suggestedAction',
        label: 'Suggested Action',
        type: 'select',
        options: [
            { label: 'Allow', value: 'ALLOW' },
            { label: 'Flag', value: 'FLAG' },
            { label: 'Block COD', value: 'BLOCK_COD' }
        ]
    }
];

const riskStyles: Record<string, { icon: any, color: string, bg: string, border: string }> = {
    [RTO_RISK_LEVEL.CRITICAL]: { icon: ShieldAlert, color: 'text-rose-600', bg: 'bg-rose-50', border: 'border-rose-200' },
    [RTO_RISK_LEVEL.HIGH]: { icon: AlertTriangle, color: 'text-orange-600', bg: 'bg-orange-50', border: 'border-orange-200' },
    [RTO_RISK_LEVEL.MEDIUM]: { icon: Activity, color: 'text-amber-600', bg: 'bg-amber-50', border: 'border-amber-200' },
    [RTO_RISK_LEVEL.LOW]: { icon: ShieldCheck, color: 'text-emerald-600', bg: 'bg-emerald-50', border: 'border-emerald-200' }
};

const RtoDashboard = () => {
    const [stats, setStats] = useState<IRtoStats | null>(null);
    const [scores, setScores] = useState<IRtoScore[]>([]);
    const [loading, setLoading] = useState(true);
    const [totalRecords, setTotalRecords] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const [isFilterOpen, setIsFilterOpen] = useState(false);

    const [searchParams, setSearchParams] = useSearchParams();
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const search = searchParams.get('search') || '';

    const fetchDashboardData = async () => {
        try {
            setLoading(true);
            const filters = {
                page,
                limit,
                search,
                riskLevel: searchParams.get('riskLevel'),
                suggestedAction: searchParams.get('suggestedAction')
            };

            const response = await rtoService.getWithPagination(filters);
            if (response && response.data) {
                setScores(response.data.recordList);
                setTotalRecords(response.data.totalRecords);
                setTotalPages(response.data.totalPages);
            }

            // Mock stats for now or implement backend stats endpoint
            setStats({
                totalRtoConfigured: 4,
                highRiskOrders: response?.data?.totalRecords || 0,
                rtoRate: 12.4,
                criticalRisks: 5
            });
        } catch (err) {
            console.error('RTO Dashboard Error:', err);
            toast.error('Failed to sync RTO intelligence');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDashboardData();
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

    const columns: Column<IRtoScore>[] = [
        {
            header: 'Risk Score & Level',
            key: 'riskScore',
            render: (score) => {
                const style = riskStyles[score.riskLevel] || riskStyles[RTO_RISK_LEVEL.LOW];
                return (
                    <div className="flex items-center gap-4">
                        <div className={`w-12 h-12 rounded-2xl ${style.bg} flex items-center justify-center ${style.color} border ${style.border} shadow-sm relative overflow-hidden group`}>
                            <div className="absolute inset-0 bg-white/40 translate-y-full group-hover:translate-y-0 transition-transform duration-500" />
                            <style.icon size={24} className="relative z-10" />
                        </div>
                        <div className="flex flex-col">
                            <div className="flex items-center gap-2">
                                <span className={`text-base font-black ${style.color}`}>{score.riskScore}%</span>
                                <span className={`text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full ${style.bg} ${style.color} border ${style.border}`}>
                                    {score.riskLevel}
                                </span>
                            </div>
                            <span className="text-[10px] font-bold text-gray-400 mt-1 uppercase tracking-tight italic">
                                Result: {score.suggestedAction}
                            </span>
                        </div>
                    </div>
                );
            }
        },
        {
            header: 'Customer Identity',
            key: 'customerId',
            render: (score) => (
                <div className="flex flex-col">
                    <span className="font-black text-gray-900 text-xs">
                        {score.customerId?.firstName} {score.customerId?.lastName}
                    </span>
                    <span className="text-[10px] font-bold text-gray-400 mt-0.5 lowercase tracking-tight">
                        {score.customerId?.email}
                    </span>
                </div>
            )
        },
        {
            header: 'Neural Factors',
            key: 'factors',
            render: (score) => (
                <div className="grid grid-cols-2 gap-x-4 gap-y-1">
                    <div className="flex items-center gap-1.5 min-w-[80px]">
                        <User size={10} className="text-gray-400" />
                        <span className="text-[9px] font-bold text-gray-500 uppercase">History:</span>
                        <span className={`text-[9px] font-black ${score.factors.customerHistory > 50 ? 'text-rose-500' : 'text-emerald-500'}`}>{score.factors.customerHistory}</span>
                    </div>
                    <div className="flex items-center gap-1.5 min-w-[80px]">
                        <MapPin size={10} className="text-gray-400" />
                        <span className="text-[9px] font-bold text-gray-500 uppercase">Zone:</span>
                        <span className={`text-[9px] font-black ${score.factors.pincodeRisk > 50 ? 'text-rose-500' : 'text-emerald-500'}`}>{score.factors.pincodeRisk}</span>
                    </div>
                    <div className="flex items-center gap-1.5 min-w-[80px]">
                        <DollarSign size={10} className="text-gray-400" />
                        <span className="text-[9px] font-bold text-gray-500 uppercase">Value:</span>
                        <span className={`text-[9px] font-black ${score.factors.orderValueRisk > 50 ? 'text-rose-500' : 'text-emerald-500'}`}>{score.factors.orderValueRisk}</span>
                    </div>
                    <div className="flex items-center gap-1.5 min-w-[80px]">
                        <Clock size={10} className="text-gray-400" />
                        <span className="text-[9px] font-bold text-gray-500 uppercase">Age:</span>
                        <span className={`text-[9px] font-black ${score.factors.accountAgeRisk > 50 ? 'text-rose-500' : 'text-emerald-500'}`}>{score.factors.accountAgeRisk}</span>
                    </div>
                </div>
            )
        },
        {
            header: 'Reference Order',
            key: 'orderId',
            render: (score) => (
                <div className="flex items-center gap-2 text-primary font-black text-[10px] uppercase tracking-wider bg-primary/5 px-2 py-1 rounded-lg border border-primary/10 w-fit">
                    <Zap size={12} className="text-primary/60" />
                    {score.orderId?.orderNumber || 'PRE-CHECK'}
                </div>
            )
        }
    ];

    return (
        <div className="p-6 space-y-6 flex flex-col h-full bg-gray-50/50 animate-in fade-in duration-500 overflow-hidden">
            {/* Premium Intelligence Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-white p-8 rounded-[2.5rem] border border-primary/5 shadow-sm relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-80 h-80 bg-rose-500/5 rounded-full -mr-40 -mt-40 blur-3xl group-hover:bg-rose-500/10 transition-colors duration-1000" />
                <div className="relative z-10 flex items-center gap-6">
                    <div className="w-16 h-16 rounded-[1.5rem] bg-rose-500 flex items-center justify-center text-white shadow-xl shadow-rose-500/20">
                        <ShieldAlert size={32} />
                    </div>
                    <div className="flex flex-col min-w-0">
                        <h1 className="text-3xl font-black text-primary tracking-tight uppercase font-mono truncate">RTO Engine</h1>
                        <p className="text-sm text-gray-500 font-medium truncate">Pre-emptive risk scoring and fraud detection</p>
                    </div>
                </div>
                <div className="flex items-center gap-3 relative z-10">
                    <div className="hidden lg:flex flex-col items-end mr-6 text-right border-r border-gray-100 pr-6">
                        <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Risk Profile Sync</span>
                        <span className="text-[10px] font-black text-emerald-500 flex items-center gap-1 uppercase tracking-widest">
                            Active Monitoring <Zap size={10} className="fill-current" />
                        </span>
                    </div>
                    <CustomButton
                        onClick={fetchDashboardData}
                        className="bg-gray-50 text-gray-600 hover:bg-gray-100 shadow-none border border-gray-200 h-14 w-14 p-0 rounded-2xl flex items-center justify-center transition-all active:scale-95"
                    >
                        <RefreshCw size={20} className={loading ? 'animate-spin' : ''} />
                    </CustomButton>
                </div>
            </div>

            {/* Metrics Dashboard */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="bg-white p-6 rounded-[2rem] border border-primary/5 shadow-sm">
                    <div className="flex justify-between items-start mb-4">
                        <div className="w-10 h-10 rounded-xl bg-rose-50 flex items-center justify-center text-rose-500">
                            <TrendingDown size={20} />
                        </div>
                        <span className="text-[10px] font-black text-rose-500 bg-rose-50 px-2 py-0.5 rounded-full">+1.2%</span>
                    </div>
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">RTO Probability</p>
                    <h3 className="text-2xl font-black text-gray-900 mt-1 font-mono">{stats?.rtoRate}%</h3>
                </div>

                <div className="bg-white p-6 rounded-[2rem] border border-primary/5 shadow-sm">
                    <div className="flex justify-between items-start mb-4">
                        <div className="w-10 h-10 rounded-xl bg-orange-50 flex items-center justify-center text-orange-500">
                            <ShieldAlert size={20} />
                        </div>
                        <span className="text-[10px] font-black text-orange-500 bg-orange-50 px-2 py-0.5 rounded-full">Alert</span>
                    </div>
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">High Risk Logs</p>
                    <h3 className="text-2xl font-black text-gray-900 mt-1 font-mono">{stats?.highRiskOrders}</h3>
                </div>

                <div className="bg-white p-6 rounded-[2rem] border border-primary/5 shadow-sm">
                    <div className="flex justify-between items-start mb-4">
                        <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-500">
                            <Activity size={20} />
                        </div>
                    </div>
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Active NDRs</p>
                    <h3 className="text-2xl font-black text-gray-900 mt-1 font-mono">18</h3>
                </div>

                <div className="bg-white p-6 rounded-[2rem] border border-primary/5 shadow-sm">
                    <div className="flex justify-between items-start mb-4">
                        <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-500">
                            <ShieldCheck size={20} />
                        </div>
                    </div>
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Safe Deliveries</p>
                    <h3 className="text-2xl font-black text-gray-900 mt-1 font-mono">142</h3>
                </div>
            </div>

            {/* Neural Control Bar */}
            <div className="bg-white p-4 rounded-[2rem] shadow-sm border border-primary/5 flex flex-col md:flex-row items-center justify-between gap-4">
                <div className="relative w-full md:w-96 group">
                    <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-primary/40 group-focus-within:text-primary transition-colors duration-300" size={22} />
                    <input
                        type="text"
                        placeholder="Scan risk logs by customer or order..."
                        className="w-full pl-14 pr-6 py-4 bg-gray-50/50 border-2 border-transparent focus:bg-white focus:border-primary/20 rounded-[1.5rem] outline-none transition-all font-bold text-gray-700 h-14"
                        onChange={handleSearch}
                        value={search}
                    />
                </div>

                <div className="flex items-center gap-3">
                    <button
                        onClick={() => setIsFilterOpen(true)}
                        className={`flex items-center gap-2 px-6 h-14 rounded-2xl font-black uppercase text-[10px] tracking-widest transition-all ${searchParams.get('riskLevel') || searchParams.get('suggestedAction')
                            ? 'bg-primary/10 text-primary border-2 border-primary/20 shadow-lg shadow-primary/5'
                            : 'bg-white text-gray-500 border-2 border-gray-100 hover:bg-gray-50'
                            }`}
                    >
                        <Filter size={18} />
                        Risk Triage
                    </button>

                    <CustomButton
                        onClick={() => setSearchParams({})}
                        className="h-14 px-6 bg-gray-50 text-gray-400 hover:bg-gray-100 rounded-2xl border border-gray-200 shadow-none font-black uppercase text-[10px] tracking-widest"
                    >
                        Clear Matrix
                    </CustomButton>
                </div>
            </div>

            {/* Data Grid */}
            <div className="flex-1 min-h-0 bg-white rounded-[2.5rem] border border-primary/5 shadow-sm overflow-hidden flex flex-col">
                <Table
                    columns={columns}
                    data={scores}
                    isLoading={loading}
                    keyExtractor={(item) => item._id}
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
        </div>
    );
};

export default RtoDashboard;
