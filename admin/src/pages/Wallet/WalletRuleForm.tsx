import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
    ChevronLeft,
    Save,
    Info,
    Zap,
    Calendar,
    Shield
} from 'lucide-react';
import { walletService } from '../../services/wallet.service';
import { toast } from 'react-hot-toast';
import Button from '../../components/common/Button';
import CustomInput from '../../components/common/Input';

const WalletRuleForm = () => {
    const navigate = useNavigate();
    const { id } = useParams();
    const isEdit = Boolean(id);
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);

    const [formData, setFormData] = useState({
        name: '',
        description: '',
        ruleType: 'ORDER_CASHBACK',
        valueType: 'PERCENTAGE',
        value: 0,
        minOrderAmount: 0,
        maxCashbackAmount: 0,
        expiryDays: 365,
        priority: 0,
        status: 'ACTIVE',
        startDate: '',
        endDate: ''
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target as any;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'number' ? Number(value) : value
        }));
    };

    useEffect(() => {
        if (isEdit && id) {
            const fetchRule = async () => {
                try {
                    setLoading(true);
                    const response = await walletService.getRuleById(id);
                    const rule = response?.data || response;
                    if (rule) {
                        setFormData({
                            ...rule,
                            startDate: rule.startDate ? rule.startDate.split('T')[0] : '',
                            endDate: rule.endDate ? rule.endDate.split('T')[0] : ''
                        });
                    }
                } catch (error) {
                    toast.error('Failed to fetch rule details');
                    navigate('/wallet/rules');
                } finally {
                    setLoading(false);
                }
            };
            fetchRule();
        }
    }, [id, isEdit]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.name) {
            toast.error('Name is required');
            return;
        }

        try {
            setSaving(true);
            const payload = {
                ...formData,
                startDate: formData.startDate || null,
                endDate: formData.endDate || null
            };

            if (isEdit && id) {
                await walletService.updateRule(id, payload);
                toast.success('Wallet rule updated successfully');
            } else {
                await walletService.createRule(payload);
                toast.success('Wallet rule created successfully');
            }
            navigate('/wallet/rules');
        } catch (error: any) {
            console.error('Error saving wallet rule:', error);
            toast.error(error.response?.data?.message || 'Failed to save rule');
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <div className="p-8 text-center text-gray-400 font-bold uppercase tracking-widest text-sm">Loading Policy Details...</div>;

    return (
        <div className="p-8 max-w-4xl mx-auto space-y-8">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => navigate('/wallet/rules')}
                        className="p-3 bg-white border border-gray-100 rounded-2xl text-gray-400 hover:text-gray-900 hover:border-gray-200 transition-all shadow-sm"
                    >
                        <ChevronLeft size={20} />
                    </button>
                    <div>
                        <h1 className="text-3xl font-black text-gray-900 uppercase tracking-tighter">
                            {isEdit ? 'Edit Rule' : 'New Rule'}
                        </h1>
                        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-1">
                            Configure earning policies for user wallets
                        </p>
                    </div>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-8">
                <div className="bg-white rounded-[2.5rem] border border-gray-100 p-8 shadow-xl shadow-gray-200/50 space-y-10">

                    {/* Basic Section */}
                    <div className="space-y-6">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-primary/10 text-primary rounded-xl flex items-center justify-center">
                                <Info size={20} />
                            </div>
                            <h2 className="text-sm font-black text-gray-900 uppercase tracking-widest">Basic Information</h2>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <CustomInput
                                label="Rule Name"
                                name="name"
                                placeholder="e.g. Welcome Bonus"
                                value={formData.name}
                                onChange={handleChange}
                            />

                            <div className="flex flex-col gap-1 w-full">
                                <label className="text-sm font-semibold text-primary/80">Rule Type</label>
                                <select
                                    name="ruleType"
                                    value={formData.ruleType}
                                    onChange={handleChange}
                                    className="w-full border border-primary/20 bg-primary/5 rounded-lg py-3 px-4 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all text-sm font-medium"
                                >
                                    <option value="ORDER_CASHBACK">Order Cashback</option>
                                    <option value="SIGNUP_BONUS">Signup Bonus</option>
                                    <option value="REFERRAL_BONUS">Referral Bonus</option>
                                    <option value="APP_SHARE_BONUS">App Share Bonus</option>
                                    <option value="CUSTOM">Custom</option>
                                </select>
                            </div>
                        </div>

                        <CustomInput
                            label="Description"
                            name="description"
                            placeholder="Describe what this rule does..."
                            value={formData.description}
                            onChange={handleChange}
                        />
                    </div>

                    <div className="h-px bg-gray-50" />

                    {/* Logic Section */}
                    <div className="space-y-6">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-amber-50 text-amber-600 rounded-xl flex items-center justify-center">
                                <Zap size={20} />
                            </div>
                            <h2 className="text-sm font-black text-gray-900 uppercase tracking-widest">Reward Logic</h2>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="flex flex-col gap-1 w-full">
                                <label className="text-sm font-semibold text-primary/80">Value Type</label>
                                <select
                                    name="valueType"
                                    value={formData.valueType}
                                    onChange={handleChange}
                                    className="w-full border border-primary/20 bg-primary/5 rounded-lg py-3 px-4 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all text-sm font-medium"
                                >
                                    <option value="PERCENTAGE">Percentage (%)</option>
                                    <option value="FLAT_AMOUNT">Flat Amount (₹)</option>
                                </select>
                            </div>

                            <CustomInput
                                label="Reward Value"
                                name="value"
                                type="number"
                                placeholder="0"
                                value={formData.value}
                                onChange={handleChange}
                                icon={<span className="text-xs font-black">{formData.valueType === 'PERCENTAGE' ? '%' : '₹'}</span>}
                            />

                            <CustomInput
                                label="Min Order Amount"
                                name="minOrderAmount"
                                type="number"
                                value={formData.minOrderAmount}
                                onChange={handleChange}
                                icon={<span className="text-xs font-black">₹</span>}
                            />

                            <CustomInput
                                label="Max Cashback"
                                name="maxCashbackAmount"
                                type="number"
                                value={formData.maxCashbackAmount}
                                onChange={handleChange}
                                disabled={formData.valueType === 'FLAT_AMOUNT'}
                                icon={<span className="text-xs font-black">₹</span>}
                            />

                            <CustomInput
                                label="Expiry (Days)"
                                name="expiryDays"
                                type="number"
                                value={formData.expiryDays}
                                onChange={handleChange}
                            />

                            <CustomInput
                                label="Priority"
                                name="priority"
                                type="number"
                                value={formData.priority}
                                onChange={handleChange}
                            />
                        </div>
                    </div>

                    <div className="h-px bg-gray-50" />

                    {/* Validity Section */}
                    <div className="space-y-6">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-green-50 text-green-600 rounded-xl flex items-center justify-center">
                                <Calendar size={20} />
                            </div>
                            <h2 className="text-sm font-black text-gray-900 uppercase tracking-widest">Validity & Status</h2>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <CustomInput
                                label="Start Date"
                                name="startDate"
                                type="date"
                                value={formData.startDate}
                                onChange={handleChange}
                            />
                            <CustomInput
                                label="End Date"
                                name="endDate"
                                type="date"
                                value={formData.endDate}
                                onChange={handleChange}
                            />

                            <div className="md:col-span-2 flex items-center justify-between p-4 bg-gray-50 rounded-2xl border border-gray-100">
                                <div className="flex items-center gap-3">
                                    <div className={`p-2 rounded-lg transition-colors ${formData.status === 'ACTIVE' ? 'bg-green-100 text-green-600' : 'bg-gray-200 text-gray-400'}`}>
                                        <Shield size={18} />
                                    </div>
                                    <div>
                                        <p className="text-xs font-black text-gray-900 uppercase tracking-widest leading-none">Status</p>
                                        <p className="text-[10px] text-gray-400 font-bold uppercase mt-1">Toggle rule availability</p>
                                    </div>
                                </div>
                                <label className="relative inline-flex items-center cursor-pointer">
                                    <input
                                        type="checkbox"
                                        className="sr-only peer"
                                        checked={formData.status === 'ACTIVE'}
                                        onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.checked ? 'ACTIVE' : 'INACTIVE' }))}
                                    />
                                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                                </label>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="flex justify-end gap-3">
                    <Button
                        type="button"
                        variant="ghost"
                        onClick={() => navigate('/wallet/rules')}
                        className="px-8 h-12 rounded-xl text-gray-400 font-black uppercase tracking-widest text-xs"
                    >
                        Discard
                    </Button>
                    <Button
                        type="submit"
                        isLoading={saving}
                        className="px-10 h-12 rounded-xl bg-gray-900 hover:bg-black text-white font-black uppercase tracking-widest text-xs shadow-xl shadow-gray-200"
                    >
                        <Save size={16} className="mr-2" />
                        {isEdit ? 'Update Policy' : 'Publish Policy'}
                    </Button>
                </div>
            </form>
        </div>
    );
};

export default WalletRuleForm;
