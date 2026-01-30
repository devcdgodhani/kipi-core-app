import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Toast from 'react-native-toast-message';

export interface Address {
  _id: string;
  name: string;
  phone: string;
  pincode: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  type: 'HOME' | 'WORK' | 'OTHER';
  isDefault: boolean;
}

interface AddressContextType {
  addresses: Address[];
  loading: boolean;
  addAddress: (address: Omit<Address, '_id'>) => Promise<void>;
  updateAddress: (id: string, address: Partial<Address>) => Promise<void>;
  deleteAddress: (id: string) => Promise<void>;
  setDefaultAddress: (id: string) => Promise<void>;
  getDefaultAddress: () => Address | undefined;
}

const AddressContext = createContext<AddressContextType | undefined>(undefined);

export const AddressProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAddresses();
  }, []);

  const loadAddresses = async () => {
    try {
      const savedAddresses = await AsyncStorage.getItem('USER_ADDRESSES');
      if (savedAddresses) {
        setAddresses(JSON.parse(savedAddresses));
      } else {
        // Mock data for development if empty
        const mockAddresses: Address[] = [
          {
            _id: '1',
            name: 'John Doe',
            phone: '9876543210',
            pincode: '400001',
            addressLine1: '123, Main Street',
            addressLine2: 'Near Central Park',
            city: 'Mumbai',
            state: 'Maharashtra',
            type: 'HOME',
            isDefault: true,
          },
        ];
        setAddresses(mockAddresses);
        await AsyncStorage.setItem('USER_ADDRESSES', JSON.stringify(mockAddresses));
      }
    } catch (error) {
      console.error('Failed to load addresses', error);
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Failed to load addresses',
      });
    } finally {
      setLoading(false);
    }
  };

  const saveAddresses = async (newAddresses: Address[]) => {
    try {
      await AsyncStorage.setItem('USER_ADDRESSES', JSON.stringify(newAddresses));
      setAddresses(newAddresses);
    } catch (error) {
      console.error('Failed to save addresses', error);
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Failed to save address changes',
      });
    }
  };

  const addAddress = async (addressData: Omit<Address, '_id'>) => {
    const newAddress: Address = {
      ...addressData,
      _id: Date.now().toString(),
      isDefault: addresses.length === 0 || addressData.isDefault,
    };

    let updatedAddresses = [...addresses];
    
    if (newAddress.isDefault) {
      updatedAddresses = updatedAddresses.map(addr => ({ ...addr, isDefault: false }));
    }
    
    updatedAddresses.push(newAddress);
    await saveAddresses(updatedAddresses);
    
    Toast.show({
      type: 'success',
      text1: 'Address Added',
    });
  };

  const updateAddress = async (id: string, updates: Partial<Address>) => {
    let updatedAddresses = addresses.map(addr => {
      if (addr._id === id) {
        return { ...addr, ...updates };
      }
      return addr;
    });

    if (updates.isDefault) {
      updatedAddresses = updatedAddresses.map(addr => ({ 
        ...addr, 
        isDefault: addr._id === id 
      }));
    }

    await saveAddresses(updatedAddresses);
    Toast.show({
      type: 'success',
      text1: 'Address Updated',
    });
  };

  const deleteAddress = async (id: string) => {
    const updatedAddresses = addresses.filter(addr => addr._id !== id);
    await saveAddresses(updatedAddresses);
    Toast.show({
      type: 'success',
      text1: 'Address Deleted',
    });
  };

  const setDefaultAddress = async (id: string) => {
    const updatedAddresses = addresses.map(addr => ({
      ...addr,
      isDefault: addr._id === id,
    }));
    await saveAddresses(updatedAddresses);
    Toast.show({
      type: 'success',
      text1: 'Default Address Updated',
    });
  };

  const getDefaultAddress = () => {
    return addresses.find(addr => addr.isDefault) || addresses[0];
  };

  return (
    <AddressContext.Provider
      value={{
        addresses,
        loading,
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
