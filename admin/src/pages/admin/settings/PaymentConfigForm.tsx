import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router';
import { useForm } from 'react-hook-form';
import { paymentConfigService, type CreatePaymentConfigData } from '../../../api/services/paymentConfig.service';
import { categoryService } from '../../../api/services/category.service';
import { Button, Input } from '../../../components/common';
import { ArrowLeft, Save } from 'lucide-react';
import { toast } from 'react-hot-toast';

const PaymentConfigForm = () => {
    const navigate = useNavigate();
    const { entityType, entityId } = useParams<{ entityType: string, entityId: string }>();
    const [loading, setLoading] = useState(false);
    const [entityName, setEntityName] = useState('');

    const { register, handleSubmit, reset, watch } = useForm<CreatePaymentConfigData>({
        defaultValues: {
            entityType: (entityType?.toUpperCase() as any) || 'CATEGORY',
            entityId: entityId || '',
            codEnabled: true,
            prepaidEnabled: true,
            minOrderValue: 0
        }
    });

    const codEnabled = watch('codEnabled');

    useEffect(() => {
        const fetchData = async () => {
            if (!entityId || !entityType) return;

            try {
                // Fetch Entity Name (Category)
                if (entityType === 'category') {
                    const catRes = await categoryService.getById(entityId);
                    setEntityName(catRes.data?.name || 'Category');
                }

                // Fetch Existing Config
                // Note: The service expects 'CATEGORY' or 'PRODUCT' uppercase
                const typeUpper = entityType.toUpperCase();
                const res = await paymentConfigService.getConfig(typeUpper, entityId);

                if (res.data) {
                    reset(res.data);
                }
            } catch (error) {
                console.error('No existing config or failed fetch', error);
                // Not necessarily an error if no config exists yet, just use defaults
            }
        };
        fetchData();
    }, [entityId, entityType, reset]);

    const onSubmit = async (data: CreatePaymentConfigData) => {
        setLoading(true);
        try {
            await paymentConfigService.setConfig({
                ...data,
                entityType: (entityType?.toUpperCase() as any) || 'CATEGORY',
                entityId: entityId!
            });
            toast.success('Payment configuration saved successfully');
            navigate('/settings/payment-config');
        } catch (error) {
            console.error(error);
            toast.error('Failed to save configuration');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="p-6 space-y-6">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Button variant="secondary" onClick={() => navigate('/settings/payment-config')} className="!p-2">
                        <ArrowLeft size={20} />
                    </Button>
                    <div>
                        <h1 className="text-2xl font-bold text-white">Configure Payment</h1>
                        <p className="text-zinc-400 text-sm">For {entityName ? entityName : 'Entity'}</p>
                    </div>
                </div>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="bg-zinc-900 rounded-xl p-6 border border-zinc-800 space-y-6 max-w-2xl">

                <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-white border-b border-zinc-800 pb-2">Payment Methods</h3>

                    <div className="flex items-center justify-between bg-zinc-800 p-4 rounded-lg">
                        <div>
                            <p className="text-white font-medium">Prepaid Payment</p>
                            <p className="text-zinc-400 text-xs">Allow credit cards, UPI, net banking</p>
                        </div>
                        <input
                            type="checkbox"
                            {...register('prepaidEnabled')}
                            className="w-5 h-5 rounded border-zinc-600 bg-zinc-700 text-blue-500 focus:ring-blue-500"
                        />
                    </div>

                    <div className="bg-zinc-800 p-4 rounded-lg space-y-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-white font-medium">Cash on Delivery (COD)</p>
                                <p className="text-zinc-400 text-xs">Allow payment upon delivery</p>
                            </div>
                            <input
                                type="checkbox"
                                {...register('codEnabled')}
                                className="w-5 h-5 rounded border-zinc-600 bg-zinc-700 text-blue-500 focus:ring-blue-500"
                            />
                        </div>

                        {codEnabled && (
                            <div className="pt-4 border-t border-zinc-700 grid grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <label className="text-xs text-zinc-400">Min Order Value for COD</label>
                                    <Input
                                        type="number"
                                        {...register('minOrderValue')}
                                        className="h-9 bg-zinc-900 border-zinc-700 text-sm"
                                        placeholder="0"
                                    />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-xs text-zinc-400">Max COD Amount</label>
                                    <Input
                                        type="number"
                                        {...register('maxCodAmount')}
                                        className="h-9 bg-zinc-900 border-zinc-700 text-sm"
                                        placeholder="No limit"
                                    />
                                </div>
                                <div className="col-span-2 space-y-2">
                                    <div className="flex items-center gap-4">
                                        <label className="text-xs text-zinc-400">COD Charges Type</label>
                                        <div className="flex items-center gap-2">
                                            <input type="radio" value="FIXED" {...register('codCharges.type')} /> <span className="text-xs text-white">Fixed Amount</span>
                                            <input type="radio" value="PERCENTAGE" {...register('codCharges.type')} /> <span className="text-xs text-white">Percentage</span>
                                        </div>
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-xs text-zinc-400">Charge Value</label>
                                        <Input
                                            type="number"
                                            {...register('codCharges.value')}
                                            className="h-9 bg-zinc-900 border-zinc-700 text-sm"
                                            placeholder="0"
                                        />
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                <div className="flex justify-end pt-4 border-t border-zinc-800">
                    <Button type="submit" disabled={loading} className="flex items-center gap-2">
                        <Save size={18} />
                        {loading ? 'Saving...' : 'Save Configuration'}
                    </Button>
                </div>
            </form>
        </div>
    );
};

export default PaymentConfigForm;
