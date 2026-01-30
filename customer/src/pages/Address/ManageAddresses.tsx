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
        return <div className="text-center py-20 text-secondary">Loading addresses...</div>;
    }

    return (
        <div className="space-y-8">
            <div className="flex justify-between items-center mb-8">
                <div className="flex items-center gap-3">
                    <div className="p-3 bg-background rounded-xl shadow-sm border border-primary/10 text-primary">
                        <MapPin size={24} />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-primary">My Addresses</h1>
                        <p className="text-secondary text-sm">Manage your saved addresses for checkout</p>
                    </div>
                </div>

                <button
                    onClick={handleAdd}
                    className="flex items-center gap-2 px-6 py-2.5 bg-primary text-background rounded-xl font-bold hover:bg-primary/90 transition-all shadow-sm hover:shadow-primary/20"
                >
                    <Plus size={20} />
                    Add New Address
                </button>
            </div>

            <div className="grid gap-6">
                {addresses.length === 0 ? (
                    <div className="bg-background rounded-2xl p-12 text-center shadow-sm border border-primary/10">
                        <div className="w-16 h-16 bg-primary/5 rounded-full flex items-center justify-center mx-auto mb-4 text-secondary/50">
                            <MapPin size={32} />
                        </div>
                        <h3 className="text-lg font-bold text-primary mb-1">No addresses saved</h3>
                        <p className="text-secondary mb-6">Add an address to speed up your checkout process.</p>
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

            <AddressFormModal
                isOpen={isModalOpen}
                onClose={handleClose}
                editAddress={editingAddress}
            />
        </div>
    );
};

export default ManageAddresses;
