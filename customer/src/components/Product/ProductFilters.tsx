import React, { useState, useEffect } from 'react';
import type { Category, ProductFilters } from '../../types/product.types';
import type { Attribute } from '../../types/attribute.types';
import { categoryService } from '../../services/product.service';
import { attributeService } from '../../services/attribute.service';

interface ProductFiltersProps {
    filters: ProductFilters;
    onFilterChange: (filters: ProductFilters) => void;
}

const ProductFiltersComponent: React.FC<ProductFiltersProps> = ({
    filters,
    onFilterChange,
}) => {
    const [categories, setCategories] = useState<Category[]>([]);
    const [attributes, setAttributes] = useState<Attribute[]>([]); // New state
    const [activeTab, setActiveTab] = useState('category');

    useEffect(() => {
        loadCategories();
        loadAttributes(); // Load attributes
    }, []);

    const loadCategories = async () => {
        try {
            const data = await categoryService.getAll();
            setCategories(data);
        } catch (error) {
            console.error('Failed to load categories:', error);
        }
    };

    const loadAttributes = async () => {
        try {
            const data = await attributeService.getAllFilterable();
            setAttributes(data);
        } catch (error) {
            console.error('Failed to load attributes:', error);
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

    const handleAttributeToggle = (attributeId: string, value: string) => {
        const currentAttributes = filters.attributes || {};
        const currentValues = currentAttributes[attributeId] || [];
        const newValues = currentValues.includes(value)
            ? currentValues.filter(v => v !== value)
            : [...currentValues, value];

        const newAttributes = { ...currentAttributes, [attributeId]: newValues };
        if (newValues.length === 0) delete newAttributes[attributeId];

        onFilterChange({ ...filters, attributes: newAttributes });
    };

    const handleSortChange = (sortBy: string, sortOrder: 'asc' | 'desc') => {
        onFilterChange({ ...filters, sortBy: sortBy as any, sortOrder });
    };

    return (
        <div className="flex flex-col md:flex-row h-full">
            {/* Sidebar Tabs (Horizontal on mobile, Vertical on desktop) */}
            <div className="w-full md:w-[280px] bg-white border-b md:border-b-0 md:border-r border-gray-100 flex flex-row md:flex-col overflow-x-auto md:overflow-y-auto py-2 md:py-6 gap-2 md:gap-0 px-4 md:px-0 shrink-0 scrollbar-hide">
                <div className="hidden md:block px-6 mb-4">
                    <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest">Filter By</h3>
                </div>
                <div className="flex flex-row md:flex-col md:flex-1 md:overflow-y-auto gap-2 md:gap-0">
                    {[
                        { id: 'category', label: 'Categories', count: filters.categoryIds?.length || 0 },
                        ...attributes.map(attr => ({
                            id: attr._id,
                            label: attr.name,
                            count: filters.attributes?.[attr._id]?.length || 0
                        })),
                        { id: 'price', label: 'Price Range', count: (filters.minPrice || filters.maxPrice) ? 1 : 0 },
                        { id: 'status', label: 'Availability', count: filters.inStock ? 1 : 0 },
                        { id: 'sort', label: 'Sort Order', count: 0 }
                    ].map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`min-w-fit md:w-full text-left px-4 md:px-5 py-3 md:py-4 rounded-xl text-xs font-bold uppercase tracking-wider transition-all duration-200 flex items-center justify-between md:mt-1 group border md:border-0 ${activeTab === tab.id
                                ? 'bg-primary text-white shadow-lg shadow-primary/20 scale-100 border-primary'
                                : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900 border-gray-100'
                                }`}
                        >
                            <span className="flex items-center gap-2">
                                {tab.label}
                                {tab.count > 0 && (
                                    <span className={`w-5 h-5 flex items-center justify-center rounded-full text-[9px] ${activeTab === tab.id
                                        ? 'bg-white text-primary'
                                        : 'bg-primary text-white'
                                        }`}>
                                        {tab.count}
                                    </span>
                                )}
                            </span>
                            {activeTab === tab.id && <div className="hidden md:block w-1.5 h-1.5 rounded-full bg-white" />}
                        </button>
                    ))}
                </div>
            </div>

            {/* Content Area */}
            <div className="flex-1 p-6 overflow-y-auto bg-white">
                {activeTab === 'category' && (
                    <div className="space-y-4 animate-in fade-in duration-300">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="font-bold text-gray-900 uppercase tracking-wide text-sm">Select Categories</h3>
                            <span className="text-xs text-gray-400">{categories.length} Found</span>
                        </div>
                        <div className="space-y-3">
                            {categories.map((category) => (
                                <label
                                    key={category._id}
                                    className={`flex items-center justify-between p-5 rounded-2xl border-2 cursor-pointer transition-all duration-200 group ${filters.categoryIds?.includes(category._id)
                                        ? 'bg-white border-primary shadow-xl shadow-gray-100'
                                        : 'bg-white border-transparent hover:border-gray-200 shadow-sm'
                                        }`}
                                >
                                    <span className={`text-sm font-bold uppercase tracking-wide transition-colors ${filters.categoryIds?.includes(category._id) ? 'text-primary' : 'text-gray-500'
                                        }`}>{category.name}</span>

                                    <div className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all ${filters.categoryIds?.includes(category._id)
                                        ? 'bg-primary border-primary'
                                        : 'border-gray-200 bg-gray-50'
                                        }`}>
                                        <input
                                            type="checkbox"
                                            checked={filters.categoryIds?.includes(category._id) || false}
                                            onChange={() => handleCategoryToggle(category._id)}
                                            className="hidden"
                                        />
                                        {filters.categoryIds?.includes(category._id) && (
                                            <svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                            </svg>
                                        )}
                                    </div>
                                </label>
                            ))}
                        </div>
                    </div>
                )}

                {activeTab === 'price' && (
                    <div className="space-y-8 animate-in fade-in duration-300">
                        <h3 className="font-bold text-gray-900 uppercase tracking-wide text-sm">Price Range</h3>

                        {/* Visual Progress Bar Slider Simulation */}
                        <div className="px-2">
                            <div className="relative h-2 bg-gray-100 rounded-full mb-6">
                                <div
                                    className="absolute h-full bg-primary rounded-full transition-all"
                                    style={{
                                        left: '0%', // ideally (min / maxLimit) * 100
                                        right: '0%',
                                        width: `${Math.min(((filters.maxPrice || 10000) / 10000) * 100, 100)}%` // Simplified visual
                                    }}
                                />
                                {/* Range Inputs would go here for interactivity, sticking to numeric inputs + visual bar for robustness */}
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-gray-500 uppercase">Min Price</label>
                                <div className="relative">
                                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold">$</span>
                                    <input
                                        type="number"
                                        placeholder="0"
                                        value={filters.minPrice || ''}
                                        onChange={(e) => handlePriceChange(Number(e.target.value) || undefined, filters.maxPrice)}
                                        className="w-full pl-8 pr-4 py-3 bg-gray-50 border-gray-200 rounded-xl text-sm font-bold focus:ring-1 focus:ring-primary focus:border-primary transition-all"
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-gray-500 uppercase">Max Price</label>
                                <div className="relative">
                                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold">$</span>
                                    <input
                                        type="number"
                                        placeholder="Any"
                                        value={filters.maxPrice || ''}
                                        onChange={(e) => handlePriceChange(filters.minPrice, Number(e.target.value) || undefined)}
                                        className="w-full pl-8 pr-4 py-3 bg-gray-50 border-gray-200 rounded-xl text-sm font-bold focus:ring-1 focus:ring-primary focus:border-primary transition-all"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Attribute Filters Rendering */}
                {attributes.find(a => a._id === activeTab) && (() => {
                    const attr = attributes.find(a => a._id === activeTab)!;
                    return (
                        <div className="space-y-4 animate-in fade-in duration-300">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="font-bold text-gray-900 uppercase tracking-wide text-sm">{attr.name}</h3>
                                <span className="text-xs text-gray-400">{attr.options.length} Options</span>
                            </div>

                            {/* Color Grid or List */}
                            {(attr.inputType === 'COLOR' || attr.slug === 'color') ? (
                                <div className="grid grid-cols-4 gap-3">
                                    {attr.options.map((option) => (
                                        <button
                                            key={option.value}
                                            onClick={() => handleAttributeToggle(attr._id, option.value)}
                                            className={`aspect-square rounded-full border-2 flex items-center justify-center transition-all ${filters.attributes?.[attr._id]?.includes(option.value)
                                                ? 'border-primary ring-2 ring-primary ring-offset-2'
                                                : 'border-transparent hover:border-gray-200'
                                                }`}
                                            title={option.label}
                                            style={{ backgroundColor: option.color || option.value }}
                                        >
                                            {filters.attributes?.[attr._id]?.includes(option.value) && (
                                                <svg className="w-4 h-4 text-white drop-shadow-md" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                                </svg>
                                            )}
                                        </button>
                                    ))}
                                </div>
                            ) : (
                                <div className="space-y-2">
                                    {attr.options.map((option) => (
                                        <label
                                            key={option.value}
                                            className={`flex items-center justify-between p-5 rounded-2xl border-2 cursor-pointer transition-all duration-200 group ${filters.attributes?.[attr._id]?.includes(option.value)
                                                ? 'bg-white border-primary shadow-xl shadow-gray-100'
                                                : 'bg-white border-transparent hover:border-gray-200 shadow-sm'
                                                }`}
                                        >
                                            <span className={`text-sm font-bold uppercase tracking-wide transition-colors ${filters.attributes?.[attr._id]?.includes(option.value) ? 'text-primary' : 'text-gray-500'
                                                }`}>{option.label}</span>

                                            <div className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all ${filters.attributes?.[attr._id]?.includes(option.value)
                                                ? 'bg-primary border-primary'
                                                : 'border-gray-200 bg-gray-50'
                                                }`}>
                                                <input
                                                    type="checkbox"
                                                    checked={filters.attributes?.[attr._id]?.includes(option.value) || false}
                                                    onChange={() => handleAttributeToggle(attr._id, option.value)}
                                                    className="hidden"
                                                />
                                                {filters.attributes?.[attr._id]?.includes(option.value) && (
                                                    <svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                                                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                                    </svg>
                                                )}
                                            </div>
                                        </label>
                                    ))}
                                </div>
                            )}
                        </div>
                    );
                })()}

                {activeTab === 'status' && (
                    <div className="space-y-6 animate-in fade-in duration-300">
                        <h3 className="font-bold text-gray-900 uppercase tracking-wide text-sm">Availability</h3>
                        <label className="flex items-center gap-3 cursor-pointer group p-3 border border-gray-100 rounded-xl hover:border-gray-200 transition-colors">
                            <div className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${filters.inStock
                                ? 'bg-primary border-primary text-white'
                                : 'border-gray-200 group-hover:border-primary'
                                }`}>
                                {filters.inStock && (
                                    <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                    </svg>
                                )}
                            </div>
                            <input
                                type="checkbox"
                                checked={filters.inStock || false}
                                onChange={(e) => onFilterChange({ ...filters, inStock: e.target.checked })}
                                className="hidden"
                            />
                            <span className="text-sm font-bold text-gray-700">In Stock Only</span>
                        </label>
                    </div>
                )}

                {activeTab === 'sort' && (
                    <div className="space-y-6 animate-in fade-in duration-300">
                        <h3 className="font-bold text-gray-900 uppercase tracking-wide text-sm">Sort Preference</h3>
                        <div className="space-y-2">
                            {[
                                { value: 'createdAt-desc', label: 'Newest First' },
                                { value: 'createdAt-asc', label: 'Oldest First' },
                                { value: 'price-asc', label: 'Price: Low to High' },
                                { value: 'price-desc', label: 'Price: High to Low' },
                                { value: 'name-asc', label: 'Name: A to Z' },
                                { value: 'name-desc', label: 'Name: Z to A' },
                            ].map((option) => (
                                <button
                                    key={option.value}
                                    onClick={() => {
                                        const [sortBy, sortOrder] = option.value.split('-');
                                        handleSortChange(sortBy, sortOrder as 'asc' | 'desc');
                                    }}
                                    className={`w-full text-left px-4 py-3 rounded-xl text-sm font-bold transition-all ${`${filters.sortBy || 'createdAt'}-${filters.sortOrder || 'desc'}` === option.value
                                        ? 'bg-primary text-white shadow-lg shadow-primary/20'
                                        : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
                                        }`}
                                >
                                    {option.label}
                                </button>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ProductFiltersComponent;
