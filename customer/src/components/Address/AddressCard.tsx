import React from 'react';
import type { Address } from '../../types/address.types';
import { Pencil, Trash2, MapPin, Check } from 'lucide-react';
import { useAddress } from '../../context/AddressContext';

interface AddressCardProps {
    address: Address;
    onEdit: (address: Address) => void;
    selectable?: boolean;
    selected?: boolean;
    onSelect?: (address: Address) => void;
}

const AddressCard: React.FC<AddressCardProps> = ({
    address,
    onEdit,
    selectable = false,
    selected = false,
    onSelect
}) => {
    const { deleteAddress, setDefaultAddress } = useAddress();

    const handleDelete = async (e: React.MouseEvent) => {
        e.stopPropagation();
        if (window.confirm('Are you sure you want to delete this address?')) {
            await deleteAddress(address._id);
        }
    };

    const handleSetDefault = async (e: React.MouseEvent) => {
        e.stopPropagation();
        await setDefaultAddress(address._id);
    };

    return (
        <div
            className={`border rounded-xl p-6 transition-all relative group bg-white ${selectable
                ? selected
                    ? 'border-primary bg-primary/5 shadow-md'
                    : 'border-gray-200 hover:border-gray-300 cursor-pointer'
                : 'border-gray-200 shadow-sm'
                }`}
            onClick={() => selectable && onSelect?.(address)}
        >
            {selectable && selected && (
                <div className="absolute top-4 right-4 text-primary bg-white rounded-full p-1 shadow-sm">
                    <Check size={16} />
                </div>
            )}

            <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-2">
                    <div className={`p-2 rounded-lg ${address.type === 'HOME' ? 'bg-blue-50 text-blue-600' : address.type === 'WORK' ? 'bg-purple-50 text-purple-600' : 'bg-gray-50 text-gray-600'}`}>
                        <MapPin size={20} />
                    </div>
                    <div>
                        <span className="text-xs font-bold uppercase tracking-wider text-gray-500">{address.type}</span>
                        {address.isDefault && (
                            <span className="ml-2 bg-primary/10 text-primary text-xs px-2 py-0.5 rounded-full font-bold">Default</span>
                        )}
                    </div>
                </div>

                {!selectable && (
                    <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                            onClick={(e) => { e.stopPropagation(); onEdit(address); }}
                            className="p-2 hover:bg-gray-100 rounded-lg text-gray-500 hover:text-gray-900 transition-colors"
                        >
                            <Pencil size={16} />
                        </button>
                        <button
                            onClick={handleDelete}
                            className="p-2 hover:bg-red-50 rounded-lg text-gray-400 hover:text-red-500 transition-colors"
                        >
                            <Trash2 size={16} />
                        </button>
                    </div>
                )}
            </div>

            <div className="space-y-1 mb-4">
                <p className="font-bold text-gray-900 text-lg">{address.name}</p>
                <p className="text-gray-600">{address.street}</p>
                {address.landmark && <p className="text-gray-500 text-sm">Near {address.landmark}</p>}
                <p className="text-gray-600">
                    {address.city}, {address.state} - {address.pincode}
                </p>
                <p className="font-medium text-gray-800 mt-2">{address.mobile}</p>
            </div>

            {!address.isDefault && !selectable && (
                <button
                    onClick={handleSetDefault}
                    className="text-sm font-semibold text-primary hover:underline mt-2"
                >
                    Set as Default
                </button>
            )}
        </div>
    );
};

export default AddressCard;
