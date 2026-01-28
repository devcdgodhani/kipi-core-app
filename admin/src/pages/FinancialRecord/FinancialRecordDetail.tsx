import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Edit2, Trash2, Calendar, DollarSign, Tag, Building2, CreditCard, FileText, Link as LinkIcon } from 'lucide-react';
import { financialRecordService } from '../../services/financialRecord.service';
import type { IFinancialRecordAttributes } from '../../types/financialRecord.types';
import CustomButton from '../../components/common/Button';
import { format } from 'date-fns';
import { PopupModal } from '../../components/common/PopupModal';

const FinancialRecordDetail: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [record, setRecord] = useState<IFinancialRecordAttributes | null>(null);
    const [loading, setLoading] = useState(true);
    const [popup, setPopup] = useState<{
        isOpen: boolean;
        title: string;
        message: string;
        type: 'alert' | 'confirm';
        onConfirm: () => void;
        loading?: boolean;
    }>({
        isOpen: false,
        title: '',
        message: '',
        type: 'alert',
        onConfirm: () => { }
    });

    useEffect(() => {
        if (id) {
            fetchRecord();
        }
    }, [id]);

    const fetchRecord = async () => {
        try {
            setLoading(true);
            const response = await financialRecordService.getOne(id!);
            setRecord(response.data);
        } catch (error) {
            console.error('Error fetching record:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = () => {
        setPopup({
            isOpen: true,
            title: 'Delete Financial Record',
            message: 'Are you sure you want to delete this record? This action cannot be undone.',
            type: 'confirm',
            onConfirm: async () => {
                try {
                    setPopup(prev => ({ ...prev, loading: true }));
                    await financialRecordService.delete(id!);
                    navigate('/financial-records');
                } catch (error: any) {
                    setPopup({
                        isOpen: true,
                        title: 'Error',
                        message: error.response?.data?.message || 'Failed to delete record',
                        type: 'alert',
                        onConfirm: () => setPopup(prev => ({ ...prev, isOpen: false }))
                    });
                }
            }
        });
    };

    if (loading) {
        return (
            <div className="p-8 max-w-[1200px] mx-auto">
                <div className="animate-pulse space-y-8">
                    <div className="h-12 bg-gray-200 rounded-2xl w-1/3"></div>
                    <div className="h-96 bg-gray-200 rounded-[3rem]"></div>
                </div>
            </div>
        );
    }

    if (!record) {
        return (
            <div className="p-8 max-w-[1200px] mx-auto text-center">
                <p className="text-gray-600">Record not found</p>
            </div>
        );
    }

    const infoSections = [
        {
            title: 'Transaction Details',
            icon: DollarSign,
            items: [
                { label: 'Transaction Type', value: record.transactionType, highlight: record.transactionType === 'INCOME' ? 'text-green-600' : 'text-red-600' },
                { label: 'Subtype', value: record.subtype.replace('_', ' ') },
                { label: 'Amount', value: `₹${record.amount.toLocaleString()}`, highlight: record.transactionType === 'INCOME' ? 'text-green-600' : 'text-red-600' },
                { label: 'Source', value: record.isAutomatic ? 'Automatic' : 'Manual', badge: true }
            ]
        },
        {
            title: 'Date Information',
            icon: Calendar,
            items: [
                { label: 'Start Date', value: format(new Date(record.startDate), 'PPP • HH:mm') },
                { label: 'End Date', value: format(new Date(record.endDate), 'PPP • HH:mm') },
                { label: 'Created At', value: format(new Date(record.createdAt), 'PPP • HH:mm') },
                { label: 'Updated At', value: format(new Date(record.updatedAt), 'PPP • HH:mm') }
            ]
        }
    ];

    if (record.platform || record.bankName || record.accountNumber) {
        infoSections.push({
            title: 'Payment Details',
            icon: CreditCard,
            items: [
                ...(record.platform ? [{ label: 'Platform', value: record.platform }] : []),
                ...(record.bankName ? [{ label: 'Bank Name', value: record.bankName }] : []),
                ...(record.accountNumber ? [{ label: 'Account Number', value: record.accountNumber }] : [])
            ]
        });
    }

    if (record.orderId || record.lotId || record.returnId || record.walletTransactionId) {
        infoSections.push({
            title: 'Linked References',
            icon: LinkIcon,
            items: [
                ...(record.orderId ? [{ label: 'Order ID', value: record.orderId, link: `/orders/${record.orderId}` }] : []),
                ...(record.lotId ? [{ label: 'Lot ID', value: record.lotId, link: `/lots/edit/${record.lotId}` }] : []),
                ...(record.returnId ? [{ label: 'Return ID', value: record.returnId, link: `/returns/${record.returnId}` }] : []),
                ...(record.walletTransactionId ? [{ label: 'Wallet Transaction ID', value: record.walletTransactionId }] : [])
            ]
        });
    }

    return (
        <div className="p-8 max-w-[1200px] mx-auto space-y-8">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => navigate('/financial-records')}
                        className="w-12 h-12 rounded-2xl bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors"
                    >
                        <ArrowLeft size={20} />
                    </button>
                    <div>
                        <h1 className="text-4xl font-black text-gray-900 uppercase tracking-tighter">Financial Record</h1>
                        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-1">
                            {record.subtype.replace('_', ' ')} • {record.transactionType}
                        </p>
                    </div>
                </div>
                {!record.isAutomatic && (
                    <div className="flex gap-3">
                        <CustomButton
                            variant="secondary"
                            onClick={() => navigate(`/financial-records/edit/${record._id}`)}
                            className="h-12 px-6"
                        >
                            <Edit2 size={16} />
                            Edit
                        </CustomButton>
                        <CustomButton
                            variant="danger"
                            onClick={handleDelete}
                            className="h-12 px-6"
                        >
                            <Trash2 size={16} />
                            Delete
                        </CustomButton>
                    </div>
                )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {infoSections.map((section, idx) => (
                    <div key={idx} className="bg-white rounded-[3rem] border border-gray-100 p-10 shadow-2xl shadow-gray-200/50">
                        <div className="flex items-center gap-4 mb-8">
                            <div className="w-12 h-12 bg-primary/5 text-primary rounded-2xl flex items-center justify-center">
                                <section.icon size={24} />
                            </div>
                            <h2 className="text-xl font-black text-gray-900 uppercase tracking-tighter">{section.title}</h2>
                        </div>
                        <div className="space-y-6">
                            {section.items.map((item, itemIdx) => (
                                <div key={itemIdx} className="flex items-start justify-between">
                                    <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">{item.label}</span>
                                    {item.link ? (
                                        <button
                                            onClick={() => navigate(item.link!)}
                                            className="text-sm font-black text-primary hover:underline text-right"
                                        >
                                            {item.value}
                                        </button>
                                    ) : item.badge ? (
                                        <span className={`px-2 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest ${item.value === 'Automatic' ? 'bg-primary/10 text-primary' : 'bg-gray-100 text-gray-600'}`}>
                                            {item.value}
                                        </span>
                                    ) : (
                                        <span className={`text-sm font-black text-right ${item.highlight || 'text-gray-900'}`}>{item.value}</span>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                ))}

                {record.notes && (
                    <div className="md:col-span-2 bg-white rounded-[3rem] border border-gray-100 p-10 shadow-2xl shadow-gray-200/50">
                        <div className="flex items-center gap-4 mb-6">
                            <div className="w-12 h-12 bg-primary/5 text-primary rounded-2xl flex items-center justify-center">
                                <FileText size={24} />
                            </div>
                            <h2 className="text-xl font-black text-gray-900 uppercase tracking-tighter">Notes</h2>
                        </div>
                        <p className="text-sm text-gray-700 leading-relaxed">{record.notes}</p>
                    </div>
                )}
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

export default FinancialRecordDetail;
