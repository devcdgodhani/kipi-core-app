import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Save } from 'lucide-react';
import { financialRecordService } from '../../services/financialRecord.service';
import type { IFinancialRecordAttributes, IFinancialRecordCreateReq, IFinancialRecordUpdateReq } from '../../types/financialRecord.types';
import { INDIAN_BANKS } from '../../types/financialRecord.types';
import CustomButton from '../../components/common/Button';
import { startOfDay, endOfDay } from 'date-fns';

const FinancialRecordForm: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const isEditMode = Boolean(id);

    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [formData, setFormData] = useState<IFinancialRecordCreateReq>({
        transactionType: 'INCOME',
        subtype: '',
        amount: 0,
        startDate: startOfDay(new Date()),
        endDate: endOfDay(new Date()),
        platform: undefined,
        bankName: undefined,
        accountNumber: undefined,
        notes: undefined
    });

    useEffect(() => {
        if (isEditMode && id) {
            fetchRecord();
        }
    }, [id, isEditMode]);

    const fetchRecord = async () => {
        try {
            setLoading(true);
            const response = await financialRecordService.getOne(id!);
            const record = response.data;
            setFormData({
                transactionType: record.transactionType,
                subtype: record.subtype,
                amount: record.amount,
                startDate: new Date(record.startDate),
                endDate: new Date(record.endDate),
                platform: record.platform,
                bankName: record.bankName,
                accountNumber: record.accountNumber,
                notes: record.notes
            });
        } catch (error) {
            console.error('Error fetching record:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (field: string, value: any) => {
        setFormData(prev => ({ ...prev, [field]: value }));
        if (errors[field]) {
            setErrors(prev => ({ ...prev, [field]: '' }));
        }
    };

    const handleDateChange = (date: Date) => {
        setFormData(prev => ({
            ...prev,
            startDate: startOfDay(date),
            endDate: endOfDay(date)
        }));
    };

    const validate = (): boolean => {
        const newErrors: Record<string, string> = {};

        if (!formData.transactionType) newErrors.transactionType = 'Transaction type is required';
        if (!formData.subtype) newErrors.subtype = 'Subtype is required';
        if (!formData.amount || formData.amount <= 0) newErrors.amount = 'Amount must be greater than 0';
        if (!formData.startDate) newErrors.startDate = 'Date is required';

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validate()) return;

        try {
            setLoading(true);
            if (isEditMode) {
                await financialRecordService.update(id!, formData as IFinancialRecordUpdateReq);
            } else {
                await financialRecordService.create(formData);
            }
            navigate('/dashboard/financial-records');
        } catch (error: any) {
            console.error('Error saving record:', error);
            setErrors({ submit: error.response?.data?.message || 'Failed to save record' });
        } finally {
            setLoading(false);
        }
    };

    const subtypeOptions = formData.transactionType === 'INCOME'
        ? [
            { value: 'ORDER', label: 'Order' },
            { value: 'MANUAL', label: 'Manual' },
            { value: 'OTHER', label: 'Other' }
        ]
        : [
            { value: 'LOT_AMOUNT', label: 'Lot Amount' },
            { value: 'RETURN', label: 'Return' },
            { value: 'REWARD', label: 'Reward' },
            { value: 'MANUAL', label: 'Manual' },
            { value: 'OTHER', label: 'Other' }
        ];

    const platformOptions = [
        { value: '', label: 'Select Platform' },
        { value: 'AMAZON', label: 'Amazon' },
        { value: 'FLIPKART', label: 'Flipkart' },
        { value: 'MEESHO', label: 'Meesho' },
        { value: 'AJIO', label: 'Ajio' },
        { value: 'MYNTRA', label: 'Myntra' },
        { value: 'SNAPDEAL', label: 'Snapdeal' },
        { value: 'OTHER', label: 'Other' }
    ];

    return (
        <div className="p-8 max-w-[1000px] mx-auto space-y-8">
            <div className="flex items-center gap-4">
                <button
                    onClick={() => navigate('/dashboard/financial-records')}
                    className="w-12 h-12 rounded-2xl bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors"
                >
                    <ArrowLeft size={20} />
                </button>
                <div>
                    <h1 className="text-4xl font-black text-gray-900 uppercase tracking-tighter">
                        {isEditMode ? 'Edit' : 'Create'} Financial Record
                    </h1>
                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-1">
                        {isEditMode ? 'Update existing record' : 'Add new income or expense'}
                    </p>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="bg-white rounded-[3rem] border border-gray-100 p-10 shadow-2xl shadow-gray-200/50 space-y-8">
                {errors.submit && (
                    <div className="p-4 bg-red-50 border border-red-200 rounded-2xl">
                        <p className="text-sm text-red-600 font-medium">{errors.submit}</p>
                    </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <label className="text-xs font-bold text-gray-700 uppercase tracking-widest">
                            Transaction Type *
                        </label>
                        <select
                            value={formData.transactionType}
                            onChange={(e) => handleChange('transactionType', e.target.value)}
                            className="w-full h-14 px-4 rounded-2xl border border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all text-sm font-medium"
                        >
                            <option value="INCOME">Income</option>
                            <option value="EXPENSE">Expense</option>
                        </select>
                        {errors.transactionType && <p className="text-xs text-red-600">{errors.transactionType}</p>}
                    </div>

                    <div className="space-y-2">
                        <label className="text-xs font-bold text-gray-700 uppercase tracking-widest">
                            Subtype *
                        </label>
                        <select
                            value={formData.subtype}
                            onChange={(e) => handleChange('subtype', e.target.value)}
                            className="w-full h-14 px-4 rounded-2xl border border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all text-sm font-medium"
                        >
                            <option value="">Select Subtype</option>
                            {subtypeOptions.map(opt => (
                                <option key={opt.value} value={opt.value}>{opt.label}</option>
                            ))}
                        </select>
                        {errors.subtype && <p className="text-xs text-red-600">{errors.subtype}</p>}
                    </div>

                    <div className="space-y-2">
                        <label className="text-xs font-bold text-gray-700 uppercase tracking-widest">
                            Amount (₹) *
                        </label>
                        <input
                            type="number"
                            value={formData.amount}
                            onChange={(e) => handleChange('amount', parseFloat(e.target.value))}
                            className="w-full h-14 px-4 rounded-2xl border border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all text-sm font-medium"
                            placeholder="0.00"
                            step="0.01"
                            min="0"
                        />
                        {errors.amount && <p className="text-xs text-red-600">{errors.amount}</p>}
                    </div>

                    <div className="space-y-2">
                        <label className="text-xs font-bold text-gray-700 uppercase tracking-widest">
                            Transaction Date *
                        </label>
                        <input
                            type="date"
                            value={formData.startDate ? formData.startDate.toISOString().split('T')[0] : ''}
                            onChange={(e) => handleDateChange(new Date(e.target.value))}
                            className="w-full h-14 px-4 rounded-2xl border border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all text-sm font-medium"
                        />
                        {errors.startDate && <p className="text-xs text-red-600">{errors.startDate}</p>}
                    </div>

                    <div className="space-y-2">
                        <label className="text-xs font-bold text-gray-700 uppercase tracking-widest">
                            E-commerce Platform
                        </label>
                        <select
                            value={formData.platform || ''}
                            onChange={(e) => handleChange('platform', e.target.value || undefined)}
                            className="w-full h-14 px-4 rounded-2xl border border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all text-sm font-medium"
                        >
                            {platformOptions.map(opt => (
                                <option key={opt.value} value={opt.value}>{opt.label}</option>
                            ))}
                        </select>
                    </div>

                    <div className="space-y-2">
                        <label className="text-xs font-bold text-gray-700 uppercase tracking-widest">
                            Bank Name
                        </label>
                        <select
                            value={formData.bankName || ''}
                            onChange={(e) => handleChange('bankName', e.target.value || undefined)}
                            className="w-full h-14 px-4 rounded-2xl border border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all text-sm font-medium"
                        >
                            <option value="">Select Bank</option>
                            {INDIAN_BANKS.map(bank => (
                                <option key={bank} value={bank}>{bank}</option>
                            ))}
                        </select>
                    </div>

                    <div className="md:col-span-2 space-y-2">
                        <label className="text-xs font-bold text-gray-700 uppercase tracking-widest">
                            Account Number
                        </label>
                        <input
                            type="text"
                            value={formData.accountNumber || ''}
                            onChange={(e) => handleChange('accountNumber', e.target.value || undefined)}
                            className="w-full h-14 px-4 rounded-2xl border border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all text-sm font-medium"
                            placeholder="Enter account number"
                        />
                    </div>

                    <div className="md:col-span-2 space-y-2">
                        <label className="text-xs font-bold text-gray-700 uppercase tracking-widest">
                            Notes
                        </label>
                        <textarea
                            value={formData.notes || ''}
                            onChange={(e) => handleChange('notes', e.target.value || undefined)}
                            className="w-full h-32 px-4 py-3 rounded-2xl border border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all text-sm font-medium resize-none"
                            placeholder="Add any additional notes..."
                        />
                    </div>
                </div>

                <div className="flex justify-end gap-4 pt-6 border-t border-gray-100">
                    <CustomButton
                        type="button"
                        variant="secondary"
                        onClick={() => navigate('/dashboard/financial-records')}
                        className="h-14 px-8"
                    >
                        Cancel
                    </CustomButton>
                    <CustomButton
                        type="submit"
                        variant="primary"
                        disabled={loading}
                        className="h-14 px-8"
                    >
                        <Save size={16} />
                        {loading ? 'Saving...' : isEditMode ? 'Update Record' : 'Create Record'}
                    </CustomButton>
                </div>
            </form>
        </div>
    );
};

export default FinancialRecordForm;
