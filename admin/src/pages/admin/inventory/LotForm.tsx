import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router';
import { useForm } from 'react-hook-form';
import { lotService, type CreateLotData } from '../../../api/services/lot.service';
import { userService } from '../../../api/services/user.service';

import { Button, Input } from '../../../components/common'; // Assuming Input component exists
import { ArrowLeft, Save } from 'lucide-react';
import { toast } from 'react-hot-toast';

const LotForm = () => {
    const navigate = useNavigate();
    const { id } = useParams();
    const isEdit = !!id;
    const [loading, setLoading] = useState(false);
    const [suppliers, setSuppliers] = useState<any[]>([]);

    const { register, handleSubmit, reset, watch, formState: { errors } } = useForm<CreateLotData>({
        defaultValues: {
            sourceType: 'SELF_MANUFACTURE',
            costPerUnit: 0,
            initialQuantity: 0,
            qualityCheckStatus: 'PENDING'
        }
    });

    const sourceType = watch('sourceType');

    useEffect(() => {
        // Fetch helper data
        const fetchHelpers = async () => {
            try {
                // Fetch Suppliers
                const supplierRes = await userService.getAll({ type: 'SUPPLIER' });
                setSuppliers(Array.isArray(supplierRes.data) ? supplierRes.data : []);
            } catch (error) {
                console.error('Failed to fetch helpers', error);
            }
        };
        fetchHelpers();

        if (isEdit && id) {
            const fetchLot = async () => {
                try {
                    const res = await lotService.getById(id);
                    const lot = res.data;
                    if (lot) {
                        // Format dates for input
                        const data = {
                            ...lot,
                            supplierId: lot.supplierId?._id || lot.supplierId,
                            manufacturingDate: lot.manufacturingDate ? new Date(lot.manufacturingDate).toISOString().split('T')[0] : '',
                            expiryDate: lot.expiryDate ? new Date(lot.expiryDate).toISOString().split('T')[0] : ''
                        };
                        reset(data);
                    }
                } catch (error) {
                    toast.error('Failed to fetch lot details');
                    navigate('/inventory/lots');
                }
            };
            fetchLot();
        }
    }, [id, isEdit, reset, navigate]);

    const onSubmit = async (data: CreateLotData) => {
        setLoading(true);
        try {
            if (isEdit && id) {
                await lotService.update(id, data);
                toast.success('Lot updated successfully');
            } else {
                await lotService.create(data);
                toast.success('Lot created successfully');
            }
            navigate('/inventory/lots');
        } catch (error) {
            console.error(error);
            toast.error(isEdit ? 'Failed to update lot' : 'Failed to create lot');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="p-6 space-y-6">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Button variant="secondary" onClick={() => navigate('/inventory/lots')} className="!p-2">
                        <ArrowLeft size={20} />
                    </Button>
                    <div>
                        <h1 className="text-2xl font-bold text-text-primary">{isEdit ? 'Edit Lot' : 'Create New Lot'}</h1>
                        <p className="text-text-secondary text-sm">{isEdit ? 'Update existing lot details' : 'Register a new batch of inventory'}</p>
                    </div>
                </div>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="bg-surface rounded-xl p-6 border border-border space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Basic Info */}
                    <div className="space-y-4">
                        <h3 className="text-lg font-semibold text-text-primary border-b border-border pb-2">Batch Information</h3>

                        <div className="space-y-1">
                            <label className="text-sm font-medium text-text-secondary">Lot Number</label>
                            <Input
                                {...register('lotNumber', { required: 'Lot number is required' })}
                                placeholder="e.g. LOT-2023-001"
                                className="w-full bg-surface border-border"
                            />
                            {errors.lotNumber && <span className="text-red-400 text-xs">{errors.lotNumber.message}</span>}
                        </div>


                        <div className="space-y-1">
                            <label className="text-sm font-medium text-text-secondary">Source Type</label>
                            <select
                                {...register('sourceType', { required: true })}
                                className="w-full h-11 px-3 rounded-lg bg-surface border-border text-text-primary focus:outline-none focus:border-blue-500"
                            >
                                <option value="SELF_MANUFACTURE">Self Manufacture</option>
                                <option value="SUPPLIER">From Supplier</option>
                            </select>
                        </div>

                        {sourceType === 'SUPPLIER' && (
                            <div className="space-y-1">
                                <label className="text-sm font-medium text-text-secondary">Supplier</label>
                                <select
                                    {...register('supplierId', { required: 'Supplier is required' })}
                                    className="w-full h-11 px-3 rounded-lg bg-surface border-border text-text-primary focus:outline-none focus:border-blue-500"
                                >
                                    <option value="">Select Supplier</option>
                                    {suppliers.map(sup => (
                                        <option key={sup._id} value={sup._id}>{sup.firstName} {sup.lastName}</option>
                                    ))}
                                </select>
                                {errors.supplierId && <span className="text-red-400 text-xs">{errors.supplierId.message}</span>}
                            </div>
                        )}
                    </div>

                    {/* Cost & Quantity */}
                    <div className="space-y-4">
                        <h3 className="text-lg font-semibold text-text-primary border-b border-border pb-2">Stock & Cost</h3>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1">
                                <label className="text-sm font-medium text-text-secondary">Initial Quantity</label>
                                <Input
                                    type="number"
                                    {...register('initialQuantity', { required: 'Quantity is required', min: 1, valueAsNumber: true })}
                                    className="w-full bg-surface border-border"
                                />
                                {errors.initialQuantity && <span className="text-red-500 text-xs">{errors.initialQuantity.message}</span>}
                            </div>
                            <div className="space-y-1">
                                <label className="text-sm font-medium text-text-secondary">Cost Per Unit</label>
                                <Input
                                    type="number"
                                    step="0.01"
                                    {...register('costPerUnit', { required: 'Cost is required', min: 0, valueAsNumber: true })}
                                    className="w-full bg-surface border-border"
                                />
                                {errors.costPerUnit && <span className="text-red-400 text-xs">{errors.costPerUnit.message}</span>}
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1">
                                <label className="text-sm font-medium text-text-secondary">Manufacturing Date</label>
                                <Input
                                    type="date"
                                    {...register('manufacturingDate')}
                                    className="w-full bg-surface border-border"
                                />
                            </div>
                            <div className="space-y-1">
                                <label className="text-sm font-medium text-text-secondary">Expiry Date</label>
                                <Input
                                    type="date"
                                    {...register('expiryDate')}
                                    className="w-full bg-surface border-border"
                                />
                            </div>
                        </div>

                        <div className="space-y-1">
                            <label className="text-sm font-medium text-text-secondary">QC Status</label>
                            <select
                                {...register('qualityCheckStatus')}
                                className="w-full h-11 px-3 rounded-lg bg-surface border-border text-text-primary focus:outline-none focus:border-blue-500"
                            >
                                <option value="PENDING">Pending</option>
                                <option value="PASSED">Passed</option>
                                <option value="FAILED">Failed</option>
                            </select>
                        </div>

                        <div className="space-y-1">
                            <label className="text-sm font-medium text-text-secondary">Notes (Optional)</label>
                            <Input
                                {...register('notes')}
                                placeholder="Additional details..."
                                className="w-full bg-surface border-border"
                            />
                        </div>
                    </div>
                </div>

                <div className="flex justify-end pt-4 border-t border-border">
                    <Button type="submit" disabled={loading} className="flex items-center gap-2">
                        <Save size={18} />
                        {loading ? 'Saving...' : 'Save Lot'}
                    </Button>
                </div>
            </form>
        </div>
    );
};

export default LotForm;
