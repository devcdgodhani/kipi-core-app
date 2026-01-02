import React, { useState, useEffect } from 'react';
import type { Category, ProductFilters } from '../../types/product.types';
import { categoryService } from '../../services/product.service';

interface ProductFiltersProps {
    filters: ProductFilters;
    onFilterChange: (filters: ProductFilters) => void;
    onClear: () => void;
}

const ProductFiltersComponent: React.FC<ProductFiltersProps> = ({
    filters,
    onFilterChange,
    onClear,
}) => {
    const [categories, setCategories] = useState<Category[]>([]);
    const [isExpanded, setIsExpanded] = useState(true);

    useEffect(() => {
        loadCategories();
    }, []);

    const loadCategories = async () => {
        try {
            const data = await categoryService.getAll();
            setCategories(data);
        } catch (error) {
            console.error('Failed to load categories:', error);
        }
    };

    const handleCategoryToggle = (categoryId: string) => {
        const currentCategories = filters.categoryIds || [];
        const newCategories = currentCategories.includes(categoryId)
            ? currentCategories.filter(id => id !== categoryId)
            : [...currentCategories, categoryId];

        onFilterChange({ ...filters, categoryIds: newCategories });
    };

    const handlePriceChange = (min?: number, max?: number) => {
        onFilterChange({ ...filters, minPrice: min, maxPrice: max });
    };

    const handleSortChange = (sortBy: string, sortOrder: 'asc' | 'desc') => {
        onFilterChange({ ...filters, sortBy: sortBy as any, sortOrder });
    };

    const activeFilterCount =
        (filters.categoryIds?.length || 0) +
        (filters.minPrice ? 1 : 0) +
        (filters.maxPrice ? 1 : 0) +
        (filters.inStock ? 1 : 0);

    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 sticky top-4">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-bold text-gray-900">
                    Filters
                    {activeFilterCount > 0 && (
                        <span className="ml-2 text-sm text-primary">({activeFilterCount})</span>
                    )}
                </h2>
                <button
                    onClick={onClear}
                    className="text-sm text-primary hover:underline"
                >
                    Clear All
                </button>
            </div>

            {/* Categories */}
            <div className="mb-6">
                <h3 className="font-semibold text-gray-900 mb-3">Categories</h3>
                <div className="space-y-2 max-h-64 overflow-y-auto">
                    {categories.map((category) => (
                        <label key={category._id} className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 p-2 rounded">
                            <input
                                type="checkbox"
                                checked={filters.categoryIds?.includes(category._id) || false}
                                onChange={() => handleCategoryToggle(category._id)}
                                className="w-4 h-4 text-primary border-gray-300 rounded focus:ring-primary"
                            />
                            <span className="text-sm text-gray-700">{category.name}</span>
                        </label>
                    ))}
                </div>
            </div>

            {/* Price Range */}
            <div className="mb-6">
                <h3 className="font-semibold text-gray-900 mb-3">Price Range</h3>
                <div className="flex gap-2">
                    <input
                        type="number"
                        placeholder="Min"
                        value={filters.minPrice || ''}
                        onChange={(e) => handlePriceChange(Number(e.target.value) || undefined, filters.maxPrice)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary focus:border-transparent"
                    />
                    <input
                        type="number"
                        placeholder="Max"
                        value={filters.maxPrice || ''}
                        onChange={(e) => handlePriceChange(filters.minPrice, Number(e.target.value) || undefined)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary focus:border-transparent"
                    />
                </div>
            </div>

            {/* Stock Status */}
            <div className="mb-6">
                <label className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 p-2 rounded">
                    <input
                        type="checkbox"
                        checked={filters.inStock || false}
                        onChange={(e) => onFilterChange({ ...filters, inStock: e.target.checked })}
                        className="w-4 h-4 text-primary border-gray-300 rounded focus:ring-primary"
                    />
                    <span className="text-sm text-gray-700">In Stock Only</span>
                </label>
            </div>

            {/* Sort Options */}
            <div>
                <h3 className="font-semibold text-gray-900 mb-3">Sort By</h3>
                <select
                    value={`${filters.sortBy || 'createdAt'}-${filters.sortOrder || 'desc'}`}
                    onChange={(e) => {
                        const [sortBy, sortOrder] = e.target.value.split('-');
                        handleSortChange(sortBy, sortOrder as 'asc' | 'desc');
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary focus:border-transparent"
                >
                    <option value="createdAt-desc">Newest First</option>
                    <option value="createdAt-asc">Oldest First</option>
                    <option value="price-asc">Price: Low to High</option>
                    <option value="price-desc">Price: High to Low</option>
                    <option value="name-asc">Name: A to Z</option>
                    <option value="name-desc">Name: Z to A</option>
                </select>
            </div>
        </div>
    );
};

export default ProductFiltersComponent;
