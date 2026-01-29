import React, { useEffect, useState } from 'react';
import { useTheme } from '../../context/ThemeContext';
import { themeService, type ThemeColors } from '../../services/theme.service';
import { toast } from 'react-hot-toast';
import { Save, RotateCcw, Monitor, Smartphone, Palette, Loader2 } from 'lucide-react';

const ThemeSettings: React.FC = () => {
    const { refreshTheme } = useTheme();
    const [activeTab, setActiveTab] = useState<'admin' | 'customer'>('admin');
    const [isLoading, setIsLoading] = useState(false);
    const [isSaving, setIsSaving] = useState(false);

    const [adminColors, setAdminColors] = useState<ThemeColors>({
        primary: '#334155',
        secondary: '#64748b',
        background: '#f8fafc',
        accent: '#94a3b8'
    });

    const [customerColors, setCustomerColors] = useState<ThemeColors>({
        primary: '#000000',
        secondary: '#ffffff',
        background: '#ffffff',
        accent: '#cccccc'
    });

    useEffect(() => {
        fetchThemes();
    }, []);

    const fetchThemes = async () => {
        setIsLoading(true);
        try {
            const adminRes = await themeService.getByAppName('admin');
            if (adminRes.data) {
                setAdminColors(adminRes.data.colors);
            }

            // Also try to fetch customer theme (if open route allows or backend returns default)
            // Note: Customer theme fetch might fail if not seeded or if calling open route logic is slightly different
            // But lets assume we wrap calls properly in service
            try {
                const customerRes = await themeService.getByAppName('customer');
                if (customerRes.data) {
                    setCustomerColors(customerRes.data.colors);
                }
            } catch (ignored) {
                // If customer theme doesn't exist yet, we stick to defaults
            }

        } catch (error) {
            console.error('Error fetching themes:', error);
            toast.error('Failed to load theme settings');
        } finally {
            setIsLoading(false);
        }
    };

    const handleColorChange = (key: keyof ThemeColors, value: string) => {
        if (activeTab === 'admin') {
            setAdminColors(prev => ({ ...prev, [key]: value }));
        } else {
            setCustomerColors(prev => ({ ...prev, [key]: value }));
        }
    };

    const handleSave = async () => {
        setIsSaving(true);
        try {
            const dataToSave = activeTab === 'admin' ? adminColors : customerColors;

            await themeService.updateByAppName(activeTab, {
                appName: activeTab,
                colors: dataToSave,
                name: `${activeTab.charAt(0).toUpperCase() + activeTab.slice(1)} Theme`
            });

            toast.success(`${activeTab === 'admin' ? 'Admin' : 'Customer'} theme updated successfully`);

            if (activeTab === 'admin') {
                refreshTheme(); // Refresh current admin UI context
            }
        } catch (error) {
            console.error('Error saving theme:', error);
            toast.error('Failed to save theme');
        } finally {
            setIsSaving(false);
        }
    };

    const handleReset = () => {
        if (confirm('Are you sure you want to reset changes? Unsaved changes will be lost.')) {
            fetchThemes();
        }
    };

    const currentColors = activeTab === 'admin' ? adminColors : customerColors;

    return (
        <div className="p-6 max-w-4xl mx-auto">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Theme Settings</h1>
                    <p className="text-gray-500 mt-1">Manage appearance for Admin and Customer applications</p>
                </div>
                <div className="flex gap-3">
                    <button
                        onClick={handleReset}
                        disabled={isSaving || isLoading}
                        className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                    >
                        <RotateCcw size={18} />
                        Reset
                    </button>
                    <button
                        onClick={handleSave}
                        disabled={isSaving || isLoading}
                        className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 flex items-center gap-2"
                    // Using style to ensure primary color is respected even if context hasn't updated 
                    // though context update is fast usually.
                    >
                        {isSaving ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
                        Save Changes
                    </button>
                </div>
            </div>

            {/* Tabs */}
            <div className="flex gap-4 mb-8 border-b border-gray-200">
                <button
                    onClick={() => setActiveTab('admin')}
                    className={`pb-4 px-4 flex items-center gap-2 font-medium transition-colors relative ${activeTab === 'admin' ? 'text-primary' : 'text-gray-500 hover:text-gray-700'
                        }`}
                >
                    <Monitor size={20} />
                    Admin Application
                    {activeTab === 'admin' && (
                        <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" />
                    )}
                </button>
                <button
                    onClick={() => setActiveTab('customer')}
                    className={`pb-4 px-4 flex items-center gap-2 font-medium transition-colors relative ${activeTab === 'customer' ? 'text-primary' : 'text-gray-500 hover:text-gray-700'
                        }`}
                >
                    <Smartphone size={20} />
                    Customer Application
                    {activeTab === 'customer' && (
                        <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" />
                    )}
                </button>
            </div>

            {isLoading ? (
                <div className="flex items-center justify-center h-64">
                    <Loader2 className="animate-spin text-gray-400" size={32} />
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Color Form */}
                    <div className="space-y-6 bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
                        <div className="flex items-center gap-2 mb-4">
                            <Palette className="text-gray-400" size={20} />
                            <h2 className="text-lg font-semibold text-gray-800">Color Palette</h2>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Primary Color</label>
                                <div className="flex items-center gap-3">
                                    <input
                                        type="color"
                                        value={currentColors.primary}
                                        onChange={(e) => handleColorChange('primary', e.target.value)}
                                        className="h-10 w-20 rounded cursor-pointer"
                                    />
                                    <input
                                        type="text"
                                        value={currentColors.primary}
                                        onChange={(e) => handleColorChange('primary', e.target.value)}
                                        className="flex-1 p-2 border border-gray-300 rounded-md uppercase font-mono text-sm"
                                    />
                                </div>
                                <p className="text-xs text-gray-500 mt-1">Main brand color, used for buttons, links, and active states.</p>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Secondary Color</label>
                                <div className="flex items-center gap-3">
                                    <input
                                        type="color"
                                        value={currentColors.secondary}
                                        onChange={(e) => handleColorChange('secondary', e.target.value)}
                                        className="h-10 w-20 rounded cursor-pointer"
                                    />
                                    <input
                                        type="text"
                                        value={currentColors.secondary}
                                        onChange={(e) => handleColorChange('secondary', e.target.value)}
                                        className="flex-1 p-2 border border-gray-300 rounded-md uppercase font-mono text-sm"
                                    />
                                </div>
                                <p className="text-xs text-gray-500 mt-1">Used for secondary actions, accents, and supportive elements.</p>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Accent Color</label>
                                <div className="flex items-center gap-3">
                                    <input
                                        type="color"
                                        value={currentColors.accent}
                                        onChange={(e) => handleColorChange('accent', e.target.value)}
                                        className="h-10 w-20 rounded cursor-pointer"
                                    />
                                    <input
                                        type="text"
                                        value={currentColors.accent}
                                        onChange={(e) => handleColorChange('accent', e.target.value)}
                                        className="flex-1 p-2 border border-gray-300 rounded-md uppercase font-mono text-sm"
                                    />
                                </div>
                                <p className="text-xs text-gray-500 mt-1">Used for highlights, borders, and subtle interactive elements.</p>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Background Color</label>
                                <div className="flex items-center gap-3">
                                    <input
                                        type="color"
                                        value={currentColors.background}
                                        onChange={(e) => handleColorChange('background', e.target.value)}
                                        className="h-10 w-20 rounded cursor-pointer"
                                    />
                                    <input
                                        type="text"
                                        value={currentColors.background}
                                        onChange={(e) => handleColorChange('background', e.target.value)}
                                        className="flex-1 p-2 border border-gray-300 rounded-md uppercase font-mono text-sm"
                                    />
                                </div>
                                <p className="text-xs text-gray-500 mt-1">Main application background color.</p>
                            </div>
                        </div>
                    </div>

                    {/* Live Preview (Mockup) */}
                    <div className="space-y-6">
                        <div className="flex items-center gap-2 mb-4">
                            <Monitor className="text-gray-400" size={20} />
                            <h2 className="text-lg font-semibold text-gray-800">Live Preview</h2>
                        </div>

                        <div
                            className="border border-gray-200 rounded-xl overflow-hidden shadow-lg"
                            style={{ backgroundColor: currentColors.background }}
                        >
                            {/* Mock Header */}
                            <div className="h-12 border-b border-gray-100 flex items-center px-4 justify-between bg-white/50 backdrop-blur-sm">
                                <div className="w-24 h-4 rounded bg-gray-200" style={{ backgroundColor: currentColors.primary, opacity: 0.2 }}></div>
                                <div className="flex gap-2">
                                    <div className="w-8 h-8 rounded-full bg-gray-100"></div>
                                </div>
                            </div>

                            {/* Mock Content */}
                            <div className="p-6 space-y-4">
                                <div className="h-32 rounded-lg p-4 text-white" style={{ backgroundColor: currentColors.primary }}>
                                    <div className="font-bold text-lg mb-2">Primary Banner</div>
                                    <div className="text-sm opacity-90">This demonstrates the primary brand color.</div>
                                    <div className="mt-4 px-3 py-1.5 rounded bg-white/20 inline-block text-xs">Action Button</div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="h-24 rounded-lg border border-gray-100 p-3 bg-white">
                                        <div className="w-8 h-8 rounded-full mb-2 flex items-center justify-center" style={{ backgroundColor: `${currentColors.secondary}20`, color: currentColors.secondary }}>★</div>
                                        <div className="h-2 w-16 bg-gray-100 rounded mb-1"></div>
                                        <div className="h-2 w-12 bg-gray-100 rounded"></div>
                                    </div>
                                    <div className="h-24 rounded-lg border border-gray-100 p-3 bg-white">
                                        <div className="w-8 h-8 rounded-full mb-2 flex items-center justify-center" style={{ backgroundColor: `${currentColors.accent}20`, color: currentColors.accent }}>◉</div>
                                        <div className="h-2 w-16 bg-gray-100 rounded mb-1"></div>
                                        <div className="h-2 w-12 bg-gray-100 rounded"></div>
                                    </div>
                                </div>

                                <div className="flex justify-end mt-4">
                                    <button
                                        className="px-4 py-2 rounded text-white text-sm"
                                        style={{ backgroundColor: currentColors.secondary }}
                                    >
                                        Secondary Action
                                    </button>
                                </div>
                            </div>
                        </div>
                        <p className="text-center text-xs text-gray-400">
                            Representation of how colors will apply. Actual UI depends on component usage.
                        </p>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ThemeSettings;
