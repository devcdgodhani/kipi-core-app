import React, { useEffect, useState, useCallback } from 'react';
import {
    Search,
    Filter,
    Plus,
    Edit2,
    Trash2,
    RotateCcw,
    Image as ImageIcon,
    Tag,
    IndianRupee,
    Box
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { productService } from '../../services/product.service';
import { categoryService } from '../../services/category.service';
import { type IProduct, type IProductFilters, PRODUCT_STATUS } from '../../types/product';
import { type ICategory } from '../../types/category';
import CustomButton from '../../components/common/Button';
import { Table, type Column } from '../../components/common/Table';
import { CommonFilter, type FilterField } from '../../components/common/CommonFilter';
import { ROUTES } from '../../routes/routeConfig';
import { PopupModal } from '../../components/common/PopupModal';

const ProductList: React.FC = () => {
    const navigate = useNavigate();
    const [products, setProducts] = useState<IProduct[]>([]);
    const [categories, setCategories] = useState<ICategory[]>([]);
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
    const [filters, setFilters] = useState<IProductFilters>({
        search: '',
        status: undefined,
        categoryIds: undefined,
        page: 1,
        limit: 10,
        isPaginate: true
    });

    const [pagination, setPagination] = useState({
        totalRecords: 0,
        totalPages: 0,
        currentPage: 1
    });

    const fetchCategories = useCallback(async () => {
        try {
            const response = await categoryService.getAll({});
            if (response && response.data) {
                setCategories(response.data);
            }
        } catch (err) {
            console.error('Failed to fetch categories', err);
        }
    }, []);

    const fetchProducts = useCallback(async () => {
        try {
            setLoading(true);
            const response = await productService.getWithPagination(filters);
            if (response && response.data) {
                setProducts(response.data.recordList);
                setPagination({
                    totalRecords: response.data.totalRecords,
                    totalPages: response.data.totalPages,
                    currentPage: response.data.currentPage
                });
            }
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to fetch products');
        } finally {
            setLoading(false);
        }
    }, [filters]);

    useEffect(() => {
        fetchCategories();
    }, [fetchCategories]);

    useEffect(() => {
        const timer = setTimeout(() => {
            fetchProducts();
        }, 300);
        return () => clearTimeout(timer);
    }, [fetchProducts]);

    const handleFilterChange = (updatedFilters: Record<string, any>) => {
        setFilters(prev => ({ ...prev, ...updatedFilters, page: 1 }));
    };

    const handleLimitChange = (newLimit: number) => {
        setFilters(prev => ({ ...prev, limit: newLimit, page: 1 }));
    };

    const handleDeleteProduct = async (id: string) => {
        setPopup({
            isOpen: true,
            title: 'Delete Product',
            message: 'Are you sure you want to delete this product? This action cannot be undone.',
            type: 'confirm',
            onConfirm: async () => {
                try {
                    setPopup(prev => ({ ...prev, loading: true }));
                    await productService.delete(id);
                    fetchProducts();
                    setPopup(prev => ({ ...prev, isOpen: false, loading: false }));
                } catch (err: any) {
                    setPopup({
                        isOpen: true,
                        title: 'Error',
                        message: err.response?.data?.message || 'Failed to delete product',
                        type: 'alert',
                        onConfirm: () => setPopup(prev => ({ ...prev, isOpen: false }))
                    });
                }
            }
        });
    };

    const filterFields: FilterField[] = [
        {
            key: 'categoryIds',
            label: 'Categories',
            type: 'select',
            multiple: true,
            options: categories.map(cat => ({ label: cat.name, value: cat._id }))
        },
        {
            key: 'status',
            label: 'Status',
            type: 'select',
            multiple: true,
            options: [
                { label: 'Active', value: PRODUCT_STATUS.ACTIVE },
                { label: 'Inactive', value: PRODUCT_STATUS.INACTIVE },
                { label: 'Draft', value: PRODUCT_STATUS.DRAFT },
                { label: 'Archived', value: PRODUCT_STATUS.ARCHIVED }
            ]
        }
    ];

    const activeFilterCount = Object.keys(filters).filter(k =>
        !['page', 'limit', 'isPaginate', 'search'].includes(k) &&
        filters[k as keyof IProductFilters] !== undefined &&
        (Array.isArray(filters[k as keyof IProductFilters]) ? (filters[k as keyof IProductFilters] as any[]).length > 0 : true)
    ).length;

    const columns: Column<IProduct>[] = [
        {
            header: 'Product Info',
            key: 'info',
            render: (product) => (
                <div className="flex items-center gap-4 py-1">
                    <div className="relative group">
                        {product.mainImage ? (
                            <img
                                src={product.mainImage}
                                alt={product.name}
                                className="w-14 h-14 rounded-2xl object-cover border border-primary/10 shadow-inner group-hover:scale-105 transition-transform duration-300"
                            />
                        ) : (
                            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center text-primary font-black border border-primary/10 shadow-inner group-hover:scale-105 transition-transform duration-300">
                                <ImageIcon size={24} />
                            </div>
                        )}
                        <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white shadow-sm ${product.status === PRODUCT_STATUS.ACTIVE ? 'bg-green-500' :
                            product.status === PRODUCT_STATUS.DRAFT ? 'bg-amber-400' :
                                'bg-gray-400'}`} />
                    </div>
                    <div className="flex flex-col max-w-[200px]">
                        <span className="font-bold text-gray-900 leading-tight truncate">{product.name}</span>
                        <span className="text-[10px] text-gray-400 font-mono mt-0.5 truncate">{product.slug}</span>
                        <div className="flex items-center gap-2 mt-1">
                            <span className="px-2 py-0.5 rounded-md bg-primary/5 text-[10px] font-black text-primary uppercase tracking-tighter border border-primary/10">ID: {product._id.slice(-6)}</span>
                        </div>
                    </div>
                </div>
            )
        },
        {
            header: 'Categories',
            key: 'categories',
            render: (product) => (
                <div className="flex flex-wrap gap-1 max-w-[200px]">
                    {Array.isArray(product.categoryIds) ? (
                        product.categoryIds.map((cat: any) => (
                            <span key={typeof cat === 'string' ? cat : cat._id} className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-gray-50 text-[10px] font-bold text-gray-600 border border-gray-100">
                                <Tag size={10} />
                                {typeof cat === 'string' ? cat : cat.name}
                            </span>
                        ))
                    ) : (
                        <span className="text-xs text-gray-400 italic">No Categories</span>
                    )}
                </div>
            )
        },
        {
            header: 'Pricing',
            key: 'pricing',
            render: (product) => (
                <div className="flex flex-col gap-0.5 py-1">
                    <div className="flex items-center gap-1 text-xs font-bold text-gray-900">
                        <IndianRupee size={12} className="text-primary/50" />
                        <span>{product.salePrice || product.basePrice}</span>
                    </div>
                    {product.salePrice && product.salePrice < product.basePrice && (
                        <div className="text-[10px] text-gray-400 line-through">
                            ₹{product.basePrice}
                        </div>
                    )}
                    {(product.discount || 0) > 0 && (
                        <span className="text-[10px] font-black text-rose-500 uppercase tracking-tighter">
                            {product.discount}% OFF
                        </span>
                    )}
                </div>
            )
        },
        {
            header: 'Stock',
            key: 'stock',
            render: (product) => (
                <div className="flex flex-col gap-1">
                    <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest w-fit border ${product.stock > 10
                        ? 'bg-emerald-50 text-emerald-600 border-emerald-100'
                        : product.stock > 0
                            ? 'bg-amber-50 text-amber-600 border-amber-100'
                            : 'bg-rose-50 text-rose-500 border-rose-100'
                        }`}>
                        <Box size={12} />
                        {product.stock} Units
                    </div>
                    <span className="text-[10px] font-bold text-gray-400 px-1 italic">
                        Available in SKUs
                    </span>
                </div>
            )
        },
        {
            header: 'Action / Status',
            key: 'actions',
            align: 'right' as const,
            render: (product) => (
                <div className="flex items-center justify-end gap-3">
                    <div className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-[0.1em] border-2 ${product.status === PRODUCT_STATUS.ACTIVE
                        ? 'bg-green-500 border-green-500 text-white'
                        : product.status === PRODUCT_STATUS.DRAFT
                            ? 'bg-amber-400 border-amber-400 text-white'
                            : 'bg-white border-gray-100 text-gray-400'
                        }`}>
                        {product.status}
                    </div>

                    <div className="h-8 w-px bg-gray-100 mx-1" />

                    <div className="flex items-center gap-1">
                        <button
                            onClick={() => navigate('/' + ROUTES.DASHBOARD.PRODUCTS_EDIT.replace(':id', product._id))}
                            className="p-3 text-primary hover:bg-primary/5 rounded-2xl transition-all hover:scale-110 active:scale-90 border border-transparent hover:border-primary/10"
                            title="Edit Product"
                        >
                            <Edit2 size={18} />
                        </button>
                        <button
                            onClick={() => handleDeleteProduct(product._id)}
                            className="p-3 text-rose-500 hover:bg-rose-50 rounded-2xl transition-all hover:scale-110 active:scale-90 border border-transparent hover:border-rose-100"
                            title="Delete Product"
                        >
                            <Trash2 size={18} />
                        </button>
                    </div>
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
                    <h1 className="text-3xl font-black text-primary tracking-tight uppercase font-mono">Products</h1>
                    <p className="text-sm text-gray-500 font-medium">Manage your product catalog, pricing and inventory</p>
                </div>
                <CustomButton onClick={() => navigate('/' + ROUTES.DASHBOARD.PRODUCTS_CREATE)} className="rounded-2xl shadow-xl shadow-primary/20 h-14 px-8">
                    <Plus size={20} className="mr-2" /> Add New Product
                </CustomButton>
            </div>

            <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1 relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-primary/40" size={20} />
                    <input
                        type="text"
                        placeholder="Search products by name or slug..."
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
                                categoryIds: undefined,
                                page: 1,
                                limit: 10,
                                isPaginate: true
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
                        Advanced Filters
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
                            <option value={100}>100</option>
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
                data={products}
                columns={columns}
                isLoading={loading}
                keyExtractor={(product) => product._id}
                emptyMessage="No products found"
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

export default ProductList;
