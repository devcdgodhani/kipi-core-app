import React, { createContext, useContext, useEffect, useState } from 'react';

export type ThemeColors = {
    background: string;
    primary: string;
    secondary: string;
    accent: string;
};

export type Theme = {
    id: string;
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
    {
        id: 'soft-sky',
        name: 'Soft Sky',
        colors: {
            background: '#f0f9ff', // Sky 50
            primary: '#0369a1',    // Sky 700
            secondary: '#38bdf8',  // Sky 400
            accent: '#7dd3fc',     // Sky 300
        },
    },
    {
        id: 'calm-teal',
        name: 'Calm Teal',
        colors: {
            background: '#f0fdfa', // Teal 50
            primary: '#0f766e',    // Teal 700
            secondary: '#2dd4bf',  // Teal 400
            accent: '#5eead4',     // Teal 300
        },
    },
    {
        id: 'pale-violet',
        name: 'Pale Violet',
        colors: {
            background: '#f5f3ff', // Violet 50
            primary: '#6d28d9',    // Violet 700
            secondary: '#a78bfa',  // Violet 400
            accent: '#c4b5fd',     // Violet 300
        },
    },
    {
        id: 'muted-indigo',
        name: 'Muted Indigo',
        colors: {
            background: '#eef2ff', // Indigo 50
            primary: '#4338ca',    // Indigo 700
            secondary: '#818cf8',  // Indigo 400
            accent: '#a5b4fc',     // Indigo 300
        },
    },
    {
        id: 'fresh-mint',
        name: 'Fresh Mint',
        colors: {
            background: '#f0fdf4', // Green 50
            primary: '#15803d',    // Green 700
            secondary: '#4ade80',  // Green 400
            accent: '#86efac',     // Green 300
        },
    },
    {
        id: 'glacial-blue',
        name: 'Glacial Blue',
        colors: {
            background: '#eff6ff', // Blue 50
            primary: '#1d4ed8',    // Blue 700
            secondary: '#60a5fa',  // Blue 400
            accent: '#93c5fd',     // Blue 300
        },
    },
    {
        id: 'arctic-gray',
        name: 'Arctic Gray',
        colors: {
            background: '#f9fafb', // Gray 50
            primary: '#374151',    // Gray 700
            secondary: '#9ca3af',  // Gray 400
            accent: '#d1d5db',     // Gray 300
        },
    },
    {
        id: 'soft-cyan',
        name: 'Soft Cyan',
        colors: {
            background: '#ecfeff', // Cyan 50
            primary: '#0e7490',    // Cyan 700
            secondary: '#22d3ee',  // Cyan 400
            accent: '#67e8f9',     // Cyan 300
        },
    },
    {
        id: 'lilac-mist',
        name: 'Lilac Mist',
        colors: {
            background: '#faf5ff', // Purple 50
            primary: '#7e22ce',    // Purple 700
            secondary: '#c084fc',  // Purple 400
            accent: '#d8b4fe',     // Purple 300
        },
    },
    {
        id: 'cloud-white',
        name: 'Cloud White',
        colors: {
            background: '#fafafa', // Neutral 50
            primary: '#404040',    // Neutral 700
            secondary: '#a3a3a3',  // Neutral 400
            accent: '#d4d4d4',     // Neutral 300
        },
    },
    {
        id: 'azure-dream',
        name: 'Azure Dream',
        colors: {
            background: '#f0f9ff', // Sky 50
            primary: '#0284c7',    // Sky 600
            secondary: '#38bdf8',  // Sky 400
            accent: '#7dd3fc',     // Sky 300
        },
    },
];

interface ThemeContextType {
    currentTheme: Theme;
    setTheme: (theme: Theme) => void;
    availableThemes: Theme[];
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [currentTheme, setCurrentThemeState] = useState<Theme>(() => {
        const savedThemeId = localStorage.getItem('app-theme-id');
        const foundTheme = PREDEFINED_THEMES.find((t) => t.id === savedThemeId);
        return foundTheme || PREDEFINED_THEMES[0];
    });

    const setTheme = (theme: Theme) => {
        setCurrentThemeState(theme);
        localStorage.setItem('app-theme-id', theme.id);
    };

    useEffect(() => {
        const root = document.documentElement;
        root.style.setProperty('--background', currentTheme.colors.background);
        root.style.setProperty('--primary', currentTheme.colors.primary);
        root.style.setProperty('--secondary', currentTheme.colors.secondary);
        root.style.setProperty('--accent', currentTheme.colors.accent);
    }, [currentTheme]);

    return (
        <ThemeContext.Provider value={{ currentTheme, setTheme, availableThemes: PREDEFINED_THEMES }}>
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
