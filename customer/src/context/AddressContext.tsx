import React, { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import type { Address, CreateAddressRequest, UpdateAddressRequest } from '../types/address.types';
import { addressService } from '../services/address.service';

interface AddressContextType {
    addresses: Address[];
    loading: boolean;
    refreshAddresses: () => Promise<void>;
    addAddress: (data: Omit<CreateAddressRequest, 'userId'>) => Promise<void>;
    updateAddress: (id: string, data: UpdateAddressRequest) => Promise<void>;
    deleteAddress: (id: string) => Promise<void>;
    setDefaultAddress: (id: string) => Promise<void>;
}

const AddressContext = createContext<AddressContextType | undefined>(undefined);

export const AddressProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [addresses, setAddresses] = useState<Address[]>([]);
    const [loading, setLoading] = useState(false);
    const userId = localStorage.getItem('USER_ID') || '';

    const refreshAddresses = async () => {
        if (!userId) return;
        setLoading(true);
        try {
            const data = await addressService.getByUser(userId);
            setAddresses(data);
        } catch (error) {
            console.error('Failed to fetch addresses:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (userId) {
            refreshAddresses();
        }
    }, [userId]);

    const addAddress = async (data: Omit<CreateAddressRequest, 'userId'>) => {
        setLoading(true);
        try {
            await addressService.create({ ...data, userId });
            await refreshAddresses();
        } catch (error) {
            console.error('Failed to add address:', error);
            throw error;
        } finally {
            setLoading(false);
        }
    };

    const updateAddress = async (id: string, data: UpdateAddressRequest) => {
        setLoading(true);
        try {
            await addressService.update(id, data);
            await refreshAddresses();
        } catch (error) {
            console.error('Failed to update address:', error);
            throw error;
        } finally {
            setLoading(false);
        }
    };

    const deleteAddress = async (id: string) => {
        setLoading(true);
        try {
            await addressService.delete(id);
            await refreshAddresses();
        } catch (error) {
            console.error('Failed to delete address:', error);
            throw error;
        } finally {
            setLoading(false);
        }
    };

    const setDefaultAddress = async (id: string) => {
        setLoading(true);
        try {
            // Optimistic update or backend handles unsetting others?
            // Assuming backend handles "set this to true, unset others" or we might need to handle it.
            // Usually backend should handle "single default" logic.
            await addressService.setDefault(id);
            await refreshAddresses();
        } catch (error) {
            console.error('Failed to set default address:', error);
            throw error;
        } finally {
            setLoading(false);
        }
    };

    return (
        <AddressContext.Provider value={{ addresses, loading, refreshAddresses, addAddress, updateAddress, deleteAddress, setDefaultAddress }}>
            {children}
        </AddressContext.Provider>
    );
};

export const useAddress = () => {
    const context = useContext(AddressContext);
    if (!context) {
        throw new Error('useAddress must be used within an AddressProvider');
    }
    return context;
};
