import React, { createContext, useState, useContext, useEffect } from 'react';
import { walletService } from '../services/wallet.service';
import { Wallet, WalletTransaction } from '../types/wallet.types';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Toast from 'react-native-toast-message';
import { useAuth } from './AuthContext';

interface WalletContextType {
  wallet: Wallet | null;
  transactions: WalletTransaction[];
  loading: boolean;
  refreshWallet: () => Promise<void>;
  loadTransactions: (page: number) => Promise<void>;
  totalTransactions: number;
  expiringSoon: WalletTransaction | null;
  totalExpired: number;
}

const WalletContext = createContext<WalletContextType | undefined>(undefined);

export const WalletProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [wallet, setWallet] = useState<Wallet | null>(null);
  const [transactions, setTransactions] = useState<WalletTransaction[]>([]);
  const [loading, setLoading] = useState(false);
  const [totalTransactions, setTotalTransactions] = useState(0);
  const [expiringSoon, setExpiringSoon] = useState<WalletTransaction | null>(null);
  const [totalExpired, setTotalExpired] = useState(0);

  const refreshWallet = async () => {
    try {
      // Check if user is logged in
      const token = await AsyncStorage.getItem('ACCESS_TOKEN');
      if (!token) {
        setWallet(null);
        setTransactions([]);
        setExpiringSoon(null);
        return;
      }

      setLoading(true);
      const [walletRes, expiringRes] = await Promise.all([
        walletService.getMyWallet().catch(() => null),
        walletService.getExpiringTransactions(30).catch(() => [])
      ]);

      // Backend returns { status, code, message, data: wallet }
      // The http interceptor extracts response.data
      const walletData = walletRes?.data || walletRes;
      if (walletData) {
        setWallet(walletData);
        setTotalExpired(walletData.totalExpired || 0);
      }

      const expiryList = expiringRes?.data || expiringRes;
      if (Array.isArray(expiryList) && expiryList.length > 0) {
        setExpiringSoon(expiryList[0]);
      } else {
        setExpiringSoon(null);
      }
    } catch (error) {
      console.error('Failed to fetch wallet:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadTransactions = async (page: number = 1) => {
    try {
      setLoading(true);
      const response = await walletService.getMyTransactions({ page, limit: 20 });
      // Backend returns { status, code, message, data: { recordList, totalRecords, ... } }
      // The http interceptor extracts response.data
      const paginationData = response?.data || response;

      if (paginationData && paginationData.recordList) {
        if (page === 1) {
          setTransactions(paginationData.recordList);
        } else {
          setTransactions(prev => [...prev, ...paginationData.recordList]);
        }
        setTotalTransactions(paginationData.totalRecords || 0);
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
  }, [user]);

  return (
    <WalletContext.Provider 
      value={{ 
        wallet, 
        transactions, 
        loading, 
        refreshWallet, 
        loadTransactions,
        totalTransactions,
        expiringSoon,
        totalExpired
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
