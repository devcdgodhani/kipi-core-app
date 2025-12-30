import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router';
import type { IProduct } from '../../../types';
import { productService } from '../../../api/services/product.service';
import { setProducts, setLoading } from '../../../Redux/slices/productSlice';
// import type { RootState } from '../../../Redux/store';  // Typo in relative path potentially, checking depth
import type { RootState } from '../../../Redux/store';
import { Table, Button, type Column, Pagination } from '../../../components/common';
import { Plus, Edit2, Trash, RefreshCw } from 'lucide-react';

const ProductList = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { products, loading, totalRecords } = useSelector((state: RootState) => state.product);
    const [page, setPage] = useState(1);
    const limit = 10;

    const fetchProducts = async (params = { page: 1, limit: 10 }) => {
        dispatch(setLoading(true));
        try {
            const res = await productService.getWithPagination(params);
            dispatch(setProducts({
                products: res.data.recordList,
                totalRecords: res.data.totalRecords
            }));
        } catch (error) {
            console.error(error);
        } finally {
            dispatch(setLoading(false));
        }
    };

    useEffect(() => {
        fetchProducts({ page, limit });
    }, [dispatch, page]);

    const handleEdit = (product: IProduct) => {
        navigate(`/products/${product._id}`);
    };

    const handleDelete = async (id: string) => {
        if (confirm('Are you sure you want to delete this product?')) {
            try {
                await productService.delete(id);
                fetchProducts();
            } catch (error) {
                console.error(error);
            }
        }
    };

    const columns: Column<IProduct>[] = [
        { key: 'name', header: 'Name', width: '20%' },
        {
            key: 'category',
            header: 'Category',
            width: '15%',
            render: (row) => <span>{(row.category as any)?.name || 'N/A'}</span>
        },
        { key: 'slug', header: 'Slug', width: '15%' },
        { key: 'brand', header: 'Brand', width: '15%' },
        {
            key: 'sellingPrice',
            header: 'Selling Price',
            width: '10%',
            render: (row) => <span>${row.sellingPrice}</span>
        },
        {
            key: 'status',
            header: 'Status',
            width: '10%',
            render: (row) => (
                <span className={`px-2 py-1 rounded text-xs font-bold ${row.status === 'ACTIVE' ? 'bg-green-500/10 text-green-400' :
                    row.status === 'DRAFT' ? 'bg-zinc-700 text-zinc-400' : 'bg-red-500/10 text-red-400'
                    }`}>
                    {row.status}
                </span>
            )
        },
        {
            key: 'actions',
            header: 'Actions',
            align: 'right',
            render: (row) => (
                <div className="flex justify-end gap-2" onClick={(e) => e.stopPropagation()}>
                    <button
                        onClick={() => handleEdit(row)}
                        className="p-1.5 text-blue-400 hover:bg-blue-400/10 rounded-lg transition-colors"
                    >
                        <Edit2 size={16} />
                    </button>
                    <button
                        onClick={() => handleDelete(row._id)}
                        className="p-1.5 text-red-400 hover:bg-red-400/10 rounded-lg transition-colors"
                    >
                        <Trash size={16} />
                    </button>
                </div>
            ),
        },
    ];

    return (
        <div className="p-6 space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-text-primary">Products</h1>
                    <p className="text-text-secondary text-sm">Manage your product catalog.</p>
                </div>
                <div className="flex gap-3">
                    <Button variant="secondary" onClick={() => fetchProducts()} className="!p-2.5">
                        <RefreshCw size={18} />
                    </Button>
                    <Button onClick={() => navigate('/products/create')} className="flex items-center gap-2">
                        <Plus size={18} /> Add Product
                    </Button>
                </div>
            </div>

            <Table<IProduct>
                data={products}
                columns={columns}
                isLoading={loading}
                emptyMessage="No products found."
                onRowClick={(row) => handleEdit(row)}
            />

            <Pagination
                currentPage={page}
                totalRecords={totalRecords}
                limit={limit}
                onPageChange={setPage}
            />
        </div>
    );
};

export default ProductList;
