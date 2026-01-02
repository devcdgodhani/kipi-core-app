import React, { useEffect, useState, useCallback } from 'react';
import {
    Search,
    Filter,
    Plus,
    Edit2,
    Trash2,
    RotateCcw,
    Sliders,
    Settings2,
    Hash,
    ToggleLeft
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { attributeService } from '../../services/attribute.service';
import type { IAttribute, IAttributeFilter, IPaginationData } from '../../types/attribute';
import { ATTRIBUTE_STATUS, ATTRIBUTE_VALUE_TYPE, ATTRIBUTE_INPUT_TYPE } from '../../types/attribute';
import CustomButton from '../../components/common/Button';
import { CommonFilter, type FilterField } from '../../components/common/CommonFilter';
import { Table, type Column } from '../../components/common/Table';
import { ROUTES } from '../../routes/routeConfig';
import { PopupModal } from '../../components/common/PopupModal';

const AttributeList: React.FC = () => {
    const navigate = useNavigate();
    const [attributes, setAttributes] = useState<IAttribute[]>([]);
    const [pagination, setPagination] = useState<IPaginationData<IAttribute> | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
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

    // Filters State
    const [filters, setFilters] = useState<IAttributeFilter>({
        search: '',
        status: undefined,
        valueType: undefined,
        inputType: undefined,
        isFilterable: undefined,
        isVariant: undefined,
        page: 1,
        limit: 10
    });

    const fetchAttributes = useCallback(async () => {
        try {
            setLoading(true);
            const response = await attributeService.getWithPagination(filters);
            if (response && response.data) {
                setPagination(response.data);
                setAttributes(response.data.recordList);
            }
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to fetch attributes');
        } finally {
            setLoading(false);
        }
    }, [filters]);

    useEffect(() => {
        const timer = setTimeout(() => {
            fetchAttributes();
        }, 300); // Debounce search
        return () => clearTimeout(timer);
    }, [fetchAttributes]);

    const handleFilterChange = (updatedFilters: Record<string, any>) => {
        setFilters(prev => ({ ...prev, ...updatedFilters, page: 1 }));
    };

    const handleDeleteAttribute = async (id: string) => {
        setPopup({
            isOpen: true,
            title: 'Delete Attribute',
            message: 'Are you sure you want to delete this attribute?',
            type: 'confirm',
            onConfirm: async () => {
                try {
                    setPopup(prev => ({ ...prev, loading: true }));
                    await attributeService.delete(id);
                    fetchAttributes();
                    setPopup(prev => ({ ...prev, isOpen: false, loading: false }));
                } catch (err: any) {
                    setPopup({
                        isOpen: true,
                        title: 'Error',
                        message: err.response?.data?.message || 'Failed to delete attribute',
                        type: 'alert',
                        onConfirm: () => setPopup(prev => ({ ...prev, isOpen: false }))
                    });
                }
            }
        });
    };

    const columns: Column<IAttribute>[] = [
        {
            header: 'Attribute Technicals',
            key: 'name',
            render: (attr) => (
                <div className="flex items-center gap-4 py-1">
                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center text-primary border border-primary/10 shadow-inner group-hover:scale-110 transition-transform duration-500">
                        <Settings2 size={26} />
                    </div>
                    <div className="flex flex-col">
                        <span className="font-black text-gray-900 leading-tight uppercase tracking-tight">{attr.name}</span>
                        <div className="flex items-center gap-2 mt-1">
                            <span className="text-[9px] font-black text-primary/40 uppercase tracking-[0.2em]">{attr.slug}</span>
                        </div>
                    </div>
                </div>
            )
        },
        {
            header: 'Value Architecture',
            key: 'valueType',
            render: (attr) => (
                <div className="flex items-center gap-3 py-1">
                    <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-500 flex items-center justify-center border border-indigo-100 shadow-sm">
                        <Hash size={16} />
                    </div>
                    <span className="text-[10px] font-black text-gray-700 uppercase tracking-widest">{attr.valueType}</span>
                </div>
            )
        },
        {
            header: 'Interaction Pattern',
            key: 'inputType',
            render: (attr) => (
                <div className="flex items-center gap-3 py-1">
                    <div className="w-9 h-9 rounded-xl bg-violet-50 text-violet-500 flex items-center justify-center border border-violet-100 shadow-sm">
                        <ToggleLeft size={16} />
                    </div>
                    <span className="text-[10px] font-black text-gray-700 uppercase tracking-widest">{attr.inputType.replace('_', ' ')}</span>
                </div>
            )
        },
        {
            header: 'Variant Support',
            key: 'isVariant',
            align: 'center',
            render: (attr) => attr.isVariant ? (
                <span className="px-3 py-1 rounded-xl bg-emerald-50 text-[9px] font-black text-emerald-600 uppercase tracking-widest border border-emerald-100 shadow-sm">Enabled</span>
            ) : (
                <span className="px-3 py-1 rounded-xl bg-gray-50 text-[9px] font-black text-gray-300 uppercase tracking-widest border border-gray-100 italic">Static</span>
            )
        },
        {
            header: 'Filter Capability',
            key: 'isFilterable',
            align: 'center',
            render: (attr) => attr.isFilterable ? (
                <span className="px-3 py-1 rounded-xl bg-blue-50 text-[9px] font-black text-blue-600 uppercase tracking-widest border border-blue-100 shadow-sm">Active</span>
            ) : (
                <span className="px-3 py-1 rounded-xl bg-gray-50 text-[9px] font-black text-gray-300 uppercase tracking-widest border border-gray-100 italic">Internal</span>
            )
        },
        {
            header: 'Strategic Status',
            key: 'status',
            align: 'center',
            render: (attr) => (
                <span className={`px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-sm border ${attr.status === ATTRIBUTE_STATUS.ACTIVE
                    ? 'bg-emerald-50 text-emerald-600 border-emerald-100'
                    : 'bg-gray-50 text-gray-400 border-gray-100'
                    }`}>
                    {attr.status}
                </span>
            )
        },
        {
            header: 'Action Hub',
            key: 'actions',
            align: 'right',
            render: (attr) => (
                <div className="flex items-center justify-end gap-2">
                    <button
                        onClick={() => navigate('/' + ROUTES.DASHBOARD.ATTRIBUTES_EDIT.replace(':id', attr._id))}
                        className="p-3 text-gray-400 hover:text-primary hover:bg-primary/5 rounded-2xl transition-all border border-transparent hover:border-primary/10 group"
                        title="Engineer Specification"
                    >
                        <Edit2 size={18} className="group-hover:scale-110 transition-transform" />
                    </button>
                    <button
                        onClick={() => handleDeleteAttribute(attr._id)}
                        className="p-3 text-gray-400 hover:text-rose-500 hover:bg-rose-50 rounded-2xl transition-all border border-transparent hover:border-rose-100 group"
                        title="Decommission Logic"
                    >
                        <Trash2 size={18} className="group-hover:scale-110 transition-transform" />
                    </button>
                </div>
            )
        }
    ];

    const filterFields: FilterField[] = [
        {
            key: 'status',
            label: 'Status',
            type: 'select',
            multiple: true,
            options: Object.values(ATTRIBUTE_STATUS).map(s => ({ label: s, value: s }))
        },
        {
            key: 'valueType',
            label: 'Value Type',
            type: 'select',
            multiple: true,
            options: Object.values(ATTRIBUTE_VALUE_TYPE).map(t => ({ label: t, value: t }))
        },
        {
            key: 'inputType',
            label: 'Input Type',
            type: 'select',
            multiple: true,
            options: Object.values(ATTRIBUTE_INPUT_TYPE).map(t => ({ label: t, value: t }))
        },
        {
            key: 'isFilterable',
            label: 'Filterable',
            type: 'select',
            options: [
                { label: 'Yes', value: true },
                { label: 'No', value: false }
            ]
        },
        {
            key: 'isVariant',
            label: 'Is Variant',
            type: 'select',
            options: [
                { label: 'Yes', value: true },
                { label: 'No', value: false }
            ]
        }
    ];

    const activeFilterCount = Object.keys(filters).filter(k =>
        !['search', 'page', 'limit'].includes(k) &&
        filters[k as keyof IAttributeFilter] !== undefined &&
        (Array.isArray(filters[k as keyof IAttributeFilter]) ? (filters[k as keyof IAttributeFilter] as any[]).length > 0 : true)
    ).length;

    return (
        <div className="p-6 space-y-6">
            {error && (
                <div className="fixed top-6 right-6 bg-rose-50 border border-rose-100 text-rose-600 px-6 py-4 rounded-2xl z-50 animate-in fade-in slide-in-from-top-4 duration-500 shadow-2xl shadow-rose-200/50 flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
                    <span className="text-sm font-black uppercase tracking-widest">{error}</span>
                </div>
            )}

            {/* Premium Hero Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-white p-8 rounded-[2.5rem] border border-primary/5 shadow-sm relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full -mr-32 -mt-32 blur-3xl group-hover:bg-primary/10 transition-colors duration-1000" />
                <div className="relative z-10 flex items-center gap-6">
                    <div className="w-16 h-16 rounded-[1.5rem] bg-indigo-500 flex items-center justify-center text-white shadow-xl shadow-indigo-500/20">
                        <Sliders size={32} />
                    </div>
                    <div>
                        <h1 className="text-3xl font-black text-primary tracking-tight uppercase font-mono">Attribute Hub</h1>
                        <p className="text-sm text-gray-500 font-medium">Architecting dynamic product schemas and visual hierarchies</p>
                    </div>
                </div>
                <div className="flex items-center gap-4 relative z-10">
                    <div className="bg-primary/5 px-6 py-3 rounded-2xl border border-primary/10 flex flex-col items-center">
                        <span className="text-[10px] font-black text-primary/40 uppercase tracking-widest leading-none mb-1">Total Definitions</span>
                        <span className="text-2xl font-black text-primary">{pagination?.totalRecords || 0}</span>
                    </div>
                    <CustomButton onClick={() => navigate('/' + ROUTES.DASHBOARD.ATTRIBUTES_CREATE)} className="rounded-[1.5rem] shadow-xl shadow-primary/20 h-16 px-8 text-sm uppercase tracking-widest font-black">
                        <Plus size={20} className="mr-2" /> Initialize Logic
                    </CustomButton>
                </div>
            </div>

            {/* Intelligence Search Bar */}
            <div className="flex flex-col xl:flex-row gap-4">
                <div className="flex-1 relative group">
                    <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-primary/40 group-focus-within:text-primary transition-colors duration-300" size={22} />
                    <input
                        type="text"
                        placeholder="Scan taxonomic attributes by identity or slug..."
                        value={filters.search}
                        onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value, page: 1 }))}
                        className="w-full bg-white border-2 border-primary/5 rounded-[2rem] py-5 pl-16 pr-6 focus:outline-none focus:border-primary/20 transition-all font-bold text-gray-700 shadow-xl shadow-gray-100/50 placeholder:text-gray-300"
                    />
                </div>

                <div className="flex flex-wrap gap-3">
                    <button
                        onClick={() => setIsFilterOpen(true)}
                        className={`px-8 py-4 rounded-[2rem] border-2 flex items-center gap-3 transition-all font-black uppercase text-[10px] tracking-widest h-16 ${activeFilterCount > 0
                            ? 'bg-primary border-primary text-white shadow-xl shadow-primary/30'
                            : 'bg-white border-primary/5 text-primary hover:bg-primary/5'
                            }`}
                    >
                        <Filter size={18} />
                        Neural Filters
                        {activeFilterCount > 0 && (
                            <span className="w-6 h-6 bg-white text-primary rounded-full flex items-center justify-center text-[10px] font-black shadow-inner">
                                {activeFilterCount}
                            </span>
                        )}
                    </button>

                    {activeFilterCount > 0 && (
                        <button
                            onClick={() => setFilters({
                                search: '',
                                status: undefined,
                                valueType: undefined,
                                inputType: undefined,
                                isFilterable: undefined,
                                isVariant: undefined,
                                page: 1,
                                limit: 10
                            })}
                            className="px-6 py-4 rounded-[2rem] bg-rose-50 border-2 border-rose-100 text-rose-500 hover:bg-rose-100 transition-all font-black uppercase text-[10px] tracking-widest flex items-center gap-2 shadow-xl shadow-rose-100/50 h-16"
                        >
                            <RotateCcw size={16} />
                            Reset Hub
                        </button>
                    )}

                    <div className="flex items-center gap-3 bg-white border-2 border-primary/5 rounded-[2rem] px-6 py-2 shadow-xl shadow-gray-100/30 h-16">
                        <span className="text-[10px] font-black text-gray-300 uppercase tracking-widest">Viewport</span>
                        <select
                            value={filters.limit}
                            onChange={(e) => setFilters(prev => ({ ...prev, limit: Number(e.target.value), page: 1 }))}
                            className="bg-transparent focus:outline-none font-black text-primary cursor-pointer text-sm outline-none border-none"
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
                onApply={handleFilterChange}
                currentFilters={filters}
            />

            <Table
                data={attributes}
                columns={columns}
                isLoading={loading}
                keyExtractor={(item) => item._id}
                emptyMessage="No strategic attributes discovered in this sector"
                onRowClick={(attr) => navigate('/' + ROUTES.DASHBOARD.ATTRIBUTES_EDIT.replace(':id', attr._id))}
                pagination={pagination && pagination.totalPages > 1 ? {
                    currentPage: pagination.currentPage,
                    totalPages: pagination.totalPages,
                    totalRecords: pagination.totalRecords,
                    pageSize: pagination.limit || 10,
                    onPageChange: (page) => setFilters(prev => ({ ...prev, page })),
                    hasPreviousPage: pagination.hasPreviousPage,
                    hasNextPage: pagination.hasNextPage
                } : undefined}
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

export default AttributeList;
