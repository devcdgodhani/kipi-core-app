import React, { useEffect, useState, useCallback } from 'react';
import {
    Search,
    Filter,
    Plus,
    Edit2,
    Trash2,
    RotateCcw,
    Barcode,
    Layers,
    IndianRupee,
    Box
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { skuService } from '../../services/sku.service';
import { productService } from '../../services/product.service';
import { type ISku, type ISkuFilters, SKU_STATUS } from '../../types/sku';
import { type IProduct } from '../../types/product';
import CustomButton from '../../components/common/Button';
import { Table, type Column } from '../../components/common/Table';
import { CommonFilter, type FilterField } from '../../components/common/CommonFilter';
import { ROUTES } from '../../routes/routeConfig';
import { PopupModal } from '../../components/common/PopupModal';

const SkuList: React.FC = () => {
    const navigate = useNavigate();
    const [skus, setSkus] = useState<ISku[]>([]);
    const [products, setProducts] = useState<IProduct[]>([]);
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

    // Filters & Pagination State
    const [filters, setFilters] = useState<ISkuFilters>({
        search: '',
        status: undefined,
        productId: undefined,
        page: 1,
        limit: 10,
        isPaginate: true
    });

    const [pagination, setPagination] = useState({
        totalRecords: 0,
        totalPages: 0,
        currentPage: 1
    });

    const fetchDependencies = useCallback(async () => {
        try {
            const prodRes = await productService.getAll({});
            if (prodRes?.data) setProducts(prodRes.data);
        } catch (err) {
            console.error('Failed to fetch dependencies', err);
        }
    }, []);

    const fetchSkus = useCallback(async () => {
        try {
            setLoading(true);
            const response = await skuService.getWithPagination(filters);
            if (response && response.data) {
                setSkus(response.data.recordList);
                setPagination({
                    totalRecords: response.data.totalRecords,
                    totalPages: response.data.totalPages,
                    currentPage: response.data.currentPage
                });
            }
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to fetch SKUs');
        } finally {
            setLoading(false);
        }
    }, [filters]);

    useEffect(() => {
        fetchDependencies();
    }, [fetchDependencies]);

    useEffect(() => {
        const timer = setTimeout(() => {
            fetchSkus();
        }, 300);
        return () => clearTimeout(timer);
    }, [fetchSkus]);

    const handleFilterChange = (updatedFilters: Record<string, any>) => {
        setFilters(prev => ({ ...prev, ...updatedFilters, page: 1 }));
    };

    const handleLimitChange = (newLimit: number) => {
        setFilters(prev => ({ ...prev, limit: newLimit, page: 1 }));
    };

    const handleDeleteSku = async (id: string) => {
        setPopup({
            isOpen: true,
            title: 'Delete SKU',
            message: 'Are you sure you want to delete this SKU variant?',
            type: 'confirm',
            onConfirm: async () => {
                try {
                    setPopup(prev => ({ ...prev, loading: true }));
                    await skuService.delete(id);
                    fetchSkus();
                    setPopup(prev => ({ ...prev, isOpen: false, loading: false }));
                } catch (err: any) {
                    setPopup({
                        isOpen: true,
                        title: 'Error',
                        message: err.response?.data?.message || 'Failed to delete SKU',
                        type: 'alert',
                        onConfirm: () => setPopup(prev => ({ ...prev, isOpen: false }))
                    });
                }
            }
        });
    };

    const filterFields: FilterField[] = [
        {
            key: 'productId',
            label: 'Parent Product',
            type: 'select',
            options: products.map(p => ({ label: p.name, value: p._id }))
        },
        {
            key: 'status',
            label: 'Status',
            type: 'select',
            multiple: true,
            options: [
                { label: 'Active', value: SKU_STATUS.ACTIVE },
                { label: 'Inactive', value: SKU_STATUS.INACTIVE },
                { label: 'Out Of Stock', value: SKU_STATUS.OUT_OF_STOCK }
            ]
        }
    ];

    const activeFilterCount = Object.keys(filters).filter(k =>
        !['page', 'limit', 'isPaginate', 'search'].includes(k) &&
        filters[k as keyof ISkuFilters] !== undefined &&
        (Array.isArray(filters[k as keyof ISkuFilters]) ? (filters[k as keyof ISkuFilters] as any[]).length > 0 : true)
    ).length;

    const columns: Column<ISku>[] = [
        {
            header: 'SKU Identifier',
            key: 'skuCode',
            render: (sku) => (
                <div className="flex items-center gap-4 py-1">
                    <div className="w-12 h-12 rounded-xl bg-gray-50 border border-gray-100 flex items-center justify-center text-primary group-hover:scale-105 transition-all">
                        <Barcode size={24} />
                    </div>
                    <div className="flex flex-col">
                        <span className="font-black text-gray-900 leading-tight uppercase tracking-tight">{sku.skuCode}</span>
                        <div className="flex items-center gap-2 mt-1">
                            <span className="text-[10px] font-bold text-primary flex items-center gap-1">
                                <Layers size={10} />
                                {typeof sku.productId === 'object' ? (sku.productId as any).name : 'Linked Product'}
                            </span>
                        </div>
                    </div>
                </div>
            )
        },
        {
            header: 'Variant Config',
            key: 'attributes',
            render: (sku) => (
                <div className="flex flex-wrap gap-1 max-w-[200px]">
                    {sku.variantAttributes?.map((attr: any, idx) => (
                        <span key={idx} className="px-2 py-1 rounded-lg bg-primary/5 text-[10px] font-bold text-primary border border-primary/10">
                            {attr.value}
                        </span>
                    ))}
                    {(!sku.variantAttributes || sku.variantAttributes.length === 0) && (
                        <span className="text-xs text-gray-400 italic">No Variants</span>
                    )}
                </div>
            )
        },
        {
            header: 'Price Hub',
            key: 'price',
            render: (sku) => (
                <div className="flex flex-col gap-0.5 py-1">
                    <div className="flex items-center gap-1 text-xs font-black text-gray-900">
                        <IndianRupee size={12} className="text-primary/50" />
                        <span>{sku.salePrice || sku.basePrice || 'Inherited'}</span>
                    </div>
                    {sku.basePrice && (
                        <span className="text-[10px] text-gray-400 italic font-medium">Custom Override</span>
                    )}
                </div>
            )
        },
        {
            header: 'Inventory',
            key: 'quantity',
            render: (sku) => (
                <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest w-fit border ${sku.quantity > 50
                    ? 'bg-emerald-50 text-emerald-600 border-emerald-100'
                    : sku.quantity > 0
                        ? 'bg-amber-50 text-amber-600 border-amber-100'
                        : 'bg-rose-50 text-rose-500 border-rose-100'
                    }`}>
                    <Box size={12} />
                    {sku.quantity} Units
                </div>
            )
        },
        {
            header: 'Status',
            key: 'status',
            render: (sku) => (
                <div className={`inline-flex items-center px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${sku.status === SKU_STATUS.ACTIVE
                        ? 'bg-emerald-50 text-emerald-600 border-emerald-100'
                        : 'bg-gray-50 text-gray-400 border-gray-100'
                    }`}>
                    {sku.status}
                </div>
            )
        },
        {
            header: 'Actions',
            key: 'actions',
            align: 'right' as const,
            render: (sku) => (
                <div className="flex items-center justify-end gap-2">
                    <button
                        onClick={() => navigate('/' + ROUTES.DASHBOARD.SKUS_EDIT.replace(':id', sku._id))}
                        className="p-2.5 text-primary hover:bg-primary/5 rounded-xl transition-all"
                        title="Edit SKU"
                    >
                        <Edit2 size={18} />
                    </button>
                    <button
                        onClick={() => handleDeleteSku(sku._id)}
                        className="p-2.5 text-rose-500 hover:bg-rose-50 rounded-xl transition-all"
                        title="Delete SKU"
                    >
                        <Trash2 size={18} />
                    </button>
                </div>
            )
        }
    ];

    return (
        <div className="p-6 space-y-6">
            {error && (
                <div className="absolute top-4 right-4 bg-red-50 border border-red-100 text-red-600 px-4 py-3 rounded-xl z-20 animate-in fade-in slide-in-from-top-4 duration-300">
                    <span className="text-sm font-medium">{error}</span>
                </div>
            )}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-[2rem] border border-primary/5 shadow-sm">
                <div>
                    <h1 className="text-3xl font-black text-primary tracking-tight uppercase font-mono">SKU Variants</h1>
                    <p className="text-sm text-gray-500 font-medium">Manage individual product instances and specific stock units</p>
                </div>
                <CustomButton onClick={() => navigate('/' + ROUTES.DASHBOARD.SKUS_CREATE)} className="rounded-2xl shadow-xl shadow-primary/20 h-14 px-8">
                    <Plus size={20} className="mr-2" /> Establish SKU
                </CustomButton>
            </div>

            <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1 relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-primary/40" size={20} />
                    <input
                        type="text"
                        placeholder="Search by SKU code..."
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
                                productId: undefined,
                                page: 1,
                                limit: 10,
                                isPaginate: true
                            })}
                            className="px-4 py-4 rounded-3xl bg-rose-50 border-2 border-rose-100 text-rose-500 hover:bg-rose-100 transition-all font-black uppercase text-[10px] tracking-widest flex items-center gap-2"
                        >
                            <RotateCcw size={14} /> Clear
                        </button>
                    )}
                    <button
                        onClick={() => setIsFilterOpen(true)}
                        className={`px-6 py-4 rounded-3xl border-2 flex items-center gap-3 transition-all font-black uppercase text-[10px] tracking-widest ${activeFilterCount > 0
                            ? 'bg-primary border-primary text-white shadow-lg shadow-primary/20'
                            : 'bg-white border-primary/5 text-primary hover:bg-primary/5'
                            }`}
                    >
                        <Filter size={18} /> Filters
                        {activeFilterCount > 0 && (
                            <span className="w-5 h-5 bg-white text-primary rounded-full flex items-center justify-center text-[10px]">
                                {activeFilterCount}
                            </span>
                        )}
                    </button>

                    <div className="flex items-center gap-1 bg-white border-2 border-primary/5 rounded-3xl px-4 py-2 shadow-lg shadow-gray-100/50">
                        <span className="text-[10px] font-black text-gray-400 uppercase tracking-tighter">View</span>
                        <select
                            value={filters.limit}
                            onChange={(e) => handleLimitChange(Number(e.target.value))}
                            className="bg-transparent focus:outline-none font-bold text-primary pl-1 cursor-pointer"
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
                data={skus}
                columns={columns}
                isLoading={loading}
                keyExtractor={(sku) => sku._id}
                emptyMessage="No SKU variants found"
                pagination={pagination.totalRecords > 0 ? {
                    currentPage: pagination.currentPage,
                    totalPages: pagination.totalPages,
                    totalRecords: pagination.totalRecords,
                    pageSize: filters.limit || 10,
                    onPageChange: (page) => setFilters(prev => ({ ...prev, page })),
                    hasPreviousPage: pagination.currentPage > 1,
                    hasNextPage: pagination.currentPage < pagination.totalPages
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

export default SkuList;
