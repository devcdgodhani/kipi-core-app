import React, { useState, useEffect } from 'react';
import type { Product, ProductFilters as IProductFilters } from '../../types/product.types';
import { productService } from '../../services/product.service';
import ProductCard from '../../components/Product/ProductCard';
import ProductFilters from '../../components/Product/ProductFilters';
import { SlidersHorizontal, ArrowUpDown } from 'lucide-react';
import { useSearchParams } from 'react-router-dom';
import { Drawer } from '../../components/common/Drawer';
import { searchService } from '../../services/search.service';

const ProductList: React.FC = () => {
    const [searchParams, setSearchParams] = useSearchParams();
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);


    // Initialize filters from URL or defaults
    const [filters, setFilters] = useState<IProductFilters>({
        page: Number(searchParams.get('page')) || 1,
        limit: 12,
        sortBy: (searchParams.get('sortBy') as 'name' | 'price' | 'createdAt') || 'createdAt',
        sortOrder: (searchParams.get('sortOrder') as 'asc' | 'desc') || 'desc',
        search: searchParams.get('search') || '',
        categoryIds: searchParams.get('category') ? [searchParams.get('category')!] : undefined,
        minPrice: searchParams.get('minPrice') ? Number(searchParams.get('minPrice')) : undefined,
        maxPrice: searchParams.get('maxPrice') ? Number(searchParams.get('maxPrice')) : undefined,
    });
    const [totalPages, setTotalPages] = useState(1);

    // Sync state with URL changes (e.g. from Navbar)
    useEffect(() => {
        const categoryParam = searchParams.get('category');
        const searchParam = searchParams.get('search');

        const currentCategoryId = filters.categoryIds?.[0] || undefined;
        // Check if URL params differ from state (external navigation)
        const hasCategoryChanged = categoryParam !== (currentCategoryId ?? null) && (categoryParam !== null || currentCategoryId !== undefined);
        const hasSearchChanged = (searchParam || '') !== (filters.search || '');

        if (hasCategoryChanged || hasSearchChanged) {
            setFilters(prev => ({
                ...prev,
                categoryIds: categoryParam ? [categoryParam] : (hasCategoryChanged ? undefined : prev.categoryIds),
                search: hasSearchChanged ? (searchParam || '') : prev.search,
                page: 1
            }));
        }
    }, [searchParams]);

    useEffect(() => {
        loadProducts();
        // Update URL params
        const params: any = {};
        if (filters.page && filters.page > 1) params.page = filters.page.toString();
        if (filters.search) params.search = filters.search;
        if (filters.categoryIds && filters.categoryIds.length > 0) params.category = filters.categoryIds[0];
        if (filters.minPrice) params.minPrice = filters.minPrice.toString();
        if (filters.maxPrice) params.maxPrice = filters.maxPrice.toString();
        if (filters.sortBy) params.sortBy = filters.sortBy;
        if (filters.sortOrder) params.sortOrder = filters.sortOrder;
        setSearchParams(params);
    }, [filters]);

    const loadProducts = async () => {
        setLoading(true);
        try {
            const response = await productService.getWithPagination(filters);
            setProducts(response.data);
            setTotalPages(response.pagination.totalPages);

            // Track search query
            if (filters.search && filters.page === 1) {
                searchService.trackSearch(filters.search, response.pagination.total).catch(console.error);
            }

        } catch (error) {
            console.error('Failed to load products:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const [sortBy, sortOrder] = e.target.value.split('-');
        setFilters({
            ...filters,
            sortBy: sortBy as 'name' | 'price' | 'createdAt',
            sortOrder: sortOrder as 'asc' | 'desc',
            page: 1
        });
    };

    // Temp filters for Modal
    const [tempFilters, setTempFilters] = useState<IProductFilters>(filters);

    useEffect(() => {
        if (isFilterModalOpen) {
            setTempFilters(filters);
        }
    }, [isFilterModalOpen, filters]);

    const handleTempFilterChange = (newFilters: IProductFilters) => {
        setTempFilters(prev => ({ ...prev, ...newFilters }));
    };

    const handleApplyFilters = () => {
        setFilters({ ...tempFilters, page: 1 });
        setIsFilterModalOpen(false);
    };

    const handleClearTempFilters = () => {
        setTempFilters({
            page: 1,
            limit: 12,
            sortBy: filters.sortBy,
            sortOrder: filters.sortOrder,
            search: filters.search
        });
    };

    const activeFilterCount = (
        (tempFilters.categoryIds?.length || 0) +
        (tempFilters.minPrice ? 1 : 0) +
        (tempFilters.maxPrice ? 1 : 0) +
        (tempFilters.inStock ? 1 : 0) +
        Object.values(tempFilters.attributes || {}).reduce((acc, curr) => acc + curr.length, 0)
    );

    // Calculate active filter count for the main filter button (applied filters)
    const appliedFilterCount = (
        (filters.categoryIds?.length || 0) +
        (filters.minPrice ? 1 : 0) +
        (filters.maxPrice ? 1 : 0) +
        (filters.inStock ? 1 : 0) +
        Object.values(filters.attributes || {}).reduce((acc, curr) => acc + curr.length, 0)
    );


    const handleClearFilters = () => {
        setFilters({
            page: 1,
            limit: 12,
            sortBy: 'createdAt',
            sortOrder: 'desc',
            search: '',
            categoryIds: undefined,
            minPrice: undefined,
            maxPrice: undefined,
        });
    };

    const handlePageChange = (page: number) => {
        setFilters({ ...filters, page });
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    return (
        <div className="min-h-screen bg-white">

            <div className="max-w-7xl mx-auto px-4 md:px-8 py-8 md:py-12">
                {/* Toolbar */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 pb-4 border-b border-gray-100 gap-4">
                    {/* Left: Filter & Count */}
                    <div className="flex items-center gap-3 w-full sm:w-auto flex-wrap">
                        <button
                            onClick={() => setIsFilterModalOpen(true)}
                            className="flex items-center gap-2 px-6 py-2.5 bg-primary text-white text-xs font-black uppercase tracking-widest rounded-xl hover:bg-primary/90 transition-all hover:scale-105 active:scale-95 shadow-lg shadow-primary/20 relative"
                        >
                            <SlidersHorizontal size={16} />
                            Filters
                            {appliedFilterCount > 0 && (
                                <span className="ml-1 w-5 h-5 flex items-center justify-center rounded-full bg-white text-primary text-[10px] font-black">
                                    {appliedFilterCount}
                                </span>
                            )}
                        </button>

                        {appliedFilterCount > 0 && (
                            <button
                                onClick={handleClearFilters}
                                className="flex items-center gap-2 px-4 py-2.5 bg-rose-50 text-rose-600 border border-rose-200 text-xs font-black uppercase tracking-widest rounded-xl hover:bg-rose-100 transition-all"
                            >
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M18 6L6 18M6 6l12 12" />
                                </svg>
                                Clear Filters
                            </button>
                        )}
                    </div>

                    {/* Right: Search & Sort */}
                    <div className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto">


                        <div className="flex items-center gap-3 w-full sm:w-auto">
                            <span className="text-xs font-bold text-gray-400 uppercase tracking-widest whitespace-nowrap">Sort By</span>
                            <div className="relative flex-1 sm:flex-none">
                                <select
                                    className="w-full sm:w-auto appearance-none bg-transparent pl-2 pr-8 py-1 text-sm font-bold text-gray-900 focus:outline-none cursor-pointer uppercase tracking-wide"
                                    onChange={handleSortChange}
                                    value={`${filters.sortBy}-${filters.sortOrder}`}
                                >
                                    <option value="createdAt-desc">Newest</option>
                                    <option value="basePrice-asc">Price: Low to High</option>
                                    <option value="basePrice-desc">Price: High to Low</option>
                                    <option value="name-asc">Name: A-Z</option>
                                </select>
                                <ArrowUpDown size={14} className="absolute right-0 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Product Grid */}
                <div>
                    {/* Loading State */}
                    {loading && products.length === 0 && (
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
                            {[1, 2, 3, 4, 5, 6, 7, 8].map(n => (
                                <div key={n} className="space-y-4 animate-pulse">
                                    <div className="aspect-[3/4] bg-gray-100 w-full rounded-2xl" />
                                    <div className="h-4 bg-gray-100 w-2/3 rounded" />
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Empty State */}
                    {!loading && products.length === 0 && (
                        <div className="flex flex-col items-center justify-center py-32 text-center">
                            <span className="text-4xl mb-4">🍂</span>
                            <h3 className="text-xl font-bold uppercase tracking-tight text-gray-900 mb-2">No Products Found</h3>
                            <p className="text-gray-500 mb-6 max-w-md">We couldn't find any items matching your filters. Try adjusting your search or category.</p>
                            <button
                                onClick={handleClearFilters}
                                className="px-6 py-3 bg-primary text-white text-xs font-black uppercase tracking-widest hover:bg-gray-800 transition-colors rounded-xl"
                            >
                                Clear Filters
                            </button>
                        </div>
                    )}

                    {/* Products */}
                    {!loading && products.length > 0 && (
                        <>
                            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-6 gap-y-10">
                                {products.map((product) => (
                                    <ProductCard key={product._id} product={product} />
                                ))}
                            </div>

                            {/* Pagination */}
                            {totalPages > 1 && (
                                <div className="mt-20 flex justify-center gap-2">
                                    {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                                        <button
                                            key={page}
                                            onClick={() => handlePageChange(page)}
                                            className={`w-10 h-10 flex items-center justify-center text-xs font-bold transition-all rounded-lg ${filters.page === page
                                                ? 'bg-primary text-white shadow-lg shadow-primary/20'
                                                : 'bg-white text-gray-500 hover:bg-gray-50 border border-gray-200'}
                                            `}
                                        >
                                            {page}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </>
                    )}
                </div>

                <Drawer
                    isOpen={isFilterModalOpen}
                    onClose={() => setIsFilterModalOpen(false)}
                    title="ADVANCED FILTERS"
                    subtitle="REFINE YOUR DATA VIEW"
                    footer={
                        <div className="w-full flex justify-end items-center gap-4">
                            <button
                                onClick={handleClearTempFilters}
                                className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 hover:text-gray-900 transition-colors flex items-center gap-2"
                            >
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
                                    <path d="M3 3v5h5" />
                                </svg>
                                Clear Filter
                            </button>
                            <button
                                onClick={handleApplyFilters}
                                className="px-8 py-3 bg-primary text-white text-[10px] font-bold uppercase tracking-[0.2em] hover:bg-primary/90 transition-all shadow-lg shadow-primary/20"
                            >
                                Apply Filters {activeFilterCount > 0 && `(${activeFilterCount})`}
                            </button>
                        </div>
                    }
                >
                    <ProductFilters
                        filters={tempFilters} // Pass temp state
                        onFilterChange={handleTempFilterChange} // Update temp state
                    />
                </Drawer>

            </div>
        </div>
    );
};

export default ProductList;
