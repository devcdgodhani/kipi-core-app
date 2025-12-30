import React, { useState } from 'react';
import { Palette, X } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

export const ThemeSwitcher: React.FC = () => {
    const { currentTheme, setTheme, availableThemes } = useTheme();
    const [isOpen, setIsOpen] = useState(false);

    return (
        <div className="fixed bottom-6 right-6 z-50">
            {isOpen && (
                <div className="absolute bottom-16 right-0 bg-white rounded-lg shadow-xl border border-gray-200 p-4 w-64 animate-in fade-in slide-in-from-bottom-4 mb-2">
                    <div className="flex items-center justify-between mb-3 border-b pb-2">
                        <span className="font-semibold text-sm">Select Theme</span>
                        <button onClick={() => setIsOpen(false)} className="text-gray-400 hover:text-gray-600">
                            <X size={16} />
                        </button>
                    </div>
                    <div className="space-y-2">
                        {availableThemes.map((theme) => (
                            <button
                                key={theme.id}
                                onClick={() => setTheme(theme)}
                                className={`w-full flex items-center gap-3 p-2 rounded-md transition-colors ${currentTheme.id === theme.id
                                        ? 'bg-gray-100 ring-1 ring-gray-300'
                                        : 'hover:bg-gray-50'
                                    }`}
                            >
                                <div className="flex gap-1">
                                    <div
                                        className="w-4 h-4 rounded-full"
                                        style={{ backgroundColor: theme.colors.primary }}
                                    />
                                    <div
                                        className="w-4 h-4 rounded-full"
                                        style={{ backgroundColor: theme.colors.accent }}
                                    />
                                </div>
                                <span className="text-sm text-gray-700">{theme.name}</span>
                            </button>
                        ))}
                    </div>
                </div>
            )}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="h-12 w-12 bg-white rounded-full shadow-lg border border-gray-200 flex items-center justify-center hover:bg-gray-50 transition-all hover:scale-105 active:scale-95 text-gray-700"
                title="Change Theme"
            >
                <Palette size={20} />
            </button>
        </div>
    );
};
