import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Toast from 'react-native-toast-message';
import { Address } from '../types/address.types';

interface AddressContextType {
  addresses: Address[];
  loading: boolean;
  refreshAddresses: () => Promise<void>;
  addAddress: (address: Omit<Address, '_id' | 'createdAt' | 'updatedAt' | 'userId' | 'status'>) => Promise<void>;
  updateAddress: (id: string, address: Partial<Address>) => Promise<void>;
  deleteAddress: (id: string) => Promise<void>;
  setDefaultAddress: (id: string) => Promise<void>;
  getDefaultAddress: () => Address | undefined;
}

import { addressService } from '../services/address.service';

const AddressContext = createContext<AddressContextType | undefined>(undefined);

export const AddressProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    refreshAddresses();
  }, []);

  const refreshAddresses = async () => {
    try {
      setLoading(true);
      // We need user id for the API call
      const userData = await AsyncStorage.getItem('user');
      if (userData) {
        const user = JSON.parse(userData);
        const userId = user._id || user.id;
        if (userId) {
          const remoteAddresses = await addressService.getByUser(userId);
          setAddresses(remoteAddresses || []);
          return;
        }
      }

      // Fallback to local storage if user not found or API fails
      const savedAddresses = await AsyncStorage.getItem('USER_ADDRESSES');
      if (savedAddresses) {
        setAddresses(JSON.parse(savedAddresses));
      }
    } catch (error) {
      console.error('Failed to load addresses', error);
      // Fallback to local storage
      const savedAddresses = await AsyncStorage.getItem('USER_ADDRESSES');
      if (savedAddresses) {
        setAddresses(JSON.parse(savedAddresses));
      }
    } finally {
      setLoading(false);
    }
  };

  const addAddress = async (addressData: Omit<Address, '_id' | 'createdAt' | 'updatedAt' | 'userId' | 'status'>) => {
    try {
      const userData = await AsyncStorage.getItem('user');
      if (userData) {
        const user = JSON.parse(userData);
        const userId = user._id || user.id;
        // Map fields to match CreateAddressRequest if necessary
        const requestData = {
          ...addressData,
          userId,
        };
        const newAddr = await addressService.create(requestData);
        setAddresses(prev => [...prev, newAddr]);
        Toast.show({ type: 'success', text1: 'Address Added' });
      }
    } catch (error) {
      console.error('Failed to add address', error);
      Toast.show({ type: 'error', text1: 'Failed to add address' });
    }
  };

  const updateAddress = async (id: string, updates: Partial<Address>) => {
    try {
      await addressService.update(id, updates);
      setAddresses(prev => prev.map(addr => addr._id === id ? { ...addr, ...updates } : addr));
      Toast.show({ type: 'success', text1: 'Address Updated' });
    } catch (error) {
      console.error('Failed to update address', error);
      Toast.show({ type: 'error', text1: 'Failed to update address' });
    }
  };

  const deleteAddress = async (id: string) => {
    try {
      await addressService.delete(id);
      setAddresses(prev => prev.filter(addr => addr._id !== id));
      Toast.show({ type: 'success', text1: 'Address Deleted' });
    } catch (error) {
      console.error('Failed to delete address', error);
      Toast.show({ type: 'error', text1: 'Failed to delete address' });
    }
  };

  const setDefaultAddress = async (id: string) => {
    try {
      await addressService.setDefault(id);
      setAddresses(prev => prev.map(addr => ({
        ...addr,
        isDefault: addr._id === id,
      })));
      Toast.show({ type: 'success', text1: 'Default Address Updated' });
    } catch (error) {
      console.error('Failed to set default address', error);
      Toast.show({ type: 'error', text1: 'Failed to update default address' });
    }
  };

  const getDefaultAddress = () => {
    return addresses.find(addr => addr.isDefault) || addresses[0];
  };

  return (
    <AddressContext.Provider
      value={{
        addresses,
        loading,
        refreshAddresses,
        addAddress,
        updateAddress,
        deleteAddress,
        setDefaultAddress,
        getDefaultAddress,
      }}
    >
      {children}
    </AddressContext.Provider>
  );
};

export const useAddress = () => {
  const context = useContext(AddressContext);
  if (context === undefined) {
    throw new Error('useAddress must be used within a AddressProvider');
  }
  return context;
};
