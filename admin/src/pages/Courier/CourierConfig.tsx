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
import type { ICourier } from '../../types/courier.types';
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

    const [pagination, setPagination] = useState({
        totalRecords: 0,
        totalPages: 0,
        currentPage: 1,
        limit: 10
    });

    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const search = searchParams.get('search') || '';

    const fetchCouriers = useCallback(async () => {
        try {
            setLoading(true);
            const filters: any = {};
            searchParams.forEach((value, key) => {
                if (value && !['page', 'limit', 'search'].includes(key)) {
                    filters[key] = value === 'true' ? true : value === 'false' ? false : value;
                }
            });
            const response = await courierService.getWithPagination({ ...filters, search, page, limit });
            if (response) {
                setCouriers(response.recordList || []);
                setPagination({
                    totalRecords: response.totalRecords || 0,
                    totalPages: response.totalPages || 0,
                    currentPage: response.currentPage || 1,
                    limit: response.limit || 10
                });
            }
        } catch (err: any) {
            console.error('Failed to load couriers');
        } finally {
            setLoading(false);
        }
    }, [searchParams, search, page, limit]);

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
        setConfigData({ ...courier });
        setIsConfigModalOpen(true);
    };

    const handleAddCourier = () => {
        setSelectedCourier(null);
        setConfigData({
            name: '',
            code: '',
            provider: '',
            isActive: true,
            isPrimary: false,
            slaMin: 2,
            slaMax: 7,
            codCharges: 0,
            rtoCharges: 0,
            maxWeight: 10,
            maxCODAmount: 50000,
            apiUrl: '',
            apiCredentials: '',
            webhookSecret: '',
            supportEmail: '',
            supportPhone: '',
            serviceTypes: [
                { type: 'SURFACE', name: 'Surface', estimatedDays: 5, isActive: true },
                { type: 'EXPRESS', name: 'Express', estimatedDays: 2, isActive: true }
            ]
        });
        setIsConfigModalOpen(true);
    };

    const handleSaveConfig = async () => {
        try {
            setLoading(true);
            if (selectedCourier) {
                await courierService.update(selectedCourier._id, configData);
            } else {
                await courierService.create(configData);
            }
            setIsConfigModalOpen(false);
            fetchCouriers();
        } catch (err: any) {
            setPopup({
                isOpen: true,
                title: 'Error',
                message: err.response?.data?.message || 'Failed to save configuration',
                type: 'alert',
                onConfirm: () => setPopup(prev => ({ ...prev, isOpen: false }))
            });
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
                        onClick={(e) => { e.stopPropagation(); handleToggleActive(courier._id, courier.isActive); }}
                        className={`transition-all flex items-center gap-2 px-3 py-1 rounded-full border ${courier.isActive
                            ? 'text-emerald-500 border-emerald-100 bg-emerald-50'
                            : 'text-gray-300 border-gray-100 bg-gray-50'}`}
                    >
                        <span className="text-[10px] font-black uppercase tracking-widest">{courier.isActive ? 'Online' : 'Offline'}</span>
                        {courier.isActive ? <ToggleRight size={24} /> : <ToggleLeft size={24} />}
                    </button>
                    <button
                        onClick={(e) => { e.stopPropagation(); handleOpenConfig(courier); }}
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
                <CustomButton onClick={handleAddCourier} className="rounded-2xl shadow-xl shadow-primary/20 h-14 px-8 relative z-10">
                    <Truck size={20} className="mr-2" /> Add New Node
                </CustomButton>
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

                    <div className="flex items-center gap-2 bg-white border-2 border-primary/5 rounded-[2rem] px-6 h-16 shadow-xl shadow-gray-100/50">
                        <span className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Scale</span>
                        <select
                            value={limit}
                            onChange={(e) => setSearchParams(prev => { prev.set('limit', e.target.value); prev.set('page', '1'); return prev; })}
                            className="bg-transparent focus:outline-none font-black text-primary pl-2 cursor-pointer text-sm"
                        >
                            <option value={10}>10</option>
                            <option value={20}>20</option>
                            <option value={50}>50</option>
                        </select>
                    </div>
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
                onRowClick={handleOpenConfig}
                pagination={{
                    currentPage: pagination.currentPage,
                    totalPages: pagination.totalPages,
                    totalRecords: pagination.totalRecords,
                    pageSize: pagination.limit,
                    onPageChange: (p) => setSearchParams(prev => { prev.set('page', p.toString()); return prev; }),
                    hasPreviousPage: pagination.currentPage > 1,
                    hasNextPage: pagination.currentPage < pagination.totalPages
                }}
            />

            {/* Config Modal */}
            <Modal
                isOpen={isConfigModalOpen}
                onClose={() => setIsConfigModalOpen(false)}
                title={selectedCourier ? `Configure Node: ${selectedCourier.name}` : 'Integrate New Carrier Node'}
                maxWidth="max-w-4xl"
            >
                <div className="space-y-6 py-2 max-h-[70vh] overflow-y-auto pr-2 custom-scrollbar">
                    {/* Basic Identity */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pb-4 border-b border-gray-100">
                        <Input
                            label="Carrier Name"
                            value={configData.name}
                            onChange={(e) => setConfigData({ ...configData, name: e.target.value })}
                            placeholder="e.g. Shiprocket Prime"
                            required
                        />
                        <Input
                            label="System Code"
                            value={configData.code}
                            onChange={(e) => setConfigData({ ...configData, code: e.target.value.toUpperCase() })}
                            placeholder="SR_PRIME"
                            required
                        />
                        <Input
                            label="Provider Engine"
                            value={configData.provider}
                            onChange={(e) => setConfigData({ ...configData, provider: e.target.value })}
                            placeholder="SHIPROCKET"
                            required
                        />
                    </div>

                    {/* Operational Flags */}
                    <div className="flex flex-wrap gap-6 py-2">
                        <label className="flex items-center gap-3 cursor-pointer group">
                            <input
                                type="checkbox"
                                checked={configData.isActive}
                                onChange={(e) => setConfigData({ ...configData, isActive: e.target.checked })}
                                className="w-5 h-5 rounded border-gray-300 text-primary focus:ring-primary"
                            />
                            <div className="flex flex-col">
                                <span className="text-xs font-black text-gray-700 uppercase tracking-widest">Active Status</span>
                                <span className="text-[10px] text-gray-400 font-bold uppercase">Enable traffic to this node</span>
                            </div>
                        </label>
                        <label className="flex items-center gap-3 cursor-pointer group">
                            <input
                                type="checkbox"
                                checked={configData.isPrimary}
                                onChange={(e) => setConfigData({ ...configData, isPrimary: e.target.checked })}
                                className="w-5 h-5 rounded border-gray-300 text-primary focus:ring-primary"
                            />
                            <div className="flex flex-col">
                                <span className="text-xs font-black text-gray-700 uppercase tracking-widest">Primary Engine</span>
                                <span className="text-[10px] text-gray-400 font-bold uppercase">Default for fresh shipments</span>
                            </div>
                        </label>
                    </div>

                    {/* Integration Hub */}
                    <div className="space-y-4 pt-4 border-t border-gray-100">
                        <h3 className="text-[10px] font-black text-primary uppercase tracking-[0.2em]">Neural Integration Hub</h3>
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
                        <Input
                            label="Webhook Pulse Secret"
                            value={configData.webhookSecret}
                            onChange={(e) => setConfigData({ ...configData, webhookSecret: e.target.value })}
                            placeholder="PULSE_VERIFICATION"
                        />
                    </div>

                    {/* Logistics Parameters */}
                    <div className="space-y-4 pt-4 border-t border-gray-100">
                        <h3 className="text-[10px] font-black text-primary uppercase tracking-[0.2em]">Logistics Intelligence</h3>
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                            <Input
                                label="COD Fees"
                                type="number"
                                value={configData.codCharges}
                                onChange={(e) => setConfigData({ ...configData, codCharges: parseFloat(e.target.value) })}
                            />
                            <Input
                                label="RTO Fees"
                                type="number"
                                value={configData.rtoCharges}
                                onChange={(e) => setConfigData({ ...configData, rtoCharges: parseFloat(e.target.value) })}
                            />
                            <Input
                                label="Max Payload (KG)"
                                type="number"
                                value={configData.maxWeight}
                                onChange={(e) => setConfigData({ ...configData, maxWeight: parseFloat(e.target.value) })}
                            />
                            <Input
                                label="Max COD Cap"
                                type="number"
                                value={configData.maxCODAmount}
                                onChange={(e) => setConfigData({ ...configData, maxCODAmount: parseFloat(e.target.value) })}
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-1">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] px-1">Delivery Latency (Days)</label>
                                <div className="flex items-center gap-2">
                                    <Input
                                        type="number"
                                        value={configData.slaMin}
                                        onChange={(e) => setConfigData({ ...configData, slaMin: parseInt(e.target.value) })}
                                        className="flex-1"
                                        placeholder="Min"
                                    />
                                    <span className="text-gray-400 font-bold">~</span>
                                    <Input
                                        type="number"
                                        value={configData.slaMax}
                                        onChange={(e) => setConfigData({ ...configData, slaMax: parseInt(e.target.value) })}
                                        className="flex-1"
                                        placeholder="Max"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Service Types */}
                    <div className="space-y-4 pt-4 border-t border-gray-100">
                        <div className="flex items-center justify-between">
                            <h3 className="text-[10px] font-black text-primary uppercase tracking-[0.2em]">Service Configurations</h3>
                            <button
                                onClick={() => setConfigData({
                                    ...configData,
                                    serviceTypes: [...(configData.serviceTypes || []), { type: 'CUSTOM', name: 'New Service', estimatedDays: 7, isActive: true }]
                                })}
                                className="text-[10px] font-black text-blue-600 uppercase tracking-widest hover:text-blue-700"
                            >
                                + Add Service Line
                            </button>
                        </div>
                        <div className="grid grid-cols-1 gap-3">
                            {configData.serviceTypes?.map((service, index) => (
                                <div key={index} className="flex flex-wrap items-end gap-3 p-4 bg-gray-50 rounded-2xl border border-gray-100 group/service relative">
                                    <div className="flex-1">
                                        <Input
                                            label="Service Name"
                                            value={service.name}
                                            onChange={(e) => {
                                                const newTypes = [...(configData.serviceTypes || [])];
                                                newTypes[index].name = e.target.value;
                                                setConfigData({ ...configData, serviceTypes: newTypes });
                                            }}
                                        />
                                    </div>
                                    <div className="w-32">
                                        <Input
                                            label="Node Code"
                                            value={service.type}
                                            onChange={(e) => {
                                                const newTypes = [...(configData.serviceTypes || [])];
                                                newTypes[index].type = e.target.value.toUpperCase();
                                                setConfigData({ ...configData, serviceTypes: newTypes });
                                            }}
                                        />
                                    </div>
                                    <div className="w-24">
                                        <Input
                                            label="ETA (Days)"
                                            type="number"
                                            value={service.estimatedDays}
                                            onChange={(e) => {
                                                const newTypes = [...(configData.serviceTypes || [])];
                                                newTypes[index].estimatedDays = parseInt(e.target.value);
                                                setConfigData({ ...configData, serviceTypes: newTypes });
                                            }}
                                        />
                                    </div>
                                    <button
                                        onClick={() => {
                                            const newTypes = [...(configData.serviceTypes || [])];
                                            newTypes[index].isActive = !newTypes[index].isActive;
                                            setConfigData({ ...configData, serviceTypes: newTypes });
                                        }}
                                        className={`px-4 h-10 rounded-xl border text-[10px] font-black uppercase transition-all ${service.isActive ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-white text-gray-400 border-gray-200'
                                            }`}
                                    >
                                        {service.isActive ? 'Active' : 'Muted'}
                                    </button>
                                    <button
                                        onClick={() => {
                                            const newTypes = configData.serviceTypes?.filter((_, i) => i !== index);
                                            setConfigData({ ...configData, serviceTypes: newTypes });
                                        }}
                                        className="p-2 text-rose-500 hover:bg-rose-50 rounded-lg transition-colors"
                                    >
                                        <RotateCcw size={16} className="rotate-45" />
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Support Uplinks */}
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

                    <div className="flex justify-end gap-3 pt-6 sticky bottom-0 bg-white py-4 border-t border-gray-50">
                        <CustomButton variant="secondary" onClick={() => setIsConfigModalOpen(false)} className="rounded-xl">
                            Abort Changes
                        </CustomButton>
                        <CustomButton onClick={handleSaveConfig} loading={loading} className="rounded-xl shadow-lg shadow-primary/20">
                            {selectedCourier ? 'Commit Configuration' : 'Enable Integration'}
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
