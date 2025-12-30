import { useEffect, useState } from 'react';
// import { useDispatch } from 'react-redux';
import type { ISku } from '../../../types';
import { skuService } from '../../../api/services/sku.service';
import { Table, Button, type Column, Input, Pagination } from '../../../components/common';
import { Box, RefreshCw, Edit2, Trash, Save, X, Search } from 'lucide-react';

const SkuList = () => {
    // const dispatch = useDispatch();
    const [skus, setSkus] = useState<ISku[]>([]);
    const [loading, setLoading] = useState(false);
    const [totalRecords, setTotalRecords] = useState(0);
    const [page, setPage] = useState(1);
    const limit = 10;
    const [editingId, setEditingId] = useState<string | null>(null);
    const [editForm, setEditForm] = useState<Partial<ISku>>({});
    const [searchTerm, setSearchTerm] = useState('');

    const fetchSkus = async (params = { page: 1, limit: 10 }) => {
        setLoading(true);
        try {
            const res = await skuService.getWithPagination({ ...params, sku: searchTerm ? { $regex: searchTerm, $options: 'i' } : undefined });
            setSkus(res.data.recordList || []);
            setTotalRecords(res.data.totalRecords || 0);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchSkus({ page, limit });
    }, [searchTerm, page]);

    const handleEdit = (sku: ISku) => {
        setEditingId(sku._id);
        setEditForm({ sellingPrice: sku.sellingPrice, stock: sku.stock });
    };

    const handleCancel = () => {
        setEditingId(null);
        setEditForm({});
    };

    const handleSave = async (id: string) => {
        try {
            await skuService.update(id, editForm);
            setSkus(prev => prev.map(s => s._id === id ? { ...s, ...editForm } : s));
            setEditingId(null);
        } catch (error) {
            console.error(error);
        }
    };

    const handleDelete = async (id: string) => {
        if (confirm('Are you sure you want to delete this SKU?')) {
            try {
                await skuService.delete(id);
                setSkus(prev => prev.filter(s => s._id !== id));
            } catch (error) {
                console.error(error);
            }
        }
    };

    const columns: Column<ISku>[] = [
        {
            key: 'sku',
            header: 'SKU Code',
            width: '20%',
            render: (row) => <span className="font-mono text-xs bg-surface-hover px-2 py-1 rounded text-text-primary">{row.sku}</span>
        },
        {
            key: 'product',
            header: 'Product',
            width: '20%',
            render: (row) => <span className="text-text-primary">{(row.product as any)?.name || 'N/A'}</span>
        },
        {
            key: 'attributes',
            header: 'Attributes',
            width: '25%',
            render: (row) => (
                <div className="flex flex-wrap gap-1">
                    {row.attributes?.map((attr, idx) => (
                        <span key={idx} className="bg-brand-500/10 border border-brand-500/20 text-brand-600 dark:text-brand-400 text-[10px] px-1.5 py-0.5 rounded">
                            {attr.attributeName || 'Attr'}: {attr.value}
                        </span>
                    ))}
                </div>
            )
        },
        {
            key: 'sellingPrice',
            header: 'Price',
            width: '12%',
            render: (row) => editingId === row._id ? (
                <input
                    type="number"
                    value={editForm.sellingPrice}
                    onChange={e => setEditForm(p => ({ ...p, sellingPrice: Number(e.target.value) }))}
                    className="w-full bg-surface border border-border rounded px-2 py-1 text-xs text-text-primary"
                />
            ) : (
                <span className="text-text-primary font-bold">${row.sellingPrice}</span>
            )
        },
        {
            key: 'stock',
            header: 'Stock',
            width: '10%',
            render: (row) => editingId === row._id ? (
                <input
                    type="number"
                    value={editForm.stock}
                    onChange={e => setEditForm(p => ({ ...p, stock: Number(e.target.value) }))}
                    className="w-full bg-surface border border-border rounded px-2 py-1 text-xs text-text-primary"
                />
            ) : (
                <span className={`font-mono ${row.stock < 5 ? 'text-red-400' : 'text-emerald-400'}`}>{row.stock}</span>
            )
        },
        {
            key: 'actions',
            header: 'Actions',
            align: 'right',
            render: (row) => (
                <div className="flex justify-end gap-2" onClick={(e) => e.stopPropagation()}>
                    {editingId === row._id ? (
                        <>
                            <button onClick={() => handleSave(row._id)} className="p-1.5 text-emerald-400 hover:bg-emerald-400/10 rounded-lg transition-colors">
                                <Save size={16} />
                            </button>
                            <button onClick={handleCancel} className="p-1.5 text-text-secondary hover:bg-surface-hover/80 rounded-lg transition-colors">
                                <X size={16} />
                            </button>
                        </>
                    ) : (
                        <>
                            <button onClick={() => handleEdit(row)} className="p-1.5 text-blue-400 hover:bg-blue-400/10 rounded-lg transition-colors">
                                <Edit2 size={16} />
                            </button>
                            <button onClick={() => handleDelete(row._id)} className="p-1.5 text-red-400 hover:bg-red-400/10 rounded-lg transition-colors">
                                <Trash size={16} />
                            </button>
                        </>
                    )}
                </div>
            ),
        },
    ];

    return (
        <div className="p-6 space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-text-primary flex items-center gap-3">
                        <Box className="text-brand-500" /> SKU Inventory
                    </h1>
                    <p className="text-text-secondary text-sm">Manage individual product variants, prices, and stock levels.</p>
                </div>
                <div className="flex gap-3">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary w-4 h-4" />
                        <Input
                            placeholder="Search SKUs..."
                            className="!pl-10 !py-2 !text-xs w-64"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <Button variant="secondary" onClick={() => fetchSkus()} className="!p-2.5">
                        <RefreshCw size={18} />
                    </Button>
                </div>
            </div>

            <Table<ISku>
                data={skus}
                columns={columns}
                isLoading={loading}
                emptyMessage="No SKUs found. Generate them from the Product management page."
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

export default SkuList;
