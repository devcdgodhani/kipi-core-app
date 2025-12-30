import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router';
import { useForm } from 'react-hook-form';
import { couponService, type CreateCouponData } from '../../../api/services/coupon.service';
import { Button, Input } from '../../../components/common';
import { ArrowLeft, Save } from 'lucide-react';
import { toast } from 'react-hot-toast';

const CouponForm = () => {
    const navigate = useNavigate();
    const { id } = useParams();
    const isEdit = !!id;
    const [loading, setLoading] = useState(false);

    const { register, handleSubmit, reset, watch, formState: { errors } } = useForm<CreateCouponData>({
        defaultValues: {
            isActive: true,
            discountType: 'PERCENTAGE',
            applicability: 'ALL',
            canStackWithOthers: false,
            autoApply: false,
            priority: 0
        }
    });

    const discountType = watch('discountType');
    // const applicability = watch('applicability'); // Can be used for conditional rendering

    useEffect(() => {
        if (isEdit && id) {
            const fetchCoupon = async () => {
                try {
                    const res = await couponService.getById(id);
                    // Date formatting
                    const data = {
                        ...res,
                        startDate: res.startDate ? new Date(res.startDate).toISOString().split('T')[0] : '',
                        endDate: res.endDate ? new Date(res.endDate).toISOString().split('T')[0] : ''
                    };
                    reset(data);
                } catch (error) {
                    toast.error('Failed to fetch coupon details');
                    navigate('/offers/coupons');
                }
            };
            fetchCoupon();
        }
    }, [id, isEdit, reset, navigate]);

    const onSubmit = async (data: CreateCouponData) => {
        setLoading(true);
        try {
            if (isEdit && id) {
                await couponService.update(id, data);
                toast.success('Coupon updated successfully');
            } else {
                await couponService.create(data);
                toast.success('Coupon created successfully');
            }
            navigate('/offers/coupons');
        } catch (error) {
            console.error(error);
            toast.error(isEdit ? 'Failed to update coupon' : 'Failed to create coupon');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="p-6 space-y-6">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Button variant="secondary" onClick={() => navigate('/offers/coupons')} className="!p-2">
                        <ArrowLeft size={20} />
                    </Button>
                    <div>
                        <h1 className="text-2xl font-bold text-text-primary">{isEdit ? 'Edit Coupon' : 'Create New Coupon'}</h1>
                        <p className="text-text-secondary text-sm">Define discount rules and validity.</p>
                    </div>
                </div>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="bg-surface rounded-xl p-6 border border-border space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Left Column: Basic Info & Rules */}
                    <div className="space-y-6">
                        <div className="space-y-4">
                            <h3 className="text-lg font-semibold text-text-primary border-b border-border pb-2">General Information</h3>

                            <div className="space-y-1">
                                <label className="text-sm font-medium text-text-secondary">Coupon Code</label>
                                <Input
                                    {...register('code', { required: 'Code is required', pattern: { value: /^[A-Z0-9_-]+$/, message: 'Uppercase alphanumeric only' } })}
                                    placeholder="e.g. WELCOME10"
                                    className="w-full bg-surface border-border font-mono"
                                />
                                {errors.code && <span className="text-red-500 text-xs">{errors.code.message}</span>}
                            </div>

                            <div className="space-y-1">
                                <label className="text-sm font-medium text-text-secondary">Description</label>
                                <Input
                                    {...register('description', { required: 'Description is required' })}
                                    placeholder="e.g. 10% off for new users"
                                    className="w-full bg-surface border-border"
                                />
                                {errors.description && <span className="text-red-500 text-xs">{errors.description.message}</span>}
                            </div>
                        </div>

                        <div className="space-y-4">
                            <h3 className="text-lg font-semibold text-text-primary border-b border-border pb-2">Discount Rules</h3>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <label className="text-sm font-medium text-text-secondary">Type</label>
                                    <select
                                        {...register('discountType')}
                                        className="w-full h-11 px-3 rounded-lg bg-surface border-border text-text-primary focus:outline-none focus:border-blue-500"
                                    >
                                        <option value="PERCENTAGE">Percentage (%)</option>
                                        <option value="FIXED_AMOUNT">Fixed Amount (₹)</option>
                                        <option value="BOGO">Buy One Get One</option>
                                        <option value="FREE_SHIPPING">Free Shipping</option>
                                    </select>
                                </div>
                                <div className="space-y-1">
                                    <label className="text-sm font-medium text-text-secondary">Value</label>
                                    <Input
                                        type="number"
                                        step="0.01"
                                        {...register('discountValue', { required: 'Value is required', min: 0 })}
                                        className="w-full bg-surface border-border"
                                    />
                                    {errors.discountValue && <span className="text-red-500 text-xs">{errors.discountValue.message}</span>}
                                </div>
                            </div>

                            {discountType === 'PERCENTAGE' && (
                                <div className="space-y-1">
                                    <label className="text-sm font-medium text-text-secondary">Max Discount Cap (Optional)</label>
                                    <Input
                                        type="number"
                                        {...register('maxDiscountCap')}
                                        placeholder="Max discount amount"
                                        className="w-full bg-surface border-border"
                                    />
                                </div>
                            )}

                            <div className="space-y-1">
                                <label className="text-sm font-medium text-text-secondary">Min Cart Value</label>
                                <Input
                                    type="number"
                                    {...register('minCartValue')}
                                    placeholder="0"
                                    className="w-full bg-surface border-border"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Right Column: Validity & Settings */}
                    <div className="space-y-6">
                        <div className="space-y-4">
                            <h3 className="text-lg font-semibold text-text-primary border-b border-border pb-2">Validity & Limits</h3>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <label className="text-sm font-medium text-text-secondary">Start Date</label>
                                    <Input type="date" {...register('startDate')} className="w-full bg-surface border-border" />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-sm font-medium text-text-secondary">End Date</label>
                                    <Input type="date" {...register('endDate')} className="w-full bg-surface border-border" />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <label className="text-sm font-medium text-text-secondary">Total Usage Limit</label>
                                    <Input type="number" {...register('totalUsageLimit')} placeholder="∞" className="w-full bg-surface border-border" />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-sm font-medium text-text-secondary">Per User Limit</label>
                                    <Input type="number" {...register('perUserUsageLimit')} placeholder="∞" className="w-full bg-surface border-border" />
                                </div>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <h3 className="text-lg font-semibold text-text-primary border-b border-border pb-2">Configuration</h3>

                            <div className="space-y-3">
                                <div className="flex items-center gap-2">
                                    <input type="checkbox" {...register('isActive')} className="w-4 h-4 rounded border-border bg-surface text-blue-500 focus:ring-blue-500" />
                                    <label className="text-sm text-text-secondary">Active</label>
                                </div>
                                <div className="flex items-center gap-2">
                                    <input type="checkbox" {...register('autoApply')} className="w-4 h-4 rounded border-border bg-surface text-blue-500 focus:ring-blue-500" />
                                    <label className="text-sm text-text-secondary">Auto Apply (if eligible)</label>
                                </div>
                                <div className="flex items-center gap-2">
                                    <input type="checkbox" {...register('canStackWithOthers')} className="w-4 h-4 rounded border-border bg-surface text-blue-500 focus:ring-blue-500" />
                                    <label className="text-sm text-text-secondary">Stackable with other coupons</label>
                                </div>
                            </div>

                            <div className="space-y-1">
                                <label className="text-sm font-medium text-text-secondary">Applicability Scope</label>
                                <select
                                    {...register('applicability')}
                                    className="w-full h-11 px-3 rounded-lg bg-surface border-border text-text-primary focus:outline-none focus:border-blue-500"
                                >
                                    <option value="ALL">All Orders (Global)</option>
                                    <option value="CATEGORY">Specific Categories</option>
                                    <option value="PRODUCT">Specific Products</option>
                                    <option value="USER_SEGMENT">Specific User Groups</option>
                                </select>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="flex justify-end pt-4 border-t border-border">
                    <Button type="submit" disabled={loading} className="flex items-center gap-2">
                        <Save size={18} />
                        {loading ? 'Saving...' : 'Save Coupon'}
                    </Button>
                </div>
            </form>
        </div>
    );
};

export default CouponForm;
