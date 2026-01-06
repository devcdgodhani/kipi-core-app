import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import warehouseService from '../../services/warehouseService';
import {
    ChevronLeft,
    Save,
    MapPin,
    Contact,
    Building2,
    ShieldCheck
} from 'lucide-react';
import CustomInput from '../../components/common/Input';
import CustomButton from '../../components/common/Button';

export const WarehouseForm: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const isEdit = Boolean(id && id !== 'new');

    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [formData, setFormData] = useState({
        name: '',
        code: '',
        address: {
            street: '',
            city: '',
            state: '',
            country: 'India',
            pincode: '',
            landmark: ''
        },
        contactPerson: '',
        mobile: '',
        email: '',
        isActive: true,
        isPrimary: false
    });

    useEffect(() => {
        if (isEdit && id) {
            setLoading(true);
            warehouseService.getOne(id)
                .then(res => {
                    if (res.data) setFormData(res.data as any);
                })
                .catch(err => {
                    console.error(err);
                    setError('Failed to fetch warehouse details');
                })
                .finally(() => setLoading(false));
        }
    }, [id, isEdit]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        setError(null);
        try {
            if (isEdit && id) {
                await warehouseService.update(id, formData);
            } else {
                await warehouseService.create(formData);
            }
            navigate('/warehouses');
        } catch (err: any) {
            console.error('Failed to save warehouse', err);
            setError(err.response?.data?.message || 'Failed to save configuration');
        } finally {
            setSaving(false);
        }
    };

    const handleToggle = (name: string) => {
        setFormData(prev => ({ ...prev, [name]: !(prev as any)[name] }));
    };

    if (loading) return <div className="p-10 text-center font-black text-primary animate-pulse">INITIATING NODE RECOVERY...</div>;

    return (
        <div className="p-6 space-y-6">
            {/* Premium Header */}
            <div className="flex items-center gap-4 bg-white p-6 rounded-[2rem] border border-primary/5 shadow-sm">
                <button
                    onClick={() => navigate('/warehouses')}
                    className="p-3 bg-gray-50 rounded-2xl hover:bg-gray-100 transition-colors"
                >
                    <ChevronLeft size={24} className="text-gray-700" />
                </button>
                <div>
                    <h1 className="text-3xl font-black text-primary tracking-tight uppercase font-mono">
                        {isEdit ? 'Configure Node' : 'Initialize Node'}
                    </h1>
                    <p className="text-sm text-gray-500 font-medium">
                        {isEdit ? 'Modify logistics hub parameters' : 'Onboard a new fulfillment sector'}
                    </p>
                </div>
            </div>

            <div className="max-w-4xl mx-auto">
                <form onSubmit={handleSubmit} className="space-y-6">
                    {error && (
                        <div className="p-4 text-sm text-rose-600 bg-rose-50 border border-rose-100 rounded-2xl text-center font-bold uppercase tracking-wider">
                            {error}
                        </div>
                    )}

                    {/* General Section */}
                    <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-xl shadow-gray-200/50 space-y-6">
                        <div className="flex items-center gap-3 border-b border-gray-50 pb-4 mb-2">
                            <Building2 size={20} className="text-primary" />
                            <h2 className="text-[10px] font-black text-primary/40 uppercase tracking-[0.3em]">Core Identity</h2>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <CustomInput
                                label="Warehouse Name"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                placeholder="e.g. ALPHA-CENTAURI HUB"
                                required
                            />
                            <CustomInput
                                label="Warehouse Code"
                                value={formData.code}
                                onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                                placeholder="WH-XYZ-01"
                                required
                                className="font-mono uppercase"
                            />
                        </div>
                    </div>

                    {/* Address Section */}
                    <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-xl shadow-gray-200/50 space-y-6">
                        <div className="flex items-center gap-3 border-b border-gray-50 pb-4 mb-2">
                            <MapPin size={20} className="text-primary" />
                            <h2 className="text-[10px] font-black text-primary/40 uppercase tracking-[0.3em]">Geospatial Data</h2>
                        </div>

                        <div className="space-y-6">
                            <CustomInput
                                label="Street Address"
                                value={formData.address.street}
                                onChange={(e) => setFormData({ ...formData, address: { ...formData.address, street: e.target.value } })}
                                placeholder="Sector / Building / Floor"
                                required
                            />

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <CustomInput
                                    label="City"
                                    value={formData.address.city}
                                    onChange={(e) => setFormData({ ...formData, address: { ...formData.address, city: e.target.value } })}
                                    required
                                />
                                <CustomInput
                                    label="State"
                                    value={formData.address.state}
                                    onChange={(e) => setFormData({ ...formData, address: { ...formData.address, state: e.target.value } })}
                                    required
                                />
                                <CustomInput
                                    label="Pincode"
                                    value={formData.address.pincode}
                                    onChange={(e) => setFormData({ ...formData, address: { ...formData.address, pincode: e.target.value } })}
                                    maxLength={6}
                                    required
                                />
                                <CustomInput
                                    label="Country"
                                    value={formData.address.country}
                                    disabled
                                    required
                                />
                            </div>
                        </div>
                    </div>

                    {/* Contact Section */}
                    <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-xl shadow-gray-200/50 space-y-6">
                        <div className="flex items-center gap-3 border-b border-gray-50 pb-4 mb-2">
                            <Contact size={20} className="text-primary" />
                            <h2 className="text-[10px] font-black text-primary/40 uppercase tracking-[0.3em]">Communication Protocol</h2>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <CustomInput
                                label="Personnel Name"
                                value={formData.contactPerson}
                                onChange={(e) => setFormData({ ...formData, contactPerson: e.target.value })}
                                required
                            />
                            <CustomInput
                                label="Mobile (Uplink)"
                                value={formData.mobile}
                                onChange={(e) => setFormData({ ...formData, mobile: e.target.value })}
                                required
                            />
                            <CustomInput
                                label="Email (Data)"
                                type="email"
                                value={formData.email}
                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                required
                            />
                        </div>
                    </div>

                    {/* Configuration Section */}
                    <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-xl shadow-gray-200/50 space-y-6">
                        <div className="flex items-center gap-3 border-b border-gray-50 pb-4 mb-2">
                            <ShieldCheck size={20} className="text-primary" />
                            <h2 className="text-[10px] font-black text-primary/40 uppercase tracking-[0.3em]">Logic Gates</h2>
                        </div>

                        <div className="flex flex-wrap gap-12 px-2">
                            <div className="flex items-center justify-between gap-6">
                                <span className="text-sm font-bold text-gray-700">Operational Status</span>
                                <button
                                    type="button"
                                    onClick={() => handleToggle('isActive')}
                                    className={`w-12 h-6 rounded-full relative transition-all duration-300 ${formData.isActive ? 'bg-green-500 shadow-lg shadow-green-100' : 'bg-gray-300'}`}
                                >
                                    <div className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow-sm transition-all duration-300 ${formData.isActive ? 'right-1' : 'left-1'}`} />
                                </button>
                            </div>

                            <div className="flex items-center justify-between gap-6">
                                <span className="text-sm font-bold text-gray-700">Set as Primary Node</span>
                                <button
                                    type="button"
                                    onClick={() => handleToggle('isPrimary')}
                                    className={`w-12 h-6 rounded-full relative transition-all duration-300 ${formData.isPrimary ? 'bg-primary shadow-lg shadow-primary/20' : 'bg-gray-300'}`}
                                >
                                    <div className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow-sm transition-all duration-300 ${formData.isPrimary ? 'right-1' : 'left-1'}`} />
                                </button>
                            </div>
                        </div>
                    </div>

                    <div className="flex gap-4 pt-6">
                        <button
                            type="button"
                            onClick={() => navigate('/warehouses')}
                            className="flex-1 py-4 text-gray-500 font-black uppercase text-[10px] tracking-widest hover:bg-gray-50 rounded-2xl transition-all"
                        >
                            Abort Configuration
                        </button>
                        <CustomButton
                            type="submit"
                            disabled={saving}
                            className="flex-1 rounded-2xl h-16 shadow-xl shadow-primary/20"
                        >
                            <Save size={20} className="mr-2" />
                            {saving ? 'UPDATING SYSTEMS...' : 'SAVE CORE CONFIG'}
                        </CustomButton>
                    </div>
                </form>
            </div>
        </div>
    );
};
