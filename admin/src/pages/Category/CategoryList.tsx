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
    Image as ImageIcon
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { categoryService } from '../../services/category.service';
import type { ICategory, ICategoryFilters } from '../../types/category';
import { CATEGORY_STATUS } from '../../types/category';
import { CommonFilter, type FilterField } from '../../components/common/CommonFilter';
import { Table, type Column } from '../../components/common/Table';
import { ROUTES } from '../../routes/routeConfig';

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
                // Default is ALL CLOSED (no auto-expand)
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
        if (window.confirm('Are you sure you want to delete this category? This might affect sub-categories.')) {
            try {
                await categoryService.delete(id);
                fetchCategories();
            } catch (err: any) {
                alert(err.response?.data?.message || 'Failed to delete category');
            }
        }
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
            header: 'Category Name',
            key: 'name',
            render: (cat) => {
                const hasChildren = cat.children && cat.children.length > 0;
                return (
                    <div style={{ paddingLeft: `${cat.level * 24}px` }} className="flex items-center gap-3">
                        <button
                            onClick={(e) => { e.stopPropagation(); toggleExpand(cat._id); }}
                            className={`p-1 rounded-md transition-colors ${hasChildren ? 'hover:bg-gray-100 text-gray-500' : 'text-gray-300 pointer-events-none'}`}
                        >
                            {hasChildren ? (
                                expandedIds.has(cat._id) ? <ChevronDown size={16} /> : <ChevronRight size={16} />
                            ) : (
                                <div className="w-4 h-4" />
                            )}
                        </button>
                        <div className="flex flex-col">
                            <span className={`font-bold ${cat.level === 0 ? 'text-gray-900' : 'text-gray-700'}`}>{cat.name}</span>
                            <span className="text-[10px] font-medium text-gray-400 uppercase tracking-widest">{cat.slug}</span>
                        </div>
                    </div>
                );
            }
        },
        {
            header: 'Image',
            key: 'image',
            align: 'center',
            render: (cat) => (
                <div className="w-10 h-10 rounded-xl bg-white border border-gray-100 shadow-sm flex items-center justify-center overflow-hidden mx-auto">
                    {cat.image ? (
                        <img src={cat.image} alt="" className="w-full h-full object-cover" />
                    ) : (
                        <ImageIcon size={18} className="text-gray-300" />
                    )}
                </div>
            )
        },
        {
            header: 'Status',
            key: 'status',
            align: 'center',
            render: (cat) => (
                cat.status === CATEGORY_STATUS.ACTIVE ? (
                    <span className="px-2 py-0.5 rounded-md bg-emerald-50 text-[10px] font-black text-emerald-500 uppercase tracking-tighter border border-emerald-100">Active</span>
                ) : (
                    <span className="px-2 py-0.5 rounded-md bg-rose-50 text-[10px] font-black text-rose-500 uppercase tracking-tighter border border-rose-100">Inactive</span>
                )
            )
        },
        {
            header: 'Actions',
            key: 'actions',
            align: 'right',
            render: (cat) => (
                <div className="flex items-center justify-end gap-2 ">
                    <button
                        onClick={() => navigate('/' + ROUTES.DASHBOARD.CATEGORIES_CREATE + '?parentId=' + cat._id)}
                        className="p-2 text-indigo-500 hover:bg-indigo-50 rounded-xl transition-all"
                        title="Add Sub-Category"
                    >
                        <Plus size={16} />
                    </button>
                    <button
                        onClick={() => navigate('/' + ROUTES.DASHBOARD.CATEGORIES_EDIT.replace(':id', cat._id))}
                        className="p-2 text-primary hover:bg-primary/5 rounded-xl transition-all"
                        title="Edit"
                    >
                        <Edit2 size={16} />
                    </button>
                    <button
                        onClick={() => handleDeleteCategory(cat._id)}
                        className="p-2 text-rose-500 hover:bg-rose-50 rounded-xl transition-all"
                        title="Delete"
                    >
                        <Trash2 size={16} />
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
                    <h1 className="text-3xl font-black text-primary tracking-tight uppercase font-mono">Category Hub</h1>
                    <p className="text-sm text-gray-500 font-medium">Manage product hierarchy and attributes</p>
                </div>
                <div className="flex gap-3">
                    <button
                        onClick={() => navigate('/' + ROUTES.DASHBOARD.CATEGORIES_CREATE)}
                        className="p-3 bg-primary text-white rounded-2xl hover:bg-primary/90 transition-all shadow-lg shadow-primary/20"
                        title="Add Root Category"
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
                        placeholder="Search categories..."
                        value={filters.search}
                        onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                        className="w-full bg-white border-2 border-primary/5 rounded-3xl py-4 pl-12 pr-4 focus:outline-none focus:border-primary/20 transition-all font-bold text-gray-700 shadow-xl shadow-gray-100/50"
                    />
                </div>

                <div className="flex gap-3">
                    {activeFilterCount > 0 && (
                        <button
                            onClick={() => setFilters({
                                search: '',
                                status: undefined,
                                isTree: isTreeView
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
                data={flattenedCategories}
                columns={columns}
                isLoading={loading}
                keyExtractor={(cat) => cat._id}
                emptyMessage="No categories found"
                onRowClick={(cat) => toggleExpand(cat._id)}
            />
        </div>
    );
};

export default CategoryList;
