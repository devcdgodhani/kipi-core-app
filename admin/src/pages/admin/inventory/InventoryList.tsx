import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import { inventoryService, type Inventory } from '../../../api/services/inventory.service';
import { Table, Button, type Column, Modal, Input, Pagination } from '../../../components/common';
import { RefreshCw, TrendingUp, AlertTriangle } from 'lucide-react';
import { toast } from 'react-hot-toast';

const InventoryList = () => {
    const navigate = useNavigate();
    const [inventories, setInventories] = useState<Inventory[]>([]);
    const [loading, setLoading] = useState(false);
    const [totalRecords, setTotalRecords] = useState(0);
    const [page, setPage] = useState(1);
    const limit = 10;
    const [selectedItem, setSelectedItem] = useState<Inventory | null>(null);
    const [isAdjustModalOpen, setIsAdjustModalOpen] = useState(false);

    // Adjustment state
    const [adjustQty, setAdjustQty] = useState(0);
    const [adjustReason, setAdjustReason] = useState('');

    const fetchInventory = async () => {
        setLoading(true);
        try {
            const res = await inventoryService.getWithPagination({ page, limit });
            setInventories(res.data.recordList || []);
            setTotalRecords(res.data.totalRecords || 0);
        } catch (error) {
            console.error(error);
            toast.error('Failed to fetch inventory');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchInventory();
    }, [page]);

    const handleAdjustClick = (item: Inventory) => {
        setSelectedItem(item);
        setAdjustQty(0);
        setAdjustReason('');
        setIsAdjustModalOpen(true);
    };

    const handleAdjustSubmit = async () => {
        if (!selectedItem || adjustQty === 0) return;

        try {
            await inventoryService.adjustStock(
                // @ts-ignore
                selectedItem.sku._id || selectedItem.sku, // Handle populated/unpopulated
                adjustQty,
                adjustReason || 'Manual adjustment'
            );
            toast.success('Stock adjusted successfully');
            setIsAdjustModalOpen(false);
            fetchInventory();
        } catch (error) {
            console.error(error);
            toast.error('Failed to adjust stock');
        }
    };

    const columns: Column<Inventory>[] = [
        {
            key: 'sku',
            header: 'Product/SKU',
            width: '25%',
            render: (row: any) => (
                <div>
                    <div className="font-medium text-text-primary">{row.sku?.product?.name || 'Unknown Product'}</div>
                    <div className="text-xs text-text-secondary">{row.sku?.sku || 'Unknown SKU'}</div>
                </div>
            )
        },
        {
            key: 'totalAvailableStock',
            header: 'Available',
            width: '15%',
            render: (row) => (
                <span className={`font-bold ${row.totalAvailableStock <= row.lowStockThreshold ? 'text-red-400' : 'text-green-400'}`}>
                    {row.totalAvailableStock}
                </span>
            )
        },
        {
            key: 'totalReservedStock',
            header: 'Reserved',
            width: '15%',
            render: (row) => <span className="text-text-secondary">{row.totalReservedStock}</span>
        },
        {
            key: 'totalQuantity',
            header: 'Total',
            width: '15%',
            render: (row) => <span>{row.totalQuantity}</span>
        },
        {
            key: 'lowStockThreshold',
            header: 'Low Stock Level',
            width: '15%',
            render: (row) => <span className="text-text-secondary">{row.lowStockThreshold}</span>
        },
        {
            key: 'actions',
            header: 'Actions',
            align: 'right',
            render: (row) => (
                <div className="flex justify-end gap-2" onClick={(e) => e.stopPropagation()}>
                    <Button
                        variant="secondary"
                        onClick={() => handleAdjustClick(row)}
                        className="!p-1.5 text-xs flex items-center gap-1"
                    >
                        <TrendingUp size={14} /> Adjust
                    </Button>
                </div>
            ),
        },
    ];

    return (
        <div className="p-6 space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-text-primary">Inventory</h1>
                    <p className="text-text-secondary text-sm">Monitor levels, adjustments, and low stock alerts.</p>
                </div>
                <div className="flex gap-3">
                    <Button variant="secondary" onClick={() => fetchInventory()} className="!p-2.5">
                        <RefreshCw size={18} />
                    </Button>
                    <Button onClick={() => navigate('/inventory/lots')} className="flex items-center gap-2">
                        View Lots
                    </Button>
                </div>
            </div>

            <Table<Inventory>
                data={inventories}
                columns={columns}
                isLoading={loading}
                emptyMessage="No inventory records found."
            />

            <Pagination
                currentPage={page}
                totalRecords={totalRecords}
                limit={limit}
                onPageChange={setPage}
            />

            {/* Quick Adjustment Modal */}
            <Modal isOpen={isAdjustModalOpen} onClose={() => setIsAdjustModalOpen(false)} title="Quick Stock Adjustment">
                <div className="space-y-4">
                    <div className="p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-lg text-yellow-400 text-sm flex items-start gap-2">
                        <AlertTriangle size={16} className="mt-0.5" />
                        <p>This will perform a manual stock adjustment. For precise tracking, please use Lot Management.</p>
                    </div>

                    <div>
                        <label className="text-sm text-text-secondary">Adjustment Quantity (+/-)</label>
                        <Input
                            type="number"
                            value={adjustQty}
                            onChange={(e) => setAdjustQty(Number(e.target.value))}
                            placeholder="e.g. 10 or -5"
                            className="bg-surface border-border"
                        />
                        <p className="text-xs text-text-secondary mt-1">Positive adds stock, negative removes stock.</p>
                    </div>

                    <div>
                        <label className="text-sm text-text-secondary">Reason</label>
                        <Input
                            value={adjustReason}
                            onChange={(e) => setAdjustReason(e.target.value)}
                            placeholder="e.g. Found extra, damaged, etc."
                            className="bg-surface border-border"
                        />
                    </div>

                    <div className="flex justify-end gap-2 pt-2">
                        <Button variant="secondary" onClick={() => setIsAdjustModalOpen(false)}>Cancel</Button>
                        <Button onClick={handleAdjustSubmit}>Confirm Adjustment</Button>
                    </div>
                </div>
            </Modal>
        </div>
    );
};

export default InventoryList;
