import React, { createContext, useContext, useEffect, useState } from 'react';
import { themeService } from '../services/theme.service';
import { toast } from 'react-hot-toast';

export type ThemeColors = {
    background: string;
    primary: string;
    secondary: string;
    accent: string;
};

export type Theme = {
    id: string; // Used for identifying predefined vs custom
    name: string;
    colors: ThemeColors;
};

export const PREDEFINED_THEMES: Theme[] = [
    {
        id: 'cool-slate',
        name: 'Serene Slate',
        colors: {
            background: '#f8fafc', // Slate 50
            primary: '#334155',    // Slate 700
            secondary: '#64748b',  // Slate 500
            accent: '#94a3b8',     // Slate 400
        },
    },
    // ... we can keep other predefined themes for quick switcher if needed, 
    // or rely purely on dynamic theme which comes from backend.
    // For now keeping 'Serene Slate' as fallback default.
];

interface ThemeContextType {
    currentTheme: Theme;
    setTheme: (theme: Theme, persist?: boolean) => void;
    availableThemes: Theme[];
    refreshTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [currentTheme, setCurrentThemeState] = useState<Theme>(PREDEFINED_THEMES[0]);

    const setTheme = async (theme: Theme, persist = false) => {
    // Optimistic update
        setCurrentThemeState(theme);

        // If it's a dynamic backend update request
        if (persist) {
            try {
                await themeService.updateByAppName('admin', {
                    appName: 'admin',
                    colors: theme.colors,
                    name: theme.name
                });
                toast.success('Theme updated successfully');
            } catch (error) {
                console.error('Failed to update theme', error);
                toast.error('Failed to update theme');
            }
        } else {
            localStorage.setItem('app-theme-id', theme.id);
        }
    };

    const fetchBackendTheme = async () => {
        try {
            const res = await themeService.getByAppName('admin');
            if (res.data) {
                setCurrentThemeState({
                    id: 'custom-backend',
                    name: res.data.name || 'Custom Theme',
                    colors: res.data.colors
                });
            }
        } catch (error) {
            console.error('Failed to fetch theme', error);
            // Fallback to local storage or default
            const savedThemeId = localStorage.getItem('app-theme-id');
            const foundTheme = PREDEFINED_THEMES.find((t) => t.id === savedThemeId);
            if (foundTheme) setCurrentThemeState(foundTheme);
        }
    };

    useEffect(() => {
        fetchBackendTheme();
    }, []);

    useEffect(() => {
        const root = document.documentElement;
        root.style.setProperty('--background', currentTheme.colors.background);
        root.style.setProperty('--primary', currentTheme.colors.primary);
        root.style.setProperty('--secondary', currentTheme.colors.secondary);
        root.style.setProperty('--accent', currentTheme.colors.accent);
    }, [currentTheme]);

    return (
        <ThemeContext.Provider value={{
            currentTheme,
            setTheme,
            availableThemes: PREDEFINED_THEMES,
            refreshTheme: fetchBackendTheme
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

