import React, { createContext, useContext, useEffect, useState } from 'react';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

export type ThemeColors = {
    background: string;
    primary: string;
    secondary: string;
    accent: string;
    surface?: string;
    textPrimary?: string;
    textSecondary?: string;
    border?: string;
};

export type Theme = {
    id: string;
    name: string;
    colors: ThemeColors;
};

// Default theme matching our current static theme
export const DEFAULT_THEME: Theme = {
    id: 'default',
    name: 'Default',
    colors: {
        background: '#FFFFFF',
        primary: '#000000',
        secondary: '#666666',
        accent: '#999999',
        surface: '#F5F5F5',
        textPrimary: '#000000',
        textSecondary: '#666666',
        border: '#E5E5E5',
    },
};

interface ThemeContextType {
    theme: Theme;
    setTheme: (theme: Theme) => void;
    loading: boolean;
    refreshTheme: () => Promise<void>;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [theme, setThemeState] = useState<Theme>(DEFAULT_THEME);
    const [loading, setLoading] = useState(true);

    const refreshTheme = async () => {
        try {
            // Use static URL or get from http.ts if possible, but let's just use axios here for simplicity or better, our http service
            // For now, let's fetch from the theme endpoint
            // In mobile, we might need the full URL
            const baseURL = 'http://10.10.10.168:3000/api/v1/customer'; // Matches http.ts
            const response = await axios.get(`${baseURL}/themes/customer`);
            
            if (response.data && response.data.data) {
                const backendTheme = response.data.data;
                const newTheme: Theme = {
                    id: 'backend',
                    name: backendTheme.name || 'Custom',
                    colors: {
                        background: backendTheme.colors.background || DEFAULT_THEME.colors.background,
                        primary: backendTheme.colors.primary || DEFAULT_THEME.colors.primary,
                        secondary: backendTheme.colors.secondary || DEFAULT_THEME.colors.secondary,
                        accent: backendTheme.colors.accent || DEFAULT_THEME.colors.accent,
                        surface: backendTheme.colors.surface || (backendTheme.colors.background === '#FFFFFF' ? '#F5F5F5' : backendTheme.colors.background),
                        textPrimary: backendTheme.colors.textPrimary || backendTheme.colors.primary || DEFAULT_THEME.colors.textPrimary,
                        textSecondary: backendTheme.colors.textSecondary || backendTheme.colors.secondary || DEFAULT_THEME.colors.textSecondary,
                        border: backendTheme.colors.border || DEFAULT_THEME.colors.border,
                    }
                };
                setThemeState(newTheme);
                await AsyncStorage.setItem('app_theme', JSON.stringify(newTheme));
            }
        } catch (error) {
            console.error('Failed to fetch dynamic theme', error);
            const savedTheme = await AsyncStorage.getItem('app_theme');
            if (savedTheme) {
                setThemeState(JSON.parse(savedTheme));
            }
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        refreshTheme();
    }, []);

    const setTheme = (newTheme: Theme) => {
        setThemeState(newTheme);
    };

    return (
        <ThemeContext.Provider value={{
            theme,
            setTheme,
            loading,
            refreshTheme
        }}>
            {children}
        </ThemeContext.Provider>
    );
};

export const useTheme = () => {
    const context = useContext(ThemeContext);
    if (!context) {
        throw new Error('useTheme must be used within a ThemeProvider');
    }
    return context;
};
