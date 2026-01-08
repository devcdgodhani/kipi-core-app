import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
    CreditCard,
    Search,
    Filter,
    Settings,
    XCircle,
    CheckCircle2,
    RotateCcw,
    AlertCircle
} from 'lucide-react';
import { paymentService } from '../../services/paymentService';
import type { PaymentGateway } from '../../types/payment';
import toast from 'react-hot-toast';
import { Table, type Column } from '../../components/common/Table';
import { CommonFilter, type FilterField } from '../../components/common/CommonFilter';
import { PopupModal } from '../../components/common/PopupModal';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '../../routes/routeConfig';

const PaymentGatewayList: React.FC = () => {
    const navigate = useNavigate();
    const [searchParams, setSearchParams] = useSearchParams();
    const [gateways, setGateways] = useState<PaymentGateway[]>([]);
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

    const search = searchParams.get('search') || '';
    const statusFilter = searchParams.get('status') || '';
    const environmentFilter = searchParams.get('environment') || '';

    const fetchGateways = useCallback(async () => {
        try {
            setLoading(true);
            const data = await paymentService.getAllGateways();
            console.log('Fetched gateways:', data);

            // Apply client-side filtering
            let filtered = data || [];
            if (search) {
                filtered = filtered.filter(g =>
                    g.name.toLowerCase().includes(search.toLowerCase()) ||
                    g.displayName.toLowerCase().includes(search.toLowerCase())
                );
            }
            if (statusFilter) {
                const isEnabled = statusFilter === 'ACTIVE';
                filtered = filtered.filter(g => g.isEnabled === isEnabled);
            }
            if (environmentFilter) {
                filtered = filtered.filter(g => g.environment === environmentFilter);
            }

            setGateways(filtered);
        } catch (error: any) {
            console.error('Error fetching gateways:', error);
            toast.error(error.response?.data?.message || 'Failed to fetch payment gateways');
        } finally {
            setLoading(false);
        }
    }, [search, statusFilter, environmentFilter]);

    useEffect(() => {
        const timer = setTimeout(() => {
            fetchGateways();
        }, 300);
        return () => clearTimeout(timer);
    }, [fetchGateways]);

    const handleToggleGateway = async (name: string, currentStatus: boolean) => {
        const newStatus = !currentStatus;
        setPopup({
            isOpen: true,
            title: `${newStatus ? 'Enable' : 'Disable'} Gateway`,
            message: `Are you sure you want to ${newStatus ? 'enable' : 'disable'} ${name}? ${newStatus ? 'Customers will be able to use this gateway for payments.' : 'This gateway will not be available for customer payments.'}`,
            type: 'confirm',
            onConfirm: async () => {
                try {
                    setPopup(prev => ({ ...prev, loading: true }));
                    await paymentService.toggleGateway(name as any, newStatus);
                    toast.success(`Gateway ${newStatus ? 'enabled' : 'disabled'} successfully`);
                    fetchGateways();
                    setPopup(prev => ({ ...prev, isOpen: false, loading: false }));
                } catch (error: any) {
                    setPopup({
                        isOpen: true,
                        title: 'Error',
                        message: error.response?.data?.message || 'Failed to toggle gateway',
                        type: 'alert',
                        onConfirm: () => setPopup(prev => ({ ...prev, isOpen: false }))
                    });
                }
            }
        });
    };

    const handleFilterChange = (updatedFilters: Record<string, any>) => {
        setSearchParams(prev => {
            Object.keys(updatedFilters).forEach(key => {
                if (updatedFilters[key]) {
                    prev.set(key, updatedFilters[key]);
                } else {
                    prev.delete(key);
                }
            });
            return prev;
        });
    };

    const getStatusColor = (isEnabled: boolean) => {
        return isEnabled
            ? 'bg-emerald-50 text-emerald-600 border-emerald-100'
            : 'bg-gray-50 text-gray-500 border-gray-100';
    };

    const getEnvironmentColor = (env: string) => {
        return env === 'production'
            ? 'bg-blue-50 text-blue-600 border-blue-100'
            : 'bg-yellow-50 text-yellow-600 border-yellow-100';
    };

    const filterFields: FilterField[] = [
        {
            key: 'status',
            label: 'Status',
            type: 'select',
            options: [
                { label: 'Active', value: 'ACTIVE' },
                { label: 'Inactive', value: 'INACTIVE' }
            ]
        },
        {
            key: 'environment',
            label: 'Environment',
            type: 'select',
            options: [
                { label: 'Production', value: 'production' },
                { label: 'Sandbox', value: 'sandbox' }
            ]
        }
    ];

    const activeFilterCount = [statusFilter, environmentFilter].filter(Boolean).length;

    const columns: Column<PaymentGateway>[] = [
        {
            header: 'Gateway Info',
            key: 'info',
            render: (gateway) => (
                <div className="flex items-center gap-4 py-1">
                    <div className="relative group">
                        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center text-primary border border-primary/10 shadow-inner group-hover:scale-105 transition-all duration-500">
                            <CreditCard size={24} className="opacity-70" />
                        </div>
                        <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white shadow-sm transition-colors duration-500 ${gateway.isEnabled ? 'bg-emerald-500' : 'bg-gray-400'}`} />
                    </div>
                    <div className="flex flex-col">
                        <span className="font-black text-gray-900 leading-tight uppercase tracking-tight">{gateway.displayName}</span>
                        <span className="text-[10px] font-bold text-gray-400 mt-1 uppercase tracking-wider">{gateway.name}</span>
                    </div>
                </div>
            )
        },
        {
            header: 'Environment',
            key: 'environment',
            render: (gateway) => (
                <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-[0.15em] border ${getEnvironmentColor(gateway.environment)}`}>
                    {gateway.environment}
                </span>
            )
        },
        {
            header: 'Priority',
            key: 'priority',
            render: (gateway) => (
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center border border-primary/20">
                        <span className="text-sm font-black text-primary">{gateway.priority}</span>
                    </div>
                    <span className="text-[9px] font-bold text-gray-400 uppercase tracking-wider">Order</span>
                </div>
            )
        },
        {
            header: 'Status',
            key: 'status',
            render: (gateway) => (
                <span className={`px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-[0.1em] border ${getStatusColor(gateway.isEnabled)}`}>
                    {gateway.isEnabled ? 'ACTIVE' : 'INACTIVE'}
                </span>
            )
        },
        {
            header: 'Last Updated',
            key: 'updatedAt',
            render: (gateway) => (
                <span className="text-xs font-semibold text-gray-500">
                    {new Date(gateway.updatedAt).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric'
                    })}
                </span>
            )
        },
        {
            header: 'Action',
            key: 'actions',
            align: 'right',
            render: (gateway) => (
                <div className="flex items-center justify-end gap-2">
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            handleToggleGateway(gateway.name, gateway.isEnabled);
                        }}
                        className={`p-3 rounded-2xl transition-all border group ${gateway.isEnabled
                            ? 'text-gray-400 hover:text-rose-500 hover:bg-rose-50 border-transparent hover:border-rose-100'
                            : 'text-gray-400 hover:text-emerald-500 hover:bg-emerald-50 border-transparent hover:border-emerald-100'
                            }`}
                        title={gateway.isEnabled ? 'Disable Gateway' : 'Enable Gateway'}
                    >
                        {gateway.isEnabled ? (
                            <XCircle size={18} className="group-hover:scale-110 transition-transform" />
                        ) : (
                            <CheckCircle2 size={18} className="group-hover:scale-110 transition-transform" />
                        )}
                    </button>
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/${ROUTES.DASHBOARD.PAYMENT_GATEWAY_EDIT.replace(':name', gateway.name)}`);
                        }}
                        className="p-3 text-primary hover:bg-primary/5 rounded-2xl transition-all border border-transparent hover:border-primary/10 group"
                        title="Configure Gateway"
                    >
                        <Settings size={18} className="group-hover:scale-110 transition-transform" />
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
                    <div className="w-16 h-16 rounded-[1.5rem] bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white shadow-xl shadow-blue-500/20">
                        <CreditCard size={32} />
                    </div>
                    <div>
                        <h1 className="text-3xl font-black text-primary tracking-tight uppercase font-mono">Payment Gateways</h1>
                        <p className="text-sm text-gray-500 font-medium">Configure and manage payment gateway integrations</p>
                    </div>
                </div>
                <div className="flex items-center gap-4 relative z-10">

                    <div className="bg-primary/5 px-6 py-3 rounded-2xl border border-primary/10 flex flex-col items-center">
                        <span className="text-[10px] font-black text-primary/40 uppercase tracking-widest leading-none mb-1">Total Gateways</span>
                        <span className="text-2xl font-black text-primary">{(gateways || []).length}</span>
                    </div>
                    <div className="bg-emerald-50 px-6 py-3 rounded-2xl border border-emerald-100 flex flex-col items-center">
                        <span className="text-[10px] font-black text-emerald-600/60 uppercase tracking-widest leading-none mb-1">Active</span>
                        <span className="text-2xl font-black text-emerald-600">{(gateways || []).filter(g => g.isEnabled).length}</span>
                    </div>
                </div>
            </div>

            {/* Advanced Search & Filtering */}
            <div className="flex flex-col xl:flex-row gap-4">
                <div className="flex-1 relative group">
                    <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-primary/40 group-focus-within:text-primary transition-colors duration-300" size={22} />
                    <input
                        type="text"
                        placeholder="Search by gateway name..."
                        value={search}
                        onChange={(e) => setSearchParams(prev => {
                            if (e.target.value) prev.set('search', e.target.value);
                            else prev.delete('search');
                            return prev;
                        })}
                        className="w-full bg-white border-2 border-primary/5 rounded-[2rem] py-5 pl-14 pr-6 focus:outline-none focus:border-primary/20 transition-all font-bold text-gray-700 shadow-xl shadow-gray-100/50 placeholder:text-gray-300"
                    />
                </div>

                <div className="flex flex-wrap gap-3">
                    <button
                        onClick={() => setIsFilterOpen(true)}
                        className={`px-8 py-4 rounded-[2rem] border-2 flex items-center gap-3 transition-all font-black uppercase text-[10px] tracking-widest h-16 ${activeFilterCount > 0
                            ? 'bg-primary border-primary text-white shadow-xl shadow-primary/30'
                            : 'bg-white border-primary/5 text-primary hover:bg-primary/5 hover:border-primary/10 shadow-xl shadow-gray-100/30'
                            }`}
                    >
                        <Filter size={18} />
                        Intelligence Filter
                        {activeFilterCount > 0 && (
                            <span className="w-6 h-6 bg-white text-primary rounded-full flex items-center justify-center text-[10px] font-black shadow-inner">
                                {activeFilterCount}
                            </span>
                        )}
                    </button>

                    {activeFilterCount > 0 && (
                        <button
                            onClick={() => setSearchParams({})}
                            className="px-6 py-4 rounded-[2rem] bg-rose-50 border-2 border-rose-100 text-rose-500 hover:bg-rose-100 transition-all font-black uppercase text-[10px] tracking-widest flex items-center gap-2 shadow-xl shadow-rose-100/50 h-16"
                        >
                            <RotateCcw size={16} />
                            Reset
                        </button>
                    )}
                </div>
            </div>

            <CommonFilter
                isOpen={isFilterOpen}
                onClose={() => setIsFilterOpen(false)}
                fields={filterFields}
                onApply={handleFilterChange}
                currentFilters={{ status: statusFilter, environment: environmentFilter }}
            />

            {/* Info Banner */}
            <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4 flex items-start gap-3">
                <AlertCircle size={20} className="text-blue-600 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                    <h3 className="text-sm font-black text-blue-900 mb-1 uppercase tracking-wide">Gateway Priority</h3>
                    <p className="text-xs text-blue-700 leading-relaxed">
                        Gateways are processed in priority order (lower number = higher priority). Only enabled gateways will be available for customer payments.
                    </p>
                </div>
            </div>

            <Table
                data={gateways.sort((a, b) => a.priority - b.priority)}
                columns={columns}
                isLoading={loading}
                keyExtractor={(gateway) => gateway._id}
                emptyMessage="No payment gateways configured"
                onRowClick={(gateway) => navigate(`/${ROUTES.DASHBOARD.PAYMENT_GATEWAY_EDIT.replace(':name', gateway.name)}`)}
            />

            <PopupModal
                isOpen={popup.isOpen}
                onClose={() => setPopup(prev => ({ ...prev, isOpen: false }))}
                title={popup.title}
                message={popup.message}
                type={popup.type}
                onConfirm={popup.onConfirm}
                loading={popup.loading}
            />
        </div>
    );
};

export default PaymentGatewayList;
