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
    Box,
    Cpu
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
            header: 'Variant SKU',
            key: 'skuCode',
            render: (sku) => (
                <div className="flex items-center gap-4 py-1">
                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center text-primary border border-primary/10 shadow-inner group-hover:scale-110 transition-transform duration-500">
                        <Barcode size={26} />
                    </div>
                    <div className="flex flex-col">
                        <span className="font-black text-gray-900 leading-tight uppercase tracking-tight">{sku.skuCode}</span>
                        <div className="flex items-center gap-2 mt-1">
                            <span className="text-[10px] font-black text-primary/40 flex items-center gap-1 uppercase tracking-widest leading-none">
                                <Layers size={10} />
                                {typeof sku.productId === 'object' ? (sku.productId as any).name : 'Linked Product'}
                            </span>
                        </div>
                    </div>
                </div>
            )
        },
        {
            header: 'Specifications',
            key: 'attributes',
            render: (sku) => (
                <div className="flex flex-wrap gap-1.5 max-w-[200px]">
                    {sku.variantAttributes?.map((attr: any, idx) => (
                        <span key={idx} className="px-2.5 py-1 rounded-xl bg-primary/5 text-[9px] font-black text-primary uppercase tracking-widest border border-primary/10 shadow-xs">
                            {attr.value}
                        </span>
                    ))}
                    {(!sku.variantAttributes || sku.variantAttributes.length === 0) && (
                        <span className="text-[10px] text-gray-300 font-black uppercase tracking-widest italic opacity-50">No Attributes</span>
                    )}
                </div>
            )
        },
        {
            header: 'Market Valuation',
            key: 'price',
            render: (sku) => (
                <div className="flex flex-col py-1">
                    <div className="flex items-center gap-1.5 text-base font-black text-gray-900 tracking-tight leading-none">
                        <IndianRupee size={14} className="text-primary" />
                        <span>{(sku.salePrice || sku.basePrice || 0).toLocaleString()}</span>
                    </div>
                    {sku.basePrice && !sku.salePrice && (
                        <span className="text-[9px] text-primary/40 font-black uppercase tracking-widest mt-1 italic">Override Config</span>
                    )}
                </div>
            )
        },
        {
            header: 'Quantum Reserve',
            key: 'quantity',
            render: (sku) => (
                <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-[10px] font-black uppercase tracking-widest w-fit border shadow-sm ${sku.quantity > 50
                    ? 'bg-emerald-50 text-emerald-600 border-emerald-100'
                    : sku.quantity > 0
                        ? 'bg-amber-50 text-amber-600 border-amber-100'
                        : 'bg-rose-50 text-rose-500 border-rose-100 uppercase'
                    }`}>
                    <Box size={12} />
                    {sku.quantity} Units
                </div>
            )
        },
        {
            header: 'Strategic State',
            key: 'status',
            render: (sku) => {
                const colors: any = {
                    ACTIVE: 'bg-emerald-50 text-emerald-600 border-emerald-100',
                    OUT_OF_STOCK: 'bg-rose-50 text-rose-500 border-rose-100',
                    INACTIVE: 'bg-gray-50 text-gray-400 border-gray-100'
                };
                return (
                    <span className={`px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-[0.1em] border ${colors[sku.status] || 'bg-gray-50 text-gray-600 border-gray-100'}`}>
                        {sku.status.replace('_', ' ')}
                    </span>
                );
            }
        },
        {
            header: 'Actions',
            key: 'actions',
            align: 'right' as const,
            render: (sku) => (
                <div className="flex items-center justify-end gap-2">
                    <button
                        onClick={() => navigate('/' + ROUTES.DASHBOARD.SKUS_EDIT.replace(':id', sku._id))}
                        className="p-3 text-gray-400 hover:text-primary hover:bg-primary/5 rounded-2xl transition-all border border-transparent hover:border-primary/10 group"
                        title="Modulate Variant"
                    >
                        <Edit2 size={18} className="group-hover:scale-110 transition-transform" />
                    </button>
                    <button
                        onClick={() => handleDeleteSku(sku._id)}
                        className="p-3 text-gray-400 hover:text-rose-500 hover:bg-rose-50 rounded-2xl transition-all border border-transparent hover:border-rose-100 group"
                        title="Decommission SKU"
                    >
                        <Trash2 size={18} className="group-hover:scale-110 transition-transform" />
                    </button>
                </div>
            )
        }
    ];

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
                    <div className="w-16 h-16 rounded-[1.5rem] bg-amber-500 flex items-center justify-center text-white shadow-xl shadow-amber-500/20">
                        <Cpu size={32} />
                    </div>
                    <div>
                        <h1 className="text-3xl font-black text-primary tracking-tight uppercase font-mono">SKU Variants</h1>
                        <p className="text-sm text-gray-500 font-medium">Fine-grained instance management for inventory control</p>
                    </div>
                </div>
                <div className="flex items-center gap-4 relative z-10">
                    <div className="bg-primary/5 px-6 py-3 rounded-2xl border border-primary/10 flex flex-col items-center">
                        <span className="text-[10px] font-black text-primary/40 uppercase tracking-widest leading-none mb-1">Variant Units</span>
                        <span className="text-2xl font-black text-primary">{pagination.totalRecords}</span>
                    </div>
                    <CustomButton onClick={() => navigate('/' + ROUTES.DASHBOARD.SKUS_CREATE)} className="rounded-[1.5rem] shadow-xl shadow-primary/20 h-16 px-8 text-sm uppercase tracking-widest font-black">
                        <Plus size={20} className="mr-2" /> Establish SKU
                    </CustomButton>
                </div>
            </div>

            {/* Advanced Search & Filtering Ecosystem */}
            <div className="flex flex-col xl:flex-row gap-4">
                <div className="flex-1 relative group">
                    <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-primary/40 group-focus-within:text-primary transition-colors duration-300" size={22} />
                    <input
                        type="text"
                        placeholder="Scan catalog by SKU Identity or Reference..."
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
                        Intelligence filter
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
                                productId: undefined,
                                page: 1,
                                limit: 10,
                                isPaginate: true
                            })}
                            className="px-6 py-4 rounded-[2rem] bg-rose-50 border-2 border-rose-100 text-rose-500 hover:bg-rose-100 transition-all font-black uppercase text-[10px] tracking-widest flex items-center gap-2 shadow-xl shadow-rose-100/50 h-16"
                        >
                            <RotateCcw size={16} /> Reset
                        </button>
                    )}

                    <div className="flex items-center gap-3 bg-white border-2 border-primary/5 rounded-[2rem] px-6 py-2 shadow-xl shadow-gray-100/30 h-16">
                        <span className="text-[10px] font-black text-gray-300 uppercase tracking-widest">Viewport</span>
                        <select
                            value={filters.limit}
                            onChange={(e) => handleLimitChange(Number(e.target.value))}
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
                data={skus}
                columns={columns}
                isLoading={loading}
                keyExtractor={(sku) => sku._id}
                emptyMessage="No strategic SKU units discovered in this sector"
                onRowClick={(sku) => navigate('/' + ROUTES.DASHBOARD.SKUS_EDIT.replace(':id', sku._id))}
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
