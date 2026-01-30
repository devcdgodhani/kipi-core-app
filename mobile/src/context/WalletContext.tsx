import React, { createContext, useState, useContext, useEffect } from 'react';
import { walletService } from '../services/wallet.service';
import { Wallet, WalletTransaction } from '../types/wallet.types';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Toast from 'react-native-toast-message';

interface WalletContextType {
  wallet: Wallet | null;
  transactions: WalletTransaction[];
  loading: boolean;
  refreshWallet: () => Promise<void>;
  loadTransactions: (page: number) => Promise<void>;
  totalTransactions: number;
}

const WalletContext = createContext<WalletContextType | undefined>(undefined);

export const WalletProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [wallet, setWallet] = useState<Wallet | null>(null);
  const [transactions, setTransactions] = useState<WalletTransaction[]>([]);
  const [loading, setLoading] = useState(false);
  const [totalTransactions, setTotalTransactions] = useState(0);

  const refreshWallet = async () => {
    try {
      // Check if user is logged in
      const token = await AsyncStorage.getItem('ACCESS_TOKEN');
      if (!token) {
        setWallet(null);
        setTransactions([]);
        return;
      }

      setLoading(true);
      const walletData = await walletService.getMyWallet();
      if (walletData) {
        setWallet(walletData);
      }
    } catch (error) {
           console.error('Failed to fetch wallet:', error);
      // Silent fail or toast? Silent for initial load usually
    } finally {
      setLoading(false);
    }
  };

  const loadTransactions = async (page: number = 1) => {
    try {
      setLoading(true);
      const result = await walletService.getMyTransactions({ page, limit: 20 });
      if (result && result.recordList) {
        if (page === 1) {
          setTransactions(result.recordList);
        } else {
          setTransactions(prev => [...prev, ...result.recordList]);
        }
        setTotalTransactions(result.totalRecords || 0);
      }
    } catch (error) {
      console.error('Failed to fetch transactions:', error);
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Failed to load transactions'
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshWallet();
  }, []);

  return (
    <WalletContext.Provider 
      value={{ 
        wallet, 
        transactions, 
        loading, 
        refreshWallet, 
        loadTransactions,
        totalTransactions
      }}
    >
      {children}
    </WalletContext.Provider>
  );
};

export const useWallet = () => {
  const context = useContext(WalletContext);
  if (context === undefined) {
    throw new Error('useWallet must be used within a WalletProvider');
  }
  return context;
};
