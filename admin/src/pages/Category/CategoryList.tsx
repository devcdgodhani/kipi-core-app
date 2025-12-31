import React, { useEffect, useState, useCallback } from 'react';
import {
    Search,
    Filter,
    Plus,
    Edit2,
    Trash2,
    Loader2,
    RotateCcw,
    ChevronDown,
    ChevronRight,
    FolderTree,
    Image as ImageIcon
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { categoryService } from '../../services/category.service';
import type { ICategory, ICategoryFilters } from '../../types/category';
import { CATEGORY_STATUS } from '../../types/category';
import { CommonFilter, type FilterField } from '../../components/common/CommonFilter';
import { ROUTES } from '../../routes/routeConfig';

const CategoryList: React.FC = () => {
    const navigate = useNavigate();
    const [categories, setCategories] = useState<ICategory[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isFilterOpen, setIsFilterOpen] = useState(false);

    // Always tree view by default as per requirement
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
        if (window.confirm('Are you sure you want to delete this category? This might affect sub-categories.')) {
            try {
                await categoryService.delete(id);
                fetchCategories();
            } catch (err: any) {
                alert(err.response?.data?.message || 'Failed to delete category');
            }
        }
    };

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

            <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-xl shadow-gray-200/50 overflow-hidden min-h-[400px] relative p-4">
                {loading && (
                    <div className="absolute inset-0 bg-white/60 backdrop-blur-[2px] z-10 flex items-center justify-center">
                        <div className="flex flex-col items-center gap-3">
                            <Loader2 size={40} className="text-primary animate-spin" />
                            <p className="text-sm font-bold text-primary uppercase tracking-widest">Organizing Categories...</p>
                        </div>
                    </div>
                )}

                <div className="space-y-3">
                    {categories.length > 0 ? (
                        categories.map((cat) => (
                            <CategoryItem
                                key={cat._id}
                                category={cat}
                                onEdit={(c) => navigate('/' + ROUTES.DASHBOARD.CATEGORIES_EDIT.replace(':id', c._id))}
                                onDelete={(id) => handleDeleteCategory(id)}
                                onAddSub={(id) => navigate('/' + ROUTES.DASHBOARD.CATEGORIES_CREATE + '?parentId=' + id)}
                                level={0}
                            />
                        ))
                    ) : (
                        !loading && (
                            <div className="py-20 flex flex-col items-center justify-center text-gray-400">
                                <FolderTree size={48} className="opacity-20 mb-4" />
                                <h3 className="text-lg font-bold text-gray-900">No categories found</h3>
                                <p className="text-sm font-medium">Start by adding a root category</p>
                            </div>
                        )
                    )}
                </div>
            </div>
        </div>
    );
};

interface CategoryItemProps {
    category: ICategory;
    onEdit: (cat: ICategory) => void;
    onDelete: (id: string) => void;
    onAddSub: (id: string) => void;
    level: number;
}

const CategoryItem: React.FC<CategoryItemProps> = ({ category, onEdit, onDelete, onAddSub, level }) => {
    const [isOpen, setIsOpen] = useState(level === 0);
    const hasChildren = category.children && category.children.length > 0;

    return (
        <div className="select-none">
            <div
                className={`group flex items-center justify-between p-4 rounded-2xl transition-all border-2 ${level === 0 ? 'bg-gray-50 border-gray-100 hover:border-primary/20' : 'bg-white border-transparent hover:bg-gray-50'
                    }`}
                style={{ marginLeft: `${level * 24}px` }}
            >
                <div className="flex items-center gap-4 flex-1 cursor-pointer" onClick={() => setIsOpen(!isOpen)}>
                    <div className="w-6 h-6 flex items-center justify-center text-gray-400">
                        {hasChildren ? (
                            isOpen ? <ChevronDown size={20} /> : <ChevronRight size={20} />
                        ) : (
                            <div className="w-1 h-1 rounded-full bg-gray-300" />
                        )}
                    </div>

                    <div className="w-10 h-10 rounded-xl bg-white border border-gray-100 shadow-sm flex items-center justify-center overflow-hidden">
                        {category.image ? (
                            <img src={category.image} alt="" className="w-full h-full object-cover" />
                        ) : (
                            <ImageIcon size={18} className="text-gray-300" />
                        )}
                    </div>

                    <div className="flex flex-col">
                        <span className={`font-bold ${level === 0 ? 'text-gray-900' : 'text-gray-700'}`}>{category.name}</span>
                        <span className="text-[10px] font-medium text-gray-400 uppercase tracking-widest">{category.slug}</span>
                    </div>

                    {category.status === CATEGORY_STATUS.INACTIVE && (
                        <span className="px-2 py-0.5 rounded-md bg-rose-50 text-[8px] font-black text-rose-500 uppercase tracking-tighter border border-rose-100">Hidden</span>
                    )}
                </div>

                <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                        onClick={(e) => { e.stopPropagation(); onAddSub(category._id); }}
                        className="p-2 text-indigo-500 hover:bg-indigo-50 rounded-xl transition-all"
                        title="Add Sub-Category"
                    >
                        <Plus size={16} />
                    </button>
                    <button
                        onClick={(e) => { e.stopPropagation(); onEdit(category); }}
                        className="p-2 text-primary hover:bg-primary/5 rounded-xl transition-all"
                    >
                        <Edit2 size={16} />
                    </button>
                    <button
                        onClick={(e) => { e.stopPropagation(); onDelete(category._id); }}
                        className="p-2 text-rose-500 hover:bg-rose-50 rounded-xl transition-all"
                    >
                        <Trash2 size={16} />
                    </button>
                </div>
            </div>

            {hasChildren && isOpen && (
                <div className="mt-2 space-y-2 animate-in slide-in-from-top-2 duration-200">
                    {category.children!.map((child) => (
                        <CategoryItem
                            key={child._id}
                            category={child}
                            onEdit={onEdit}
                            onDelete={onDelete}
                            onAddSub={onAddSub}
                            level={level + 1}
                        />
                    ))}
                </div>
            )}
        </div>
    );
};

export default CategoryList;
