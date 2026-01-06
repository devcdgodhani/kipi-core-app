import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
    Truck,
    Settings,
    Search,
    Filter,
    ToggleLeft,
    ToggleRight,
    RotateCcw
} from 'lucide-react';
import courierService from '../../services/courierService';
import type { ICourier, ICourierFilters } from '../../types/courier.types';
import CustomButton from '../../components/common/Button';
import { Table, type Column } from '../../components/common/Table';
import { CommonFilter, type FilterField } from '../../components/common/CommonFilter';
import { PopupModal } from '../../components/common/PopupModal';
import { Modal } from '../../components/common/Modal';
import Input from '../../components/common/Input';

const filterFields: FilterField[] = [
    {
        key: 'isActive',
        label: 'Node Status',
        type: 'select',
        options: [
            { label: 'Active', value: 'true' },
            { label: 'Inactive', value: 'false' }
        ]
    }
];

export const CourierConfig: React.FC = () => {
    const [searchParams, setSearchParams] = useSearchParams();
    const [couriers, setCouriers] = useState<ICourier[]>([]);
    const [loading, setLoading] = useState(true);
    const [isFilterOpen, setIsFilterOpen] = useState(false);
    const [isConfigModalOpen, setIsConfigModalOpen] = useState(false);
    const [selectedCourier, setSelectedCourier] = useState<ICourier | null>(null);
    const [configData, setConfigData] = useState<Partial<ICourier>>({});

    const [popup, setPopup] = useState<{
        isOpen: boolean;
        title: string;
        message: string;
        type: 'alert' | 'confirm';
        onConfirm: () => void;
    }>({
        isOpen: false,
        title: '',
        message: '',
        type: 'alert',
        onConfirm: () => { }
    });

    const search = searchParams.get('search') || '';

    const fetchCouriers = useCallback(async () => {
        try {
            setLoading(true);
            const filters: any = {};
            searchParams.forEach((value, key) => {
                if (value && key !== 'search') {
                    filters[key] = value === 'true' ? true : value === 'false' ? false : value;
                }
            });
            const data = await courierService.getAll({ ...filters, search });
            setCouriers(data || []);
        } catch (err: any) {
            console.error('Failed to load couriers');
        } finally {
            setLoading(false);
        }
    }, [searchParams, search]);

    useEffect(() => {
        const timer = setTimeout(() => {
            fetchCouriers();
        }, 300);
        return () => clearTimeout(timer);
    }, [fetchCouriers]);

    const handleSearch = (val: string) => {
        setSearchParams(prev => {
            if (val) prev.set('search', val);
            else prev.delete('search');
            return prev;
        });
    };

    const handleFilterApply = (vals: Record<string, any>) => {
        setSearchParams(prev => {
            Object.entries(vals).forEach(([key, value]) => {
                if (value !== undefined && value !== '') prev.set(key, value.toString());
                else prev.delete(key);
            });
            return prev;
        });
        setIsFilterOpen(false);
    };

    const handleReset = () => {
        setSearchParams({});
    };

    const activeFilterCount = Array.from(searchParams.keys()).filter(k => k !== 'search').length;

    const handleToggleActive = async (id: string, currentStatus: boolean) => {
        try {
            await courierService.toggleActive(id, !currentStatus);
            setCouriers(prev => prev.map(c => c._id === id ? { ...c, isActive: !currentStatus } : c));
        } catch (err) {
            setPopup({
                isOpen: true,
                title: 'Error',
                message: 'Failed to update courier status',
                type: 'alert',
                onConfirm: () => setPopup(prev => ({ ...prev, isOpen: false }))
            });
        }
    };

    const handleOpenConfig = (courier: ICourier) => {
        setSelectedCourier(courier);
        setConfigData({
            apiUrl: courier.apiUrl || '',
            apiCredentials: courier.apiCredentials || '',
            webhookSecret: courier.webhookSecret || '',
            supportEmail: courier.supportEmail || '',
            supportPhone: courier.supportPhone || '',
            slaMin: courier.slaMin || 2,
            slaMax: courier.slaMax || 6
        });
        setIsConfigModalOpen(true);
    };

    const handleSaveConfig = async () => {
        if (!selectedCourier) return;
        try {
            setLoading(true);
            await courierService.update(selectedCourier._id, configData);
            setIsConfigModalOpen(false);
            fetchCouriers();
        } catch (err) {
            alert('Failed to save configuration');
        } finally {
            setLoading(false);
        }
    };

    const columns: Column<ICourier>[] = [
        {
            header: 'Courier details',
            key: 'details',
            render: (courier) => (
                <div className="flex items-center gap-4 py-2">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500/10 to-blue-500/5 flex items-center justify-center text-blue-600 border border-blue-500/10 shadow-inner group-hover:scale-105 transition-transform duration-300">
                        <Truck size={24} />
                    </div>
                    <div className="flex flex-col">
                        <span className="font-bold text-gray-900 leading-tight uppercase tracking-tight">{courier.name}</span>
                        <div className="flex items-center gap-2 mt-1">
                            <span className="text-[10px] bg-gray-100 text-gray-500 px-2 py-0.5 rounded font-black uppercase tracking-tighter border border-gray-200">
                                Code: {courier.code}
                            </span>
                            {courier.isPrimary && (
                                <span className="text-[10px] bg-amber-50 text-amber-600 px-2 py-0.5 rounded font-black uppercase tracking-tighter border border-amber-100 animate-pulse-slow">
                                    Primary
                                </span>
                            )}
                        </div>
                    </div>
                </div>
            )
        },
        {
            header: 'Performance',
            key: 'performance',
            render: (courier) => (
                <div className="flex flex-col gap-1.5 py-1">
                    <div className="flex items-center gap-2 text-[10px] font-black text-gray-400 uppercase tracking-widest">
                        <span>Delivery: {courier.avgDeliveryDays || '-'} days</span>
                    </div>
                    <div className="flex items-center gap-2 text-[10px] font-black text-gray-400 uppercase tracking-widest">
                        <span>RTO Rate: {courier.rtoPercentage || 0}%</span>
                    </div>
                </div>
            )
        },
        {
            header: 'Logistics SLA',
            key: 'sla',
            render: (courier) => (
                <div className="flex items-center gap-2 bg-gray-50 px-3 py-1.5 rounded-xl border border-gray-100 w-fit group-hover:border-primary/20 transition-colors">
                    <span className="text-[10px] font-black text-gray-600 uppercase tracking-widest">{courier.slaMin || 2} - {courier.slaMax || 7} Days</span>
                </div>
            )
        },
        {
            header: 'Lifecycle & Control',
            key: 'actions',
            align: 'right',
            render: (courier) => (
                <div className="flex items-center justify-end gap-3">
                    <button
                        onClick={() => handleToggleActive(courier._id, courier.isActive)}
                        className={`transition-all flex items-center gap-2 px-3 py-1 rounded-full border ${courier.isActive
                            ? 'text-emerald-500 border-emerald-100 bg-emerald-50'
                            : 'text-gray-300 border-gray-100 bg-gray-50'}`}
                    >
                        <span className="text-[10px] font-black uppercase tracking-widest">{courier.isActive ? 'Online' : 'Offline'}</span>
                        {courier.isActive ? <ToggleRight size={24} /> : <ToggleLeft size={24} />}
                    </button>
                    <button
                        onClick={() => handleOpenConfig(courier)}
                        className="p-3 text-primary hover:bg-primary/5 rounded-2xl transition-all hover:scale-110 active:scale-90 border border-transparent hover:border-primary/10"
                        title="Configure Engine"
                    >
                        <Settings size={18} />
                    </button>
                </div>
            )
        }
    ];

    return (
        <div className="p-6 space-y-6">
            {/* Premium Hero Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-white p-8 rounded-[2.5rem] border border-primary/5 shadow-sm relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/5 rounded-full -mr-32 -mt-32 blur-3xl group-hover:bg-blue-500/10 transition-colors duration-1000" />
                <div className="relative z-10 flex items-center gap-6">
                    <div className="w-16 h-16 rounded-[1.5rem] bg-indigo-600 flex items-center justify-center text-white shadow-xl shadow-indigo-600/20">
                        <Truck size={32} />
                    </div>
                    <div>
                        <h1 className="text-3xl font-black text-primary tracking-tight uppercase font-mono">Carrier Control</h1>
                        <p className="text-sm text-gray-500 font-medium">Configure logistics providers and automation parameters</p>
                    </div>
                </div>
            </div>

            {/* Premium Top Bar */}
            <div className="flex flex-col xl:flex-row gap-4 items-center">
                <div className="flex-1 relative group w-full xl:w-auto">
                    <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-primary/40 group-focus-within:text-primary transition-colors duration-300" size={22} />
                    <input
                        type="text"
                        placeholder="Scan carriers by name or system code..."
                        value={search}
                        onChange={(e) => handleSearch(e.target.value)}
                        className="w-full bg-white border-2 border-primary/5 rounded-[2rem] py-5 h-16 pl-16 pr-6 focus:outline-none focus:border-primary/20 transition-all font-bold text-gray-700 shadow-xl shadow-gray-100/50"
                    />
                </div>

                <div className="flex flex-wrap gap-3 w-full xl:w-auto">
                    {activeFilterCount > 0 && (
                        <button
                            onClick={handleReset}
                            className="px-6 h-16 rounded-[2rem] bg-rose-50 border-2 border-rose-100 text-rose-500 hover:bg-rose-100 transition-all font-black uppercase text-[10px] tracking-widest flex items-center gap-2 shadow-xl shadow-rose-100/50"
                        >
                            <RotateCcw size={16} />
                            Reset
                        </button>
                    )}
                    <button
                        onClick={() => setIsFilterOpen(true)}
                        className={`px-8 h-16 rounded-[2rem] border-2 flex items-center gap-3 transition-all font-black uppercase text-[10px] tracking-widest shadow-xl ${activeFilterCount > 0
                            ? 'bg-primary border-primary text-white shadow-primary/20'
                            : 'bg-white border-primary/5 text-primary hover:bg-primary/5 shadow-gray-100/50'
                            }`}
                    >
                        <Filter size={20} />
                        Filter Streams
                        {activeFilterCount > 0 && (
                            <span className="w-6 h-6 bg-white text-primary rounded-full flex items-center justify-center text-[10px] font-black">
                                {activeFilterCount}
                            </span>
                        )}
                    </button>
                </div>
            </div>

            <CommonFilter
                isOpen={isFilterOpen}
                onClose={() => setIsFilterOpen(false)}
                fields={filterFields}
                onApply={handleFilterApply}
                currentFilters={Object.fromEntries(searchParams)}
            />

            <Table
                data={couriers}
                columns={columns}
                isLoading={loading}
                emptyMessage="No carriers integrated in the control grid"
                keyExtractor={(c) => c._id}
            />

            {/* Config Modal */}
            <Modal
                isOpen={isConfigModalOpen}
                onClose={() => setIsConfigModalOpen(false)}
                title={`Configure Node: ${selectedCourier?.name}`}
                maxWidth="max-w-2xl"
            >
                <div className="space-y-4 py-2">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Input
                            label="Neural Link URL (API)"
                            value={configData.apiUrl}
                            onChange={(e) => setConfigData({ ...configData, apiUrl: e.target.value })}
                            placeholder="https://api.transmission.com"
                        />
                        <Input
                            label="Auth Signature / Key"
                            value={configData.apiCredentials}
                            onChange={(e) => setConfigData({ ...configData, apiCredentials: e.target.value })}
                            placeholder="ENCRYPTED_SIGNATURE"
                            type="password"
                        />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Input
                            label="Webhook Pulse Secret"
                            value={configData.webhookSecret}
                            onChange={(e) => setConfigData({ ...configData, webhookSecret: e.target.value })}
                            placeholder="PULSE_VERIFICATION"
                        />
                        <div className="space-y-1">
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] px-1">SLA Latency Window (Days)</label>
                            <div className="flex items-center gap-2">
                                <Input
                                    type="number"
                                    value={configData.slaMin}
                                    onChange={(e) => setConfigData({ ...configData, slaMin: parseInt(e.target.value) })}
                                    className="flex-1"
                                />
                                <span className="text-gray-400 font-bold">~</span>
                                <Input
                                    type="number"
                                    value={configData.slaMax}
                                    onChange={(e) => setConfigData({ ...configData, slaMax: parseInt(e.target.value) })}
                                    className="flex-1"
                                />
                            </div>
                        </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-gray-100">
                        <Input
                            label="Secure Support Email"
                            value={configData.supportEmail}
                            onChange={(e) => setConfigData({ ...configData, supportEmail: e.target.value })}
                            placeholder="uplink@carrier.com"
                        />
                        <Input
                            label="Emergency Direct Line"
                            value={configData.supportPhone}
                            onChange={(e) => setConfigData({ ...configData, supportPhone: e.target.value })}
                            placeholder="+1 (Node Line)"
                        />
                    </div>

                    <div className="flex justify-end gap-3 pt-6">
                        <CustomButton variant="secondary" onClick={() => setIsConfigModalOpen(false)} className="rounded-xl">
                            Abort Changes
                        </CustomButton>
                        <CustomButton onClick={handleSaveConfig} loading={loading} className="rounded-xl shadow-lg shadow-primary/20">
                            Commit Configuration
                        </CustomButton>
                    </div>
                </div>
            </Modal>

            <PopupModal
                isOpen={popup.isOpen}
                onClose={() => setPopup(prev => ({ ...prev, isOpen: false }))}
                title={popup.title}
                message={popup.message}
                type={popup.type}
                onConfirm={popup.onConfirm}
            />
        </div>
    );
};
