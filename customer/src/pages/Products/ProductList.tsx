import React, { useState, useEffect } from 'react';
import type { Product, ProductFilters as IProductFilters } from '../../types/product.types';
import { productService } from '../../services/product.service';
import ProductCard from '../../components/Product/ProductCard';
import ProductFilters from '../../components/Product/ProductFilters';
import SearchBar from '../../components/Product/SearchBar';
import { Loader2 } from 'lucide-react';

const ProductList: React.FC = () => {
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [filters, setFilters] = useState<IProductFilters>({
        page: 1,
        limit: 20,
        sortBy: 'createdAt',
        sortOrder: 'desc',
    });
    const [totalPages, setTotalPages] = useState(1);

    useEffect(() => {
        loadProducts();
    }, [filters]);

    const loadProducts = async () => {
        setLoading(true);
        try {
            const response = await productService.getWithPagination(filters);
            setProducts(response.data);
            setTotalPages(response.pagination.totalPages);
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
        setFilters({ ...newFilters, page: 1 });
    };

    const handleClearFilters = () => {
        setFilters({
            page: 1,
            limit: 20,
            sortBy: 'createdAt',
            sortOrder: 'desc',
        });
    };

    const handlePageChange = (page: number) => {
        setFilters({ ...filters, page });
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 mb-4">All Products</h1>
                    <SearchBar onSearch={handleSearch} />
                </div>

                {/* Main Content */}
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                    {/* Filters Sidebar */}
                    <div className="lg:col-span-1">
                        <ProductFilters
                            filters={filters}
                            onFilterChange={handleFilterChange}
                            onClear={handleClearFilters}
                        />
                    </div>

                    {/* Products Grid */}
                    <div className="lg:col-span-3">
                        {/* Results Header */}
                        <div className="flex justify-between items-center mb-6">
                            <p className="text-gray-600">
                                {loading ? 'Loading...' : `${products.length} products found`}
                            </p>
                        </div>

                        {/* Loading State */}
                        {loading && (
                            <div className="flex justify-center items-center py-20">
                                <Loader2 className="w-8 h-8 animate-spin text-primary" />
                            </div>
                        )}

                        {/* Empty State */}
                        {!loading && products.length === 0 && (
                            <div className="text-center py-20">
                                <p className="text-gray-500 text-lg mb-4">No products found</p>
                                <button
                                    onClick={handleClearFilters}
                                    className="text-primary hover:underline"
                                >
                                    Clear all filters
                                </button>
                            </div>
                        )}

                        {/* Products Grid */}
                        {!loading && products.length > 0 && (
                            <>
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {products.map((product) => (
                                        <ProductCard key={product._id} product={product} />
                                    ))}
                                </div>

                                {/* Pagination */}
                                {totalPages > 1 && (
                                    <div className="mt-12 flex justify-center gap-2">
                                        <button
                                            onClick={() => handlePageChange(filters.page! - 1)}
                                            disabled={filters.page === 1}
                                            className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            Previous
                                        </button>

                                        {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                                            const page = i + 1;
                                            return (
                                                <button
                                                    key={page}
                                                    onClick={() => handlePageChange(page)}
                                                    className={`px-4 py-2 rounded-lg ${filters.page === page
                                                        ? 'bg-primary text-white'
                                                        : 'border border-gray-300 hover:bg-gray-50'
                                                        }`}
                                                >
                                                    {page}
                                                </button>
                                            );
                                        })}

                                        {totalPages > 5 && <span className="px-2 py-2">...</span>}

                                        <button
                                            onClick={() => handlePageChange(filters.page! + 1)}
                                            disabled={filters.page === totalPages}
                                            className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            Next
                                        </button>
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
