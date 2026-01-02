import React, { useState, useEffect } from 'react';
import { X, Loader2 } from 'lucide-react';
import type { Address, CreateAddressRequest } from '../../types/address.types';
import { useAddress } from '../../context/AddressContext';

interface AddressFormModalProps {
    isOpen: boolean;
    onClose: () => void;
    editAddress?: Address | null;
}

type FormData = Omit<CreateAddressRequest, 'userId'> & { status?: string };

const AddressFormModal: React.FC<AddressFormModalProps> = ({
    isOpen,
    onClose,
    editAddress
}) => {
    const { addAddress, updateAddress } = useAddress();
    const [loading, setLoading] = useState(false);

    // Simple form state handling instead of library if not installed, but let's assume we want to use form state manually for now to avoid dependency issues if react-hook-form isnt there.
    // Actually, standard is to use state for inputs.

    const [formData, setFormData] = useState<FormData>({
        name: '',
        mobile: '',
        street: '',
        landmark: '',
        city: '',
        state: '',
        pincode: '',
        country: 'India',
        type: 'HOME',
        isDefault: false
    });

    useEffect(() => {
        if (editAddress) {
            setFormData({
                name: editAddress.name,
                mobile: editAddress.mobile,
                street: editAddress.street,
                landmark: editAddress.landmark || '',
                city: editAddress.city,
                state: editAddress.state,
                pincode: editAddress.pincode,
                country: editAddress.country,
                type: editAddress.type,
                isDefault: editAddress.isDefault
            });
        } else {
            // Reset
            setFormData({
                name: '',
                mobile: '',
                street: '',
                landmark: '',
                city: '',
                state: '',
                pincode: '',
                country: 'India',
                type: 'HOME',
                isDefault: false
            });
        }
    }, [editAddress, isOpen]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            if (editAddress) {
                await updateAddress(editAddress._id, formData);
            } else {
                await addAddress(formData);
            }
            onClose();
        } catch (error) {
            console.error(error);
            alert('Failed to save address');
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value, type } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
        }));
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 animate-in fade-in">
            <div className="bg-white rounded-2xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]">
                <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-gray-50">
                    <h2 className="text-xl font-bold text-gray-900">
                        {editAddress ? 'Edit Address' : 'Add New Address'}
                    </h2>
                    <button onClick={onClose} className="p-2 hover:bg-gray-200 rounded-full transition-colors text-gray-500">
                        <X size={20} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 overflow-y-auto flex-1 space-y-4">
                    {/* Name & Mobile */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-1">Full Name</label>
                            <input
                                type="text"
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                                required
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-1">Mobile Number</label>
                            <input
                                type="tel"
                                name="mobile"
                                value={formData.mobile}
                                onChange={handleChange}
                                required
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
                            />
                        </div>
                    </div>

                    {/* Address */}
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1">Street Address</label>
                        <textarea
                            name="street"
                            value={formData.street}
                            onChange={handleChange}
                            required
                            rows={3}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none resize-none"
                            placeholder="House No, Building, Street Area"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-1">City</label>
                            <input
                                type="text"
                                name="city"
                                value={formData.city}
                                onChange={handleChange}
                                required
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-1">Pincode</label>
                            <input
                                type="text"
                                name="pincode"
                                value={formData.pincode}
                                onChange={handleChange}
                                required
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-1">State</label>
                            <input
                                type="text"
                                name="state"
                                value={formData.state}
                                onChange={handleChange}
                                required
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-1">Landmark (Optional)</label>
                            <input
                                type="text"
                                name="landmark"
                                value={formData.landmark || ''}
                                onChange={handleChange}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
                            />
                        </div>
                    </div>

                    {/* Type & Default */}
                    <div className="flex gap-4 items-end">
                        <div className="flex-1">
                            <label className="block text-sm font-semibold text-gray-700 mb-1">Address Type</label>
                            <div className="flex bg-gray-100 p-1 rounded-lg">
                                {['HOME', 'WORK', 'OTHER'].map(type => (
                                    <button
                                        key={type}
                                        type="button"
                                        onClick={() => setFormData(prev => ({ ...prev, type: type as any }))}
                                        className={`flex-1 py-1 px-3 rounded-md text-sm font-medium transition-all ${formData.type === type
                                            ? 'bg-white text-primary shadow-sm'
                                            : 'text-gray-500 hover:text-gray-900'
                                            }`}
                                    >
                                        {type}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <label className="flex items-center gap-2 mb-2 cursor-pointer">
                            <input
                                type="checkbox"
                                name="isDefault"
                                checked={formData.isDefault}
                                onChange={handleChange}
                                className="w-4 h-4 text-primary rounded focus:ring-primary"
                            />
                            <span className="text-sm font-medium text-gray-700">Make Default</span>
                        </label>
                    </div>
                </form>

                <div className="p-6 border-t border-gray-100 bg-gray-50">
                    <button
                        onClick={handleSubmit}
                        disabled={loading}
                        className="w-full py-3 bg-primary text-white rounded-xl font-bold hover:bg-primary/90 transition-colors flex items-center justify-center gap-2"
                    >
                        {loading && <Loader2 size={18} className="animate-spin" />}
                        {editAddress ? 'Update Address' : 'Save Address'}
                    </button>
                </div>

            </div>
        </div>
    );
};

export default AddressFormModal;
