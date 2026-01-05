import React, { useState, useEffect } from 'react';
import type { Product, ProductFilters as IProductFilters } from '../../types/product.types';
import { productService } from '../../services/product.service';
import ProductCard from '../../components/Product/ProductCard';
import ProductFilters from '../../components/Product/ProductFilters';
import { Search, SlidersHorizontal, ArrowUpDown } from 'lucide-react';
import { useSearchParams } from 'react-router-dom';

const ProductList: React.FC = () => {
    const [searchParams, setSearchParams] = useSearchParams();
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [showMobileFilters, setShowMobileFilters] = useState(false);
    const [totalRecords, setTotalRecords] = useState(0);

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
            setTotalRecords(response.pagination.total);
        } catch (error) {
            console.error('Failed to load products:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = (query: string) => {
        setFilters({ ...filters, search: query, page: 1 });
    };

    const handleFilterChange = (newFilters: IProductFilters) => {
        setFilters({ ...filters, ...newFilters, page: 1 });
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
            {/* Header / Banner */}
            <div className="bg-gray-50 py-12 md:py-16 border-b border-gray-100">
                <div className="max-w-7xl mx-auto px-4 md:px-8 text-center space-y-4">
                    <h1 className="text-3xl md:text-5xl font-black uppercase tracking-tight text-gray-900">
                        {filters.search ? `Results for "${filters.search}"` : 'The Collection'}
                    </h1>
                    <p className="text-gray-500 max-w-lg mx-auto">
                        Explore our precisely curated selection of premium essentials.
                    </p>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 md:px-8 py-8 md:py-12">
                {/* Mobile Filter Toggle & Search */}
                <div className="lg:hidden mb-6 space-y-4">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                        <input
                            type="text"
                            placeholder="Search products..."
                            className="w-full pl-10 pr-4 py-3 bg-gray-50 border-none rounded-sm focus:ring-1 focus:ring-primary placeholder-gray-400"
                            value={filters.search}
                            onChange={(e) => handleSearch(e.target.value)}
                        />
                    </div>
                    <button
                        onClick={() => setShowMobileFilters(!showMobileFilters)}
                        className="w-full flex items-center justify-center gap-2 py-3 border border-gray-200 uppercase font-bold text-sm tracking-widest"
                    >
                        <SlidersHorizontal size={16} /> Filters
                    </button>
                    {showMobileFilters && (
                        <div className="p-4 border border-gray-100 bg-gray-50 rounded-lg">
                            <ProductFilters
                                filters={filters}
                                onFilterChange={handleFilterChange}
                                onClear={handleClearFilters}
                            />
                        </div>
                    )}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-4 gap-12">
                    {/* Desktop Sidebar */}
                    <div className="hidden lg:block lg:col-span-1 space-y-8 sticky top-24 h-fit">
                        <div className="relative">
                            <Search className="absolute left-0 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                            <input
                                type="text"
                                placeholder="SEARCH"
                                className="w-full pl-6 pr-0 py-2 bg-transparent border-b border-gray-200 rounded-none focus:ring-0 focus:border-primary placeholder-gray-400 text-sm font-bold tracking-widest uppercase"
                                value={filters.search}
                                onChange={(e) => handleSearch(e.target.value)}
                            />
                        </div>

                        <ProductFilters
                            filters={filters}
                            onFilterChange={handleFilterChange}
                            onClear={handleClearFilters}
                        />
                    </div>

                    {/* Product Grid */}
                    <div className="lg:col-span-3">
                        {/* Toolbar */}
                        <div className="flex flex-col sm:flex-row justify-between items-center mb-8 pb-4 border-b border-gray-100 gap-4">
                            <p className="text-xs font-bold text-gray-500 uppercase tracking-widest">
                                {loading ? 'Loading...' : `${totalRecords} Items`}
                            </p>

                            <div className="flex items-center gap-3">
                                <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Sort By</span>
                                <div className="relative">
                                    <select
                                        className="appearance-none bg-transparent pl-2 pr-8 py-1 text-sm font-bold text-gray-900 focus:outline-none cursor-pointer uppercase tracking-wide"
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

                        {/* Loading State */}
                        {loading && products.length === 0 && (
                            <div className="grid grid-cols-2 lg:grid-cols-3 gap-8">
                                {[1, 2, 3, 4, 5, 6].map(n => (
                                    <div key={n} className="space-y-4 animate-pulse">
                                        <div className="aspect-[3/4] bg-gray-100 w-full" />
                                        <div className="h-4 bg-gray-100 w-2/3" />
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
                                    className="px-6 py-3 bg-primary text-white text-xs font-black uppercase tracking-widest hover:bg-gray-800 transition-colors"
                                >
                                    Clear Filters
                                </button>
                            </div>
                        )}

                        {/* Products */}
                        {!loading && products.length > 0 && (
                            <>
                                <div className="grid grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-10">
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
                                                className={`w-10 h-10 flex items-center justify-center text-xs font-bold transition-all ${filters.page === page
                                                        ? 'bg-primary text-white'
                                                        : 'bg-white text-gray-500 hover:bg-gray-50 border border-gray-200'
                                                    }`}
                                            >
                                                {page}
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProductList;
