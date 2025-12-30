import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import { lotService, type Lot } from '../../../api/services/lot.service';
import { Table, Button, type Column, Pagination } from '../../../components/common';
import { Plus, Edit2, Trash, RefreshCw, AlertTriangle, CheckCircle, XCircle } from 'lucide-react';
import { toast } from 'react-hot-toast';

const LotList = () => {
    const navigate = useNavigate();
    const [lots, setLots] = useState<Lot[]>([]);
    const [loading, setLoading] = useState(false);
    const [totalRecords, setTotalRecords] = useState(0);
    const [page, setPage] = useState(1);
    const [filters] = useState({
        limit: 10,
        sourceType: '',
    });

    const fetchLots = async () => {
        setLoading(true);
        try {
            const res = await lotService.getWithPagination({ ...filters, page });
            setLots(res.data?.recordList || []);
            setTotalRecords(res.data?.totalRecords || 0);
        } catch (error) {
            console.error(error);
            toast.error('Failed to fetch lots');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchLots();
    }, [page, filters]);

    const handleEdit = (lot: Lot) => {
        navigate(`/inventory/lots/${lot._id}`);
    };

    const handleDelete = async (id: string) => {
        if (confirm('Are you sure you want to delete this lot?')) {
            try {
                await lotService.delete(id);
                toast.success('Lot deleted successfully');
                fetchLots();
            } catch (error) {
                console.error(error);
                toast.error('Failed to delete lot');
            }
        }
    };

    const columns: Column<Lot>[] = [
        { key: 'lotNumber', header: 'Lot Number', width: '20%' },
        {
            key: 'currentQuantity',
            header: 'Qty',
            width: '10%',
            render: (row) => (
                <span className={row.currentQuantity < 10 ? 'text-red-500 font-bold' : 'text-text-primary'}>
                    {row.currentQuantity} / {row.initialQuantity}
                </span>
            )
        },
        {
            key: 'costPerUnit',
            header: 'Cost',
            width: '10%',
            render: (row) => <span className="text-text-primary">₹{row.costPerUnit}</span>
        },
        {
            key: 'expiryDate',
            header: 'Expiry',
            width: '15%',
            render: (row) => <span className="text-text-primary">{row.expiryDate ? new Date(row.expiryDate).toLocaleDateString() : '-'}</span>
        },
        {
            key: 'qualityCheckStatus',
            header: 'QC Status',
            width: '15%',
            render: (row) => {
                const colors = {
                    PENDING: 'bg-yellow-500/10 text-yellow-500',
                    PASSED: 'bg-green-500/10 text-green-500',
                    FAILED: 'bg-red-500/10 text-red-500'
                };
                const icons = {
                    PENDING: <AlertTriangle size={14} className="mr-1" />,
                    PASSED: <CheckCircle size={14} className="mr-1" />,
                    FAILED: <XCircle size={14} className="mr-1" />
                };
                return (
                    <span className={`flex items-center w-fit px-2 py-1 rounded text-xs font-bold ${colors[row.qualityCheckStatus]}`}>
                        {icons[row.qualityCheckStatus]}
                        {row.qualityCheckStatus}
                    </span>
                );
            }
        },
        {
            key: 'actions',
            header: 'Actions',
            align: 'right',
            render: (row) => (
                <div className="flex justify-end gap-2" onClick={(e) => e.stopPropagation()}>
                    <button
                        onClick={() => handleEdit(row)}
                        className="p-1.5 text-blue-500 hover:bg-blue-500/10 rounded-lg transition-colors"
                    >
                        <Edit2 size={16} />
                    </button>
                    <button
                        onClick={() => handleDelete(row._id)}
                        className="p-1.5 text-red-500 hover:bg-red-500/10 rounded-lg transition-colors"
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
                    <h1 className="text-2xl font-bold text-text-primary">Lot Management</h1>
                    <p className="text-text-secondary text-sm">Track inventory batches, expiry, and costs.</p>
                </div>
                <div className="flex gap-3">
                    <Button variant="secondary" onClick={() => fetchLots()} className="!p-2.5">
                        <RefreshCw size={18} />
                    </Button>
                    <Button onClick={() => navigate('/inventory/lots/create')} className="flex items-center gap-2">
                        <Plus size={18} /> Add Lot
                    </Button>
                </div>
            </div>

            <Table<Lot>
                data={lots}
                columns={columns}
                isLoading={loading}
                emptyMessage="No lots found."
                onRowClick={(row) => handleEdit(row)}
            />

            <Pagination
                currentPage={page}
                totalRecords={totalRecords}
                limit={filters.limit}
                onPageChange={setPage}
            />
        </div>
    );
};

export default LotList;
