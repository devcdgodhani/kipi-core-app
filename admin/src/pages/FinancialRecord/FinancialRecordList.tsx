import React, { useEffect, useState, useCallback } from 'react';
import { Search, Filter, Plus, Eye, Edit2, Trash2, TrendingUp, TrendingDown, DollarSign } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { financialRecordService } from '../../services/financialRecord.service';
import { type IFinancialRecordAttributes, type IFinancialRecordFilters } from '../../types/financialRecord.types';
import CustomButton from '../../components/common/Button';
import { Table, type Column } from '../../components/common/Table';
import { CommonFilter, type FilterField } from '../../components/common/CommonFilter';
import { ROUTES } from '../../routes/routeConfig';
import { PopupModal } from '../../components/common/PopupModal';
import { format } from 'date-fns';

const FinancialRecordList: React.FC = () => {
    const navigate = useNavigate();
    const [records, setRecords] = useState<IFinancialRecordAttributes[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isFilterOpen, setIsFilterOpen] = useState(false);
    const [popup, setPopup] = useState<{
        isOpen: boolean;
        title: string;
        message: string;
        type: 'alert' | 'confirm' | 'prompt';
        onConfirm: () => void;
        loading?: boolean;
    }>({
        isOpen: false,
        title: '',
        message: '',
        type: 'alert',
        onConfirm: () => { }
    });

    const [filters, setFilters] = useState<IFinancialRecordFilters>({
        search: '',
        transactionType: undefined,
        subtype: undefined,
        platform: undefined,
        isAutomatic: undefined,
        status: undefined,
        startDate: undefined,
        endDate: undefined,
        page: 1,
        limit: 10,
        isPaginate: true
    });

    const [pagination, setPagination] = useState({
        totalRecords: 0,
        totalPages: 0,
        currentPage: 1
    });

    const fetchRecords = useCallback(async () => {
        try {
            setLoading(true);
            const response = await financialRecordService.getWithPagination(filters);
            if (response && response.data) {
                setRecords(response.data.recordList);
                setPagination({
                    totalRecords: response.data.totalRecords,
                    totalPages: response.data.totalPages,
                    currentPage: response.data.currentPage
                });
            }
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to fetch financial records');
        } finally {
            setLoading(false);
        }
    }, [filters]);

    useEffect(() => {
        const timer = setTimeout(() => {
            fetchRecords();
        }, 300);
        return () => clearTimeout(timer);
    }, [fetchRecords]);

    const handleFilterChange = (updatedFilters: Record<string, any>) => {
        setFilters(prev => ({ ...prev, ...updatedFilters, page: 1 }));
    };

    const handleLimitChange = (newLimit: number) => {
        setFilters(prev => ({ ...prev, limit: newLimit, page: 1 }));
    };

    const handleDeleteRecord = async (id: string) => {
        setPopup({
            isOpen: true,
            title: 'Delete Financial Record',
            message: 'Are you sure you want to delete this record? This action cannot be undone.',
            type: 'confirm',
            onConfirm: async () => {
                try {
                    setPopup(prev => ({ ...prev, loading: true }));
                    await financialRecordService.delete(id);
                    fetchRecords();
                    setPopup(prev => ({ ...prev, isOpen: false, loading: false }));
                } catch (err: any) {
                    setPopup({
                        isOpen: true,
                        title: 'Error',
                        message: err.response?.data?.message || 'Failed to delete record',
                        type: 'alert',
                        onConfirm: () => setPopup(prev => ({ ...prev, isOpen: false }))
                    });
                }
            }
        });
    };

    const filterFields: FilterField[] = [
        {
            key: 'transactionType',
            label: 'Transaction Type',
            type: 'select',
            multiple: true,
            options: [
                { label: 'Income', value: 'INCOME' },
                { label: 'Expense', value: 'EXPENSE' }
            ]
        },
        {
            key: 'subtype',
            label: 'Subtype',
            type: 'select',
            multiple: true,
            options: [
                { label: 'Order', value: 'ORDER' },
                { label: 'Lot Amount', value: 'LOT_AMOUNT' },
                { label: 'Return', value: 'RETURN' },
                { label: 'Reward', value: 'REWARD' },
                { label: 'Manual', value: 'MANUAL' },
                { label: 'Other', value: 'OTHER' }
            ]
        },
        {
            key: 'platform',
            label: 'Platform',
            type: 'select',
            multiple: true,
            options: [
                { label: 'Amazon', value: 'AMAZON' },
                { label: 'Flipkart', value: 'FLIPKART' },
                { label: 'Meesho', value: 'MEESHO' },
                { label: 'Ajio', value: 'AJIO' },
                { label: 'Myntra', value: 'MYNTRA' },
                { label: 'Snapdeal', value: 'SNAPDEAL' },
                { label: 'Other', value: 'OTHER' }
            ]
        },
        {
            key: 'isAutomatic',
            label: 'Record Type',
            type: 'select',
            options: [
                { label: 'Automatic', value: 'true' },
                { label: 'Manual', value: 'false' }
            ]
        },
        {
            key: 'status',
            label: 'Status',
            type: 'select',
            multiple: true,
            options: [
                { label: 'Active', value: 'ACTIVE' },
                { label: 'Inactive', value: 'INACTIVE' }
            ]
        },
        {
            key: 'startDate',
            label: 'Date Range',
            type: 'date-range'
        }
    ];

    const columns: Column<IFinancialRecordAttributes>[] = [
        {
            key: 'transactionType',
            label: 'Type',
            render: (record) => (
                <div className="flex items-center gap-2">
                    {record.transactionType === 'INCOME' ? (
                        <div className="w-8 h-8 bg-green-50 text-green-600 rounded-lg flex items-center justify-center">
                            <TrendingUp size={16} />
                        </div>
                    ) : (
                        <div className="w-8 h-8 bg-red-50 text-red-600 rounded-lg flex items-center justify-center">
                            <TrendingDown size={16} />
                        </div>
                    )}
                    <span className={`text-xs font-black uppercase tracking-tight ${record.transactionType === 'INCOME' ? 'text-green-600' : 'text-red-600'}`}>
                        {record.transactionType}
                    </span>
                </div>
            )
        },
        {
            key: 'subtype',
            label: 'Subtype',
            render: (record) => (
                <span className="text-xs font-bold text-gray-900 uppercase tracking-tight">
                    {record.subtype.replace('_', ' ')}
                </span>
            )
        },
        {
            key: 'amount',
            label: 'Amount',
            render: (record) => (
                <div className="flex items-center gap-2">
                    <DollarSign size={14} className="text-gray-400" />
                    <span className={`text-sm font-black ${record.transactionType === 'INCOME' ? 'text-green-600' : 'text-red-600'}`}>
                        ₹{record.amount.toLocaleString()}
                    </span>
                </div>
            )
        },
        {
            key: 'startDate',
            label: 'Date',
            render: (record) => (
                <span className="text-xs text-gray-600 font-medium">
                    {format(new Date(record.startDate), 'MMM dd, yyyy')}
                </span>
            )
        },
        {
            key: 'isAutomatic',
            label: 'Source',
            render: (record) => (
                <span className={`px-2 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest ${record.isAutomatic ? 'bg-primary/10 text-primary' : 'bg-gray-100 text-gray-600'}`}>
                    {record.isAutomatic ? 'Auto' : 'Manual'}
                </span>
            )
        },
        {
            key: 'platform',
            label: 'Platform',
            render: (record) => (
                record.platform ? (
                    <span className="text-xs text-gray-600 font-medium">{record.platform}</span>
                ) : (
                    <span className="text-xs text-gray-400">—</span>
                )
            )
        },
        {
            key: 'status',
            label: 'Status',
            render: (record) => (
                <span className={`px-2 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest ${record.status === 'ACTIVE' ? 'bg-green-50 text-green-600' : 'bg-gray-100 text-gray-600'}`}>
                    {record.status}
                </span>
            )
        }
    ];

    const actions = [
        {
            label: 'View',
            icon: Eye,
            onClick: (record: IFinancialRecordAttributes) => navigate(`/dashboard/${ROUTES.DASHBOARD.FINANCIAL_RECORDS_DETAIL.replace(':id', record._id)}`)
        },
        {
            label: 'Edit',
            icon: Edit2,
            onClick: (record: IFinancialRecordAttributes) => navigate(`/dashboard/${ROUTES.DASHBOARD.FINANCIAL_RECORDS_EDIT.replace(':id', record._id)}`),
            condition: (record: IFinancialRecordAttributes) => !record.isAutomatic
        },
        {
            label: 'Delete',
            icon: Trash2,
            onClick: (record: IFinancialRecordAttributes) => handleDeleteRecord(record._id),
            variant: 'danger' as const,
            condition: (record: IFinancialRecordAttributes) => !record.isAutomatic
        }
    ];

    return (
        <div className="p-8 max-w-[1600px] mx-auto space-y-8">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-4xl font-black text-gray-900 uppercase tracking-tighter">Financial Records</h1>
                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-1">
                        Income & expense tracking
                    </p>
                </div>
                <div className="flex gap-3">
                    <CustomButton
                        variant="secondary"
                        onClick={() => navigate(`/dashboard/${ROUTES.DASHBOARD.FINANCIAL_ANALYTICS}`)}
                        className="h-12 px-6"
                    >
                        <DollarSign size={16} />
                        Analytics
                    </CustomButton>
                    <CustomButton
                        variant="primary"
                        onClick={() => navigate(`/dashboard/${ROUTES.DASHBOARD.FINANCIAL_RECORDS_CREATE}`)}
                        className="h-12 px-6"
                    >
                        <Plus size={16} />
                        Add Record
                    </CustomButton>
                </div>
            </div>

            <div className="bg-white rounded-[3rem] border border-gray-100 shadow-2xl shadow-gray-200/50 overflow-hidden">
                <div className="p-8 border-b border-gray-100 space-y-6">
                    <div className="flex items-center gap-4">
                        <div className="relative flex-1">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                            <input
                                type="text"
                                placeholder="Search by notes, account number..."
                                value={filters.search || ''}
                                onChange={(e) => handleFilterChange({ search: e.target.value })}
                                className="w-full h-14 pl-12 pr-4 rounded-2xl border border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all text-sm font-medium"
                            />
                        </div>
                        <CustomButton
                            variant={isFilterOpen ? 'primary' : 'secondary'}
                            onClick={() => setIsFilterOpen(!isFilterOpen)}
                            className="h-14 px-6"
                        >
                            <Filter size={16} />
                            Filters
                        </CustomButton>
                    </div>

                    {isFilterOpen && (
                        <CommonFilter
                            fields={filterFields}
                            values={filters}
                            onChange={handleFilterChange}
                        />
                    )}
                </div>

                <Table
                    columns={columns}
                    data={records}
                    actions={actions}
                    loading={loading}
                    pagination={{
                        currentPage: pagination.currentPage,
                        totalPages: pagination.totalPages,
                        totalRecords: pagination.totalRecords,
                        onPageChange: (page) => setFilters(prev => ({ ...prev, page })),
                        limit: filters.limit || 10,
                        onLimitChange: handleLimitChange
                    }}
                />
            </div>

            <PopupModal
                isOpen={popup.isOpen}
                onClose={() => setPopup(prev => ({ ...prev, isOpen: false }))}
                title={popup.title}
                message={popup.message}
                type={popup.type}
                onConfirm={popup.onConfirm}
                loading={popup.loading}
            />
        </div>
    );
};

export default FinancialRecordList;
