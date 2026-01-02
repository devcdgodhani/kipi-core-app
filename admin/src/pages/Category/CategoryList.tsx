import React, { useEffect, useState, useCallback, useMemo } from 'react';
import {
    Search,
    Filter,
    Plus,
    Edit2,
    Trash2,
    RotateCcw,
    ChevronDown,
    ChevronRight,
    Image as ImageIcon,
    Network
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { categoryService } from '../../services/category.service';
import type { ICategory, ICategoryFilters } from '../../types/category';
import { CATEGORY_STATUS } from '../../types/category';
import { CommonFilter, type FilterField } from '../../components/common/CommonFilter';
import { Table, type Column } from '../../components/common/Table';
import { ROUTES } from '../../routes/routeConfig';
import { PopupModal } from '../../components/common/PopupModal';

// Extended interface for flattened tree
interface ICategoryWithLevel extends ICategory {
    level: number;
}

const CategoryList: React.FC = () => {
    const navigate = useNavigate();
    const [categories, setCategories] = useState<ICategory[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isFilterOpen, setIsFilterOpen] = useState(false);
    const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());
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

    const isTreeView = true;

    // Filters State
    const [filters, setFilters] = useState<ICategoryFilters>({
        search: '',
        status: undefined,
        isTree: true
    });

    const fetchCategories = useCallback(async () => {
        try {
            setLoading(true);
            const response = await categoryService.getAll({ ...filters, isTree: isTreeView });
            if (response && response.data) {
                setCategories(response.data);
            }
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to fetch categories');
        } finally {
            setLoading(false);
        }
    }, [filters, isTreeView]);

    useEffect(() => {
        fetchCategories();
    }, [fetchCategories]);

    const handleFilterChange = (updatedFilters: Record<string, any>) => {
        setFilters(prev => ({ ...prev, ...updatedFilters }));
    };

    const handleDeleteCategory = async (id: string) => {
        setPopup({
            isOpen: true,
            title: 'Delete Category',
            message: 'Are you sure you want to delete this category? This might affect sub-categories.',
            type: 'confirm',
            onConfirm: async () => {
                try {
                    setPopup(prev => ({ ...prev, loading: true }));
                    await categoryService.delete(id);
                    fetchCategories();
                    setPopup(prev => ({ ...prev, isOpen: false, loading: false }));
                } catch (err: any) {
                    setPopup({
                        isOpen: true,
                        title: 'Error',
                        message: err.response?.data?.message || 'Failed to delete category',
                        type: 'alert',
                        onConfirm: () => setPopup(prev => ({ ...prev, isOpen: false }))
                    });
                }
            }
        });
    };

    const toggleExpand = (id: string) => {
        const newSet = new Set(expandedIds);
        if (newSet.has(id)) {
            newSet.delete(id);
        } else {
            newSet.add(id);
        }
        setExpandedIds(newSet);
    };

    const flattenedCategories = useMemo(() => {
        const result: ICategoryWithLevel[] = [];
        const process = (cats: ICategory[], level: number) => {
            for (const cat of cats) {
                result.push({ ...cat, level });
                if (cat.children && cat.children.length > 0 && expandedIds.has(cat._id)) {
                    process(cat.children, level + 1);
                }
            }
        };
        process(categories, 0);
        return result;
    }, [categories, expandedIds]);

    const filterFields: FilterField[] = [
        {
            key: 'status',
            label: 'Status',
            type: 'select',
            multiple: true,
            options: [
                { label: 'Active', value: CATEGORY_STATUS.ACTIVE },
                { label: 'Inactive', value: CATEGORY_STATUS.INACTIVE }
            ]
        }
    ];

    const activeFilterCount = Object.keys(filters).filter(k =>
        !['search', 'isTree'].includes(k) &&
        filters[k as keyof ICategoryFilters] !== undefined &&
        (Array.isArray(filters[k as keyof ICategoryFilters]) ? (filters[k as keyof ICategoryFilters] as any[]).length > 0 : true)
    ).length;

    const columns: Column<ICategoryWithLevel>[] = [
        {
            header: 'Hierarchy / Category Name',
            key: 'name',
            render: (cat) => {
                const hasChildren = cat.children && cat.children.length > 0;
                return (
                    <div style={{ paddingLeft: `${cat.level * 32}px` }} className="flex items-center gap-4 py-1 group">
                        <button
                            onClick={(e) => { e.stopPropagation(); toggleExpand(cat._id); }}
                            className={`p-1.5 rounded-lg transition-all ${hasChildren ? 'bg-primary/5 text-primary hover:bg-primary/20 hover:scale-110 shadow-sm' : 'text-transparent pointer-events-none'}`}
                        >
                            {hasChildren ? (
                                expandedIds.has(cat._id) ? <ChevronDown size={14} /> : <ChevronRight size={14} />
                            ) : (
                                <div className="w-3.5 h-3.5" />
                            )}
                        </button>
                        <div className="flex flex-col">
                            <span className={`font-black uppercase tracking-tight ${cat.level === 0 ? 'text-gray-900 text-sm' : 'text-gray-600 text-[13px]'}`}>{cat.name}</span>
                            <span className="text-[9px] font-black text-primary/40 uppercase tracking-[0.2em] mt-0.5">{cat.slug}</span>
                        </div>
                    </div>
                );
            }
        },
        {
            header: 'Visual Identity',
            key: 'image',
            align: 'center',
            render: (cat) => (
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/5 shadow-inner flex items-center justify-center overflow-hidden mx-auto group-hover:scale-110 transition-transform duration-500">
                    {cat.image?.preSignedUrl ? (
                        <img src={cat.image.preSignedUrl} alt="" className="w-full h-full object-cover" />
                    ) : (
                        <ImageIcon size={20} className="text-primary/30" />
                    )}
                </div>
            )
        },
        {
            header: 'Strategic Status',
            key: 'status',
            align: 'center',
            render: (cat) => (
                cat.status === CATEGORY_STATUS.ACTIVE ? (
                    <span className="px-4 py-1.5 rounded-xl bg-emerald-50 text-[10px] font-black text-emerald-600 uppercase tracking-widest border border-emerald-100 shadow-sm">Active</span>
                ) : (
                    <span className="px-4 py-1.5 rounded-xl bg-rose-50 text-[10px] font-black text-rose-500 uppercase tracking-widest border border-rose-100 shadow-sm">Inactive</span>
                )
            )
        },
        {
            header: 'Action Hub',
            key: 'actions',
            align: 'right',
            render: (cat) => (
                <div className="flex items-center justify-end gap-2">
                    <button
                        onClick={(e) => { e.stopPropagation(); navigate('/' + ROUTES.DASHBOARD.CATEGORIES_CREATE + '?parentId=' + cat._id); }}
                        className="p-3 text-indigo-500 hover:bg-indigo-50 rounded-2xl transition-all border border-transparent hover:border-indigo-100 group/btn"
                        title="Engineer Sub-Category"
                    >
                        <Plus size={18} className="group-hover/btn:scale-110 transition-transform" />
                    </button>
                    <button
                        onClick={(e) => { e.stopPropagation(); navigate('/' + ROUTES.DASHBOARD.CATEGORIES_EDIT.replace(':id', cat._id)); }}
                        className="p-3 text-primary hover:bg-primary/5 rounded-2xl transition-all border border-transparent hover:border-primary/10 group/btn"
                        title="Modify Specification"
                    >
                        <Edit2 size={18} className="group-hover/btn:scale-110 transition-transform" />
                    </button>
                    <button
                        onClick={(e) => { e.stopPropagation(); handleDeleteCategory(cat._id); }}
                        className="p-3 text-rose-500 hover:bg-rose-50 rounded-2xl transition-all border border-transparent hover:border-rose-100 group/btn"
                        title="Archive Component"
                    >
                        <Trash2 size={18} className="group-hover/btn:scale-110 transition-transform" />
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
                    <div className="w-16 h-16 rounded-[1.5rem] bg-primary flex items-center justify-center text-white shadow-xl shadow-primary/20">
                        <Network size={32} />
                    </div>
                    <div>
                        <h1 className="text-3xl font-black text-primary tracking-tight uppercase font-mono">Category Hub</h1>
                        <p className="text-sm text-gray-500 font-medium">Architecting the product taxonomy & hierarchy</p>
                    </div>
                </div>
                <div className="flex items-center gap-4 relative z-10">
                    <button
                        onClick={() => navigate('/' + ROUTES.DASHBOARD.CATEGORIES_CREATE)}
                        className="bg-primary text-white h-16 px-10 rounded-[1.5rem] hover:bg-primary/95 transition-all shadow-xl shadow-primary/20 flex items-center gap-3 font-black uppercase text-sm tracking-widest group"
                        title="Initialize Root Category"
                    >
                        <Plus size={20} />
                        New Architecture
                    </button>
                </div>
            </div>

            {/* Intelligence Search Bar */}
            <div className="flex flex-col xl:flex-row gap-4">
                <div className="flex-1 relative group">
                    <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-primary/40 group-focus-within:text-primary transition-colors duration-300" size={22} />
                    <input
                        type="text"
                        placeholder="Scan taxonomic nodes by identity or slug..."
                        value={filters.search}
                        onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                        className="w-full bg-white border-2 border-primary/5 rounded-[2rem] py-5 pl-16 pr-6 focus:outline-none focus:border-primary/20 transition-all font-bold text-gray-700 shadow-xl shadow-gray-100/50 block placeholder:text-gray-300"
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
                                isTree: isTreeView
                            })}
                            className="px-6 py-4 rounded-[2rem] bg-rose-50 border-2 border-rose-100 text-rose-500 hover:bg-rose-100 transition-all font-black uppercase text-[10px] tracking-widest flex items-center gap-2 shadow-xl shadow-rose-100/50 h-16"
                        >
                            <RotateCcw size={16} />
                            Reset Hub
                        </button>
                    )}
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
                data={flattenedCategories}
                columns={columns}
                isLoading={loading}
                keyExtractor={(cat) => cat._id}
                emptyMessage="No strategic categories discovered in this network"
                onRowClick={(cat) => toggleExpand(cat._id)}
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

export default CategoryList;
