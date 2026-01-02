import React, { useState } from 'react';
import { useAddress } from '../../context/AddressContext';
import AddressCard from '../../components/Address/AddressCard';
import AddressFormModal from '../../components/Address/AddressFormModal';
import { Plus, MapPin } from 'lucide-react';
import type { Address } from '../../types/address.types';

const ManageAddresses: React.FC = () => {
    const { addresses, loading } = useAddress();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingAddress, setEditingAddress] = useState<Address | null>(null);

    const handleEdit = (address: Address) => {
        setEditingAddress(address);
        setIsModalOpen(true);
    };

    const handleAdd = () => {
        setEditingAddress(null);
        setIsModalOpen(true);
    };

    const handleClose = () => {
        setIsModalOpen(false);
        setEditingAddress(null);
    };

    if (loading && addresses.length === 0) {
        return <div className="min-h-screen pt-24 text-center">Loading addresses...</div>;
    }

    return (
        <div className="min-h-screen bg-gray-50 py-12">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center mb-8">
                    <div className="flex items-center gap-3">
                        <div className="p-3 bg-white rounded-xl shadow-sm border border-gray-100 text-primary">
                            <MapPin size={24} />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">My Addresses</h1>
                            <p className="text-gray-500 text-sm">Manage your saved addresses for checkout</p>
                        </div>
                    </div>

                    <button
                        onClick={handleAdd}
                        className="flex items-center gap-2 px-6 py-2.5 bg-primary text-white rounded-xl font-bold hover:bg-primary/90 transition-all shadow-sm hover:shadow-primary/20"
                    >
                        <Plus size={20} />
                        Add New Address
                    </button>
                </div>

                <div className="grid gap-6">
                    {addresses.length === 0 ? (
                        <div className="bg-white rounded-2xl p-12 text-center shadow-sm border border-gray-100">
                            <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-400">
                                <MapPin size={32} />
                            </div>
                            <h3 className="text-lg font-bold text-gray-900 mb-1">No addresses saved</h3>
                            <p className="text-gray-500 mb-6">Add an address to speed up your checkout process.</p>
                            <button onClick={handleAdd} className="text-primary font-bold hover:underline">
                                Add Address Now
                            </button>
                        </div>
                    ) : (
                        addresses.map(address => (
                            <AddressCard
                                key={address._id}
                                address={address}
                                onEdit={handleEdit}
                            />
                        ))
                    )}
                </div>
            </div>

            <AddressFormModal
                isOpen={isModalOpen}
                onClose={handleClose}
                editAddress={editingAddress}
            />
        </div>
    );
};

export default ManageAddresses;
