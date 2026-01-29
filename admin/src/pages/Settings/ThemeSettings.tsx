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
        <div className="p-6 space-y-6">
            {/* Premium Hero Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-white p-8 rounded-[2.5rem] border border-primary/5 shadow-sm relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full -mr-32 -mt-32 blur-3xl group-hover:bg-primary/10 transition-colors duration-1000" />
                <div className="relative z-10 flex items-center gap-6">
                    <div className="w-16 h-16 rounded-[1.5rem] bg-primary flex items-center justify-center text-white shadow-xl shadow-primary/20">
                        <Palette size={32} />
                    </div>
                    <div>
                        <h1 className="text-3xl font-black text-primary tracking-tight uppercase font-mono">Theme Settings</h1>
                        <p className="text-sm text-gray-500 font-medium">Manage appearance for Admin and Customer applications</p>
                    </div>
                </div>
                <div className="flex items-center gap-3 relative z-10">
                    <button
                        onClick={handleReset}
                        disabled={isSaving || isLoading}
                        className="px-6 py-4 rounded-[2rem] bg-gray-50 border-2 border-gray-100 text-gray-500 hover:bg-gray-100 transition-all font-black uppercase text-[10px] tracking-widest flex items-center gap-2 shadow-xl shadow-gray-100/50 h-16"
                    >
                        <RotateCcw size={16} />
                        Reset
                    </button>
                    <button
                        onClick={handleSave}
                        disabled={isSaving || isLoading}
                        className="px-8 py-4 rounded-[2rem] bg-primary text-white hover:bg-primary/90 transition-all font-black uppercase text-[10px] tracking-widest flex items-center gap-2 shadow-xl shadow-primary/30 h-16"
                    >
                        {isSaving ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
                        Save Changes
                    </button>
                </div>
            </div>

            {/* Tabs */}
            <div className="flex gap-4">
                <button
                    onClick={() => setActiveTab('admin')}
                    className={`flex-1 flex items-center justify-center gap-3 py-6 rounded-[2rem] font-black uppercase text-xs tracking-widest transition-all ${activeTab === 'admin'
                        ? 'bg-white text-primary shadow-xl shadow-gray-100/50 border-2 border-primary/5'
                        : 'bg-transparent text-gray-400 hover:bg-white/50 border-2 border-transparent'
                        }`}
                >
                    <Monitor size={20} />
                    Admin Application
                </button>
                <button
                    onClick={() => setActiveTab('customer')}
                    className={`flex-1 flex items-center justify-center gap-3 py-6 rounded-[2rem] font-black uppercase text-xs tracking-widest transition-all ${activeTab === 'customer'
                        ? 'bg-white text-primary shadow-xl shadow-gray-100/50 border-2 border-primary/5'
                        : 'bg-transparent text-gray-400 hover:bg-white/50 border-2 border-transparent'
                        }`}
                >
                    <Smartphone size={20} />
                    Customer Application
                </button>
            </div>

            {isLoading ? (
                <div className="flex items-center justify-center h-64">
                    <Loader2 className="animate-spin text-gray-400" size={32} />
                </div>
            ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Color Form */}
                        <div className="space-y-6 bg-white p-8 rounded-[2rem] border border-primary/5 shadow-sm">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="w-10 h-10 rounded-xl bg-primary/5 flex items-center justify-center text-primary">
                                    <Palette size={20} />
                                </div>
                                <h2 className="text-lg font-black text-gray-900 uppercase tracking-tight">Color Palette</h2>
                            </div>

                            <div className="space-y-6">
                                {[
                                    { key: 'primary', label: 'Primary Color', desc: 'Main brand color, used for buttons, links, and active states.' },
                                    { key: 'secondary', label: 'Secondary Color', desc: 'Used for secondary actions, accents, and supportive elements.' },
                                    { key: 'accent', label: 'Accent Color', desc: 'Used for highlights, borders, and subtle interactive elements.' },
                                    { key: 'background', label: 'Background Color', desc: 'Main application background color.' }
                                ].map((color) => (
                                    <div key={color.key}>
                                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">{color.label}</label>
                                        <div className="flex items-center gap-4">
                                            <div className="relative group">
                                                <div
                                                    className="w-14 h-14 rounded-2xl border-4 border-white shadow-lg transition-transform group-hover:scale-105"
                                                    style={{ backgroundColor: currentColors[color.key as keyof ThemeColors] }}
                                                />
                                                <input
                                                    type="color"
                                                    value={currentColors[color.key as keyof ThemeColors]}
                                                    onChange={(e) => handleColorChange(color.key as keyof ThemeColors, e.target.value)}
                                                    className="absolute inset-0 opacity-0 cursor-pointer w-full h-full z-10"
                                                />
                                            </div>
                                            <div className="flex-1">
                                                <input
                                                    type="text"
                                                    value={currentColors[color.key as keyof ThemeColors]}
                                                    onChange={(e) => handleColorChange(color.key as keyof ThemeColors, e.target.value)}
                                                    className="w-full bg-gray-50 border-2 border-gray-100 rounded-xl py-3 px-4 font-mono text-sm uppercase focus:outline-none focus:border-primary/20 transition-all"
                                                />
                                            </div>
                                        </div>
                                        <p className="text-[10px] font-medium text-gray-400 mt-2">{color.desc}</p>
                                </div>
                                ))}
                        </div>
                    </div>

                    {/* Live Preview (Mockup) */}
                    <div className="space-y-6">
                            <div className="bg-white p-8 rounded-[2rem] border border-primary/5 shadow-sm h-full">
                                <div className="flex items-center gap-3 mb-6">
                                    <div className="w-10 h-10 rounded-xl bg-primary/5 flex items-center justify-center text-primary">
                                        <Monitor size={20} />
                                    </div>
                                    <h2 className="text-lg font-black text-gray-900 uppercase tracking-tight">Live Preview</h2>
                                </div>

                                <div
                                    className="border-4 border-gray-100 rounded-[2rem] overflow-hidden shadow-2xl"
                                    style={{ backgroundColor: currentColors.background }}
                                >
                                    {/* Mock Header */}
                                    <div className="h-16 border-b border-gray-100/50 flex items-center px-6 justify-between bg-white/80 backdrop-blur-md sticky top-0 z-10">
                                        <div className="w-32 h-6 rounded-lg bg-gray-200" style={{ backgroundColor: currentColors.primary, opacity: 0.2 }}></div>
                                        <div className="flex gap-3">
                                            <div className="w-10 h-10 rounded-full bg-gray-100"></div>
                                        </div>
                                    </div>

                                    {/* Mock Content */}
                                    <div className="p-8 space-y-6">
                                        <div className="h-40 rounded-3xl p-6 text-white shadow-lg relative overflow-hidden" style={{ backgroundColor: currentColors.primary }}>
                                            <div className="relative z-10">
                                                <div className="font-bold text-2xl mb-2">Primary Banner</div>
                                                <div className="text-sm opacity-90 font-medium">This demonstrates the primary brand color.</div>
                                                <div className="mt-6 px-4 py-2 rounded-xl bg-white/20 inline-block text-xs font-bold uppercase tracking-wider backdrop-blur-sm">Action Button</div>
                                            </div>
                                            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 blur-2xl" />
                                        </div>

                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="h-32 rounded-3xl border border-gray-100 p-5 bg-white shadow-sm flex flex-col justify-between">
                                                <div className="w-12 h-12 rounded-2xl mb-2 flex items-center justify-center text-xl shadow-inner" style={{ backgroundColor: `${currentColors.secondary}20`, color: currentColors.secondary }}>★</div>
                                                <div>
                                                    <div className="h-2 w-16 bg-gray-100 rounded-full mb-2"></div>
                                                    <div className="h-2 w-10 bg-gray-100 rounded-full"></div>
                                                </div>
                                            </div>
                                            <div className="h-32 rounded-3xl border border-gray-100 p-5 bg-white shadow-sm flex flex-col justify-between">
                                                <div className="w-12 h-12 rounded-2xl mb-2 flex items-center justify-center text-xl shadow-inner" style={{ backgroundColor: `${currentColors.accent}20`, color: currentColors.accent }}>◉</div>
                                                <div>
                                                    <div className="h-2 w-16 bg-gray-100 rounded-full mb-2"></div>
                                                    <div className="h-2 w-10 bg-gray-100 rounded-full"></div>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex justify-end mt-4">
                                            <button
                                                className="px-6 py-3 rounded-xl text-white text-xs font-bold uppercase tracking-widest shadow-lg"
                                                style={{ backgroundColor: currentColors.secondary }}
                                            >
                                                Secondary Action
                                            </button>
                                        </div>
                                    </div>
                                </div>
                                <p className="text-center text-[10px] font-bold text-gray-400 mt-6 uppercase tracking-widest">
                                    Representation of how colors will apply
                                </p>
                            </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ThemeSettings;
