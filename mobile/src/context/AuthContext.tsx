import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { authService } from '../services/auth.service';

interface AuthContextType {
  isAuthenticated: boolean;
  user: any;
  loading: boolean;
  login: (credentials: { email: string; password: string }) => Promise<void>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
  updateUser: (userData: any) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    checkAuth();



  }, []);

  const checkAuth = async () => {
    try {
      const token = await AsyncStorage.getItem('ACCESS_TOKEN');
      const userStr = await AsyncStorage.getItem('user');

      if (token) {
        setIsAuthenticated(true);
        if (userStr) {
          setUser(JSON.parse(userStr));
        }

        // Always try to fetch fresh user data from /auth/me
        try {
          const freshUserRes = await authService.getMe();
          const freshUser = freshUserRes?.data || freshUserRes;
          if (freshUser) {
            setUser(freshUser);
            await AsyncStorage.setItem('user', JSON.stringify(freshUser));
          }
        } catch (meError) {
          console.error('Failed to fetch fresh user data:', meError);
          // If 401, logout will be handled by http interceptor
        }
      } else {
        setIsAuthenticated(false);
        setUser(null);
      }
    } catch (error) {
      console.error('Check auth error:', error);
      setIsAuthenticated(false);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const login = async (credentials: { email: string; password: string }) => {
    try {
      await authService.login(credentials);
      await checkAuth(); // Re-check to update state and fetch /me
    } catch (error) {
      throw error;
    }
  };

  const logout = async () => {
    try {
      await authService.logout();
      setIsAuthenticated(false);
      setUser(null);
    } catch (error) {
      console.error('Logout error:', error);
      // Even if API fails, clear local state
      await AsyncStorage.clear();
      setIsAuthenticated(false);
      setUser(null);
    }
  };

  const updateUser = (userData: any) => {
    setUser(userData);
    AsyncStorage.setItem('user', JSON.stringify(userData));
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, user, loading, login, logout, checkAuth, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
