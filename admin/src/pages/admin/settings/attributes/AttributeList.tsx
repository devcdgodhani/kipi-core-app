import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import type { IAttribute } from '../../../../types';
import { attributeService } from '../../../../api/services/attribute.service';
import { setAttributes, setLoading, deleteAttribute } from '../../../../Redux/slices/attributeSlice';
import type { RootState } from '../../../../Redux/store';
import { Table, Button, type Column, Pagination } from '../../../../components/common';
import AttributeModal from './AttributeModal';
import { Plus, Edit2, Trash, RefreshCw } from 'lucide-react';

const AttributeList = () => {
    const dispatch = useDispatch();
    const { attributes, loading, totalRecords } = useSelector((state: RootState) => state.attribute);
    const [page, setPage] = useState(1);
    const limit = 10;

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedAttribute, setSelectedAttribute] = useState<IAttribute | null>(null);

    const fetchAttributes = async (params = { page: 1, limit: 10 }) => {
        dispatch(setLoading(true));
        try {
            const res = await attributeService.getWithPagination(params);
            dispatch(setAttributes({
                attributes: res.data.recordList,
                totalRecords: res.data.totalRecords
            }));
        } catch (error) {
            console.error(error);
        } finally {
            dispatch(setLoading(false));
        }
    };

    useEffect(() => {
        fetchAttributes({ page, limit });
    }, [dispatch, page]);

    const handleEdit = (attr: IAttribute) => {
        setSelectedAttribute(attr);
        setIsModalOpen(true);
    };

    const handleDelete = async (id: string) => {
        if (confirm('Are you sure you want to delete this attribute?')) {
            try {
                await attributeService.delete(id);
                dispatch(deleteAttribute(id));
            } catch (error) {
                console.error(error);
            }
        }
    };

    const handleCreate = () => {
        setSelectedAttribute(null);
        setIsModalOpen(true);
    };

    const columns: Column<IAttribute>[] = [
        { key: 'name', header: 'Name', width: '25%' },
        {
            key: 'code',
            header: 'Code',
            width: '20%',
            render: (row) => <span className="font-mono text-xs bg-surface-hover text-text-primary px-2 py-1 rounded border border-border">{row.code}</span>
        },
        { key: 'type', header: 'Type', width: '15%' },
        {
            key: 'isRequired',
            header: 'Required',
            width: '10%',
            render: (row) => (
                <span className={row.isRequired ? 'text-green-500 font-bold' : 'text-text-secondary'}>
                    {row.isRequired ? 'Yes' : 'No'}
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
                    <h1 className="text-2xl font-bold text-text-primary">Attributes</h1>
                    <p className="text-text-secondary text-sm">Manage product attributes like Color, Size, etc.</p>
                </div>
                <div className="flex gap-3">
                    <Button variant="secondary" onClick={() => fetchAttributes()} className="!p-2.5">
                        <RefreshCw size={18} />
                    </Button>
                    <Button onClick={handleCreate} className="flex items-center gap-2">
                        <Plus size={18} /> Create Attribute
                    </Button>
                </div>
            </div>

            <Table<IAttribute>
                data={attributes}
                columns={columns}
                isLoading={loading}
                emptyMessage="No attributes found. Create one to get started."
                onRowClick={(row) => handleEdit(row)}
            />

            <Pagination
                currentPage={page}
                totalRecords={totalRecords}
                limit={limit}
                onPageChange={setPage}
            />

            <AttributeModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                attribute={selectedAttribute}
            />
        </div>
    );
};

export default AttributeList;
