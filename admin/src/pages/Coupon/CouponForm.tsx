import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
    ArrowLeft,
    Save,
    Ticket,
    Info,
    Calendar,
    Percent,
    Infinity as InfinityIcon,
    ShieldCheck
} from 'lucide-react';
import { couponService } from '../../services/couponService';
import { COUPON_TYPE, COUPON_STATUS } from '../../types/coupon.types';
import type { Coupon } from '../../types/coupon.types';
import toast from 'react-hot-toast';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';

const CouponForm: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const isEdit = !!id;

    const [loading, setLoading] = useState(false);
    const [fetching, setFetching] = useState(isEdit);
    const [formData, setFormData] = useState<Partial<Coupon>>({
        code: '',
        description: '',
        type: COUPON_TYPE.PERCENTAGE,
        value: 0,
        minOrderAmount: 0,
        maxDiscountAmount: undefined,
        startDate: new Date().toISOString().split('T')[0],
        endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        usageLimit: undefined,
        status: COUPON_STATUS.ACTIVE,
    });

    useEffect(() => {
        if (isEdit) {
            const fetchCoupon = async () => {
                try {
                    const data = await couponService.getById(id);
                    if (data) {
                        setFormData({
                            ...data,
                            startDate: new Date(data.startDate).toISOString().split('T')[0],
                            endDate: new Date(data.endDate).toISOString().split('T')[0],
                        });
                    }
                } catch (error) {
                    console.error('Error fetching coupon:', error);
                    toast.error('Failed to fetch coupon details');
                    navigate('/coupons');
                } finally {
                    setFetching(false);
                }
            };
            fetchCoupon();
        }
    }, [id, isEdit, navigate]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            setLoading(true);
            if (isEdit && id) {
                await couponService.update(id, formData);
                toast.success('Coupon updated successfully');
            } else {
                await couponService.create(formData);
                toast.success('Coupon created successfully');
            }
            navigate('/coupons');
        } catch (error: any) {
            console.error('Error saving coupon:', error);
            toast.error(error.message || 'Failed to save coupon');
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'number' ? parseFloat(value) : value
        }));
    };

    if (fetching) {
        return (
            <div className="p-6 flex flex-col items-center justify-center min-h-[400px] text-gray-500 italic">
                <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin mb-4" />
                Retrieving coupon intelligence...
            </div>
        );
    }

    return (
        <div className="p-6 max-w-5xl mx-auto space-y-8">
            {/* Header with Back Button */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-[2rem] border border-primary/5 shadow-sm">
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => navigate('/coupons')}
                        className="p-3 text-gray-400 hover:text-primary hover:bg-primary/5 rounded-2xl transition-all border border-transparent hover:border-primary/10"
                    >
                        <ArrowLeft size={24} />
                    </button>
                    <div>
                        <h1 className="text-3xl font-black text-primary tracking-tight uppercase font-mono">{isEdit ? 'Edit Coupon' : 'New Strategic Offer'}</h1>
                        <p className="text-sm text-gray-500 font-medium">Define logic for discount codes and promotions</p>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <Button
                        variant="ghost"
                        onClick={() => navigate('/coupons')}
                        className="rounded-2xl h-14 px-6 font-black uppercase text-[10px] tracking-widest"
                    >
                        Cancel
                    </Button>
                    <Button
                        onClick={handleSubmit}
                        disabled={loading}
                        className="rounded-2xl shadow-xl shadow-primary/20 h-14 px-8"
                    >
                        <Save size={20} className="mr-2" />
                        <span>{loading ? 'Processing...' : 'Execute / Save'}</span>
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Side: Form Details */}
                <div className="lg:col-span-2 space-y-8">
                    {/* Basic Configuration */}
                    <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-xl shadow-gray-200/50 space-y-6">
                        <div className="flex items-center gap-3 pb-4 border-b border-gray-50">
                            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                                <Ticket size={20} />
                            </div>
                            <h2 className="text-lg font-black text-gray-900 uppercase tracking-tight">Identity & Status</h2>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="space-y-3">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">Coupon Code *</label>
                                <Input
                                    name="code"
                                    value={formData.code}
                                    onChange={handleInputChange}
                                    placeholder="e.g. MEGA50"
                                    required
                                    className="uppercase font-black text-lg tracking-widest h-14 bg-gray-50/50 border-2"
                                    disabled={isEdit}
                                />
                                <p className="text-[9px] text-gray-400 px-1 font-bold italic">Unique identifier for the discount engine.</p>
                            </div>
                            <div className="space-y-3">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">Initial Status</label>
                                <select
                                    name="status"
                                    value={formData.status}
                                    onChange={handleInputChange}
                                    className="w-full bg-gray-50/50 border-2 border-gray-100 rounded-2xl h-14 px-4 text-sm font-black uppercase tracking-widest focus:outline-none focus:border-primary/20 transition-all cursor-pointer"
                                >
                                    {Object.values(COUPON_STATUS).map(s => (
                                        <option key={s} value={s}>{s}</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <div className="space-y-3">
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">Promotion Description</label>
                            <textarea
                                name="description"
                                value={formData.description}
                                onChange={handleInputChange}
                                rows={4}
                                placeholder="Describe the terms of this promotion..."
                                className="w-full bg-gray-50/50 border-2 border-gray-100 rounded-[2rem] p-5 text-sm font-medium focus:outline-none focus:border-primary/20 transition-all resize-none"
                            />
                        </div>
                    </div>

                    {/* Discount Configuration */}
                    <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-xl shadow-gray-200/50 space-y-6">
                        <div className="flex items-center gap-3 pb-4 border-b border-gray-50">
                            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                                <Percent size={20} />
                            </div>
                            <h2 className="text-lg font-black text-gray-900 uppercase tracking-tight">Discount Logic</h2>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="space-y-3">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">Calculation Type</label>
                                <select
                                    name="type"
                                    value={formData.type}
                                    onChange={handleInputChange}
                                    className="w-full bg-gray-50/50 border-2 border-gray-100 rounded-2xl h-14 px-4 text-sm font-black uppercase tracking-widest focus:outline-none focus:border-primary/20 transition-all cursor-pointer"
                                >
                                    <option value={COUPON_TYPE.PERCENTAGE}>Percentage (%)</option>
                                    <option value={COUPON_TYPE.FLAT}>Flat Amount (₹)</option>
                                </select>
                            </div>
                            <div className="space-y-3">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">Reward Value *</label>
                                <Input
                                    type="number"
                                    name="value"
                                    value={formData.value}
                                    onChange={handleInputChange}
                                    placeholder={formData.type === COUPON_TYPE.PERCENTAGE ? "10" : "500"}
                                    required
                                    min={0}
                                    max={formData.type === COUPON_TYPE.PERCENTAGE ? 100 : undefined}
                                    className="h-14 bg-gray-50/50 border-2 font-black text-lg"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="space-y-3">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">Threshold (Min. Order ₹)</label>
                                <Input
                                    type="number"
                                    name="minOrderAmount"
                                    value={formData.minOrderAmount || 0}
                                    onChange={handleInputChange}
                                    placeholder="0"
                                    min={0}
                                    className="h-14 bg-gray-50/50 border-2 font-bold"
                                />
                            </div>
                            {formData.type === COUPON_TYPE.PERCENTAGE && (
                                <div className="space-y-3">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">Cap (Max Discount ₹)</label>
                                    <Input
                                        type="number"
                                        name="maxDiscountAmount"
                                        value={formData.maxDiscountAmount || ''}
                                        onChange={handleInputChange}
                                        placeholder="No limit"
                                        min={0}
                                        className="h-14 bg-gray-50/50 border-2 font-bold"
                                    />
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Right Side: Limits & Expiry */}
                <div className="space-y-8">
                    <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-xl shadow-gray-200/50 space-y-6">
                        <div className="flex items-center gap-3 pb-4 border-b border-gray-50">
                            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                                <Calendar size={20} />
                            </div>
                            <h2 className="text-lg font-black text-gray-900 uppercase tracking-tight">Timeline</h2>
                        </div>

                        <div className="space-y-6">
                            <div className="space-y-3">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">Start Enforcement</label>
                                <Input
                                    type="date"
                                    name="startDate"
                                    value={formData.startDate}
                                    onChange={handleInputChange}
                                    required
                                    className="h-14 bg-gray-50/50 border-2"
                                />
                            </div>
                            <div className="space-y-3">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">End Enforcement</label>
                                <Input
                                    type="date"
                                    name="endDate"
                                    value={formData.endDate}
                                    onChange={handleInputChange}
                                    required
                                    className="h-14 bg-gray-50/50 border-2"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-xl shadow-gray-200/50 space-y-6">
                        <div className="flex items-center gap-3 pb-4 border-b border-gray-50">
                            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                                <InfinityIcon size={20} />
                            </div>
                            <h2 className="text-lg font-black text-gray-900 uppercase tracking-tight">Constraints</h2>
                        </div>

                        <div className="space-y-3">
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">Global Usage Cap</label>
                            <Input
                                type="number"
                                name="usageLimit"
                                value={formData.usageLimit || ''}
                                onChange={handleInputChange}
                                placeholder="∞ Unlimited"
                                min={1}
                                className="h-14 bg-gray-50/50 border-2 font-black text-lg"
                            />
                            <p className="text-[9px] text-gray-400 px-1 font-bold italic leading-relaxed">
                                Defines the total pool of successful redemptions allowed across all users.
                            </p>
                        </div>
                    </div>

                    {/* Security Tip */}
                    <div className="bg-primary/5 p-6 rounded-[2rem] border border-primary/10 flex gap-4">
                        <ShieldCheck size={24} className="text-primary shrink-0" />
                        <div className="space-y-1">
                            <p className="text-[10px] font-black text-primary uppercase tracking-widest">Security Alert</p>
                            <p className="text-[10px] font-medium text-gray-600 leading-relaxed">
                                Once a coupon is created, its code cannot be modified. If you need a new code, please create a fresh strategic offer.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CouponForm;
