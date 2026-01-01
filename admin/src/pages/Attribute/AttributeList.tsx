import React, { useEffect, useState, useCallback } from 'react';
import {
    Search,
    Filter,
    Plus,
    Edit2,
    Trash2,
    RotateCcw,
    Sliders,
    Type,
    CheckCircle2,
    XCircle
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { attributeService } from '../../services/attribute.service';
import type { IAttribute, IAttributeFilter, IPaginationData } from '../../types/attribute';
import { ATTRIBUTE_STATUS, ATTRIBUTE_VALUE_TYPE, ATTRIBUTE_INPUT_TYPE } from '../../types/attribute';
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
            header: 'Name',
            key: 'name',
            render: (attr) => (
                <div className="flex flex-col">
                    <span className="font-bold text-gray-900">{attr.name}</span>
                    <span className="text-[10px] font-medium text-gray-400 uppercase tracking-widest">{attr.slug}</span>
                </div>
            )
        },
        {
            header: 'Type',
            key: 'valueType',
            render: (attr) => (
                <div className="flex items-center gap-2">
                    <div className="p-1.5 rounded-lg bg-indigo-50 text-indigo-500">
                        <Type size={14} />
                    </div>
                    <span className="text-sm font-medium text-gray-700">{attr.valueType}</span>
                </div>
            )
        },
        {
            header: 'Input',
            key: 'inputType',
            render: (attr) => (
                <div className="flex items-center gap-2">
                    <div className="p-1.5 rounded-lg bg-violet-50 text-violet-500">
                        <Sliders size={14} />
                    </div>
                    <span className="text-sm font-medium text-gray-700 uppercase text-xs tracking-wider">{attr.inputType.replace('_', ' ')}</span>
                </div>
            )
        },
        {
            header: 'Variant',
            key: 'isVariant',
            align: 'center',
            render: (attr) => attr.isVariant ? (
                <div className="inline-flex p-1 rounded-full bg-emerald-50 text-emerald-500"><CheckCircle2 size={16} /></div>
            ) : (
                <div className="inline-flex p-1 rounded-full bg-gray-50 text-gray-300"><XCircle size={16} /></div>
            )
        },
        {
            header: 'Filterable',
            key: 'isFilterable',
            align: 'center',
            render: (attr) => attr.isFilterable ? (
                <div className="inline-flex p-1 rounded-full bg-blue-50 text-blue-500"><CheckCircle2 size={16} /></div>
            ) : (
                <div className="inline-flex p-1 rounded-full bg-gray-50 text-gray-300"><XCircle size={16} /></div>
            )
        },
        {
            header: 'Status',
            key: 'status',
            align: 'center',
            render: (attr) => (
                <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${attr.status === ATTRIBUTE_STATUS.ACTIVE
                    ? 'bg-emerald-50 text-emerald-600 border border-emerald-100'
                    : 'bg-gray-50 text-gray-500 border border-gray-100'
                    }`}>
                    {attr.status}
                </span>
            )
        },
        {
            header: 'Actions',
            key: 'actions',
            align: 'right',
            render: (attr) => (
                <div className="flex items-center justify-end gap-2 ">
                    <button
                        onClick={() => navigate('/' + ROUTES.DASHBOARD.ATTRIBUTES_EDIT.replace(':id', attr._id))}
                        className="p-2 text-primary hover:bg-primary/5 rounded-xl transition-all"
                        title="Edit"
                    >
                        <Edit2 size={16} />
                    </button>
                    <button
                        onClick={() => handleDeleteAttribute(attr._id)}
                        className="p-2 text-rose-500 hover:bg-rose-50 rounded-xl transition-all"
                        title="Delete"
                    >
                        <Trash2 size={16} />
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
                <div className="absolute top-4 right-4 bg-red-50 border border-red-100 text-red-600 px-4 py-3 rounded-xl z-20 animate-in fade-in slide-in-from-top-4 duration-300">
                    <span className="text-sm font-medium">{error}</span>
                </div>
            )}

            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-[2rem] border border-primary/5 shadow-sm">
                <div>
                    <h1 className="text-3xl font-black text-primary tracking-tight uppercase font-mono">Attributes</h1>
                    <p className="text-sm text-gray-500 font-medium">Manage dynamic product attributes and variations</p>
                </div>
                <div className="flex gap-3">
                    <button
                        onClick={() => navigate('/' + ROUTES.DASHBOARD.ATTRIBUTES_CREATE)}
                        className="p-3 bg-primary text-white rounded-2xl hover:bg-primary/90 transition-all shadow-lg shadow-primary/20"
                        title="Add Attribute"
                    >
                        <Plus size={20} />
                    </button>
                </div>
            </div>

            <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1 relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-primary/40" size={20} />
                    <input
                        type="text"
                        placeholder="Search attributes..."
                        value={filters.search}
                        onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value, page: 1 }))}
                        className="w-full bg-white border-2 border-primary/5 rounded-3xl py-4 pl-12 pr-4 focus:outline-none focus:border-primary/20 transition-all font-bold text-gray-700 shadow-xl shadow-gray-100/50"
                    />
                </div>

                <div className="flex gap-3">
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
                            className="px-4 py-4 rounded-3xl bg-rose-50 border-2 border-rose-100 text-rose-500 hover:bg-rose-100 transition-all font-black uppercase text-[10px] tracking-widest flex items-center gap-2"
                        >
                            <RotateCcw size={14} />
                            Clear
                        </button>
                    )}
                    <button
                        onClick={() => setIsFilterOpen(true)}
                        className={`px-6 py-4 rounded-3xl border-2 flex items-center gap-3 transition-all font-black uppercase text-[10px] tracking-widest ${activeFilterCount > 0
                            ? 'bg-primary border-primary text-white shadow-lg shadow-primary/20'
                            : 'bg-white border-primary/5 text-primary hover:bg-primary/5'
                            }`}
                    >
                        <Filter size={18} />
                        Filters
                    </button>
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
                emptyMessage="No attributes found"
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
