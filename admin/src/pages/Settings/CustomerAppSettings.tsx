import React, { useEffect, useState } from 'react';
import { customerAppSettingsService } from '../../services/customerAppSettings.service';
import type { CustomerAppSettings, HomePageSection, FeatureCard, FooterColumn, SocialLink } from '../../types/customerAppSettings.types';
import { toast } from 'react-hot-toast';
import { Save, RotateCcw, Loader2, Layout, Star, FileText, Palette, Plus, Trash2, GripVertical, Eye, EyeOff, Image as ImageIcon } from 'lucide-react';

type TabType = 'layout' | 'features' | 'footer' | 'branding';

const CustomerAppSettings: React.FC = () => {
    const [activeTab, setActiveTab] = useState<TabType>('layout');
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [settings, setSettings] = useState<CustomerAppSettings | null>(null);
    const [originalSettings, setOriginalSettings] = useState<CustomerAppSettings | null>(null);

    useEffect(() => {
        fetchSettings();
    }, []);

    const fetchSettings = async () => {
        setIsLoading(true);
        try {
            const data = await customerAppSettingsService.getActiveSettings();
            if (data) {
                setSettings(data);
                setOriginalSettings(JSON.parse(JSON.stringify(data)));
            }
        } catch (error) {
            console.error('Error fetching settings:', error);
            toast.error('Failed to load settings');
        } finally {
            setIsLoading(false);
        }
    };

    const handleSave = async () => {
        if (!settings) return;

        setIsSaving(true);
        try {
            await customerAppSettingsService.updateSettings(settings);
            toast.success('Settings updated successfully');
            setOriginalSettings(JSON.parse(JSON.stringify(settings)));
        } catch (error) {
            console.error('Error saving settings:', error);
            toast.error('Failed to save settings');
        } finally {
            setIsSaving(false);
        }
    };

    const handleReset = () => {
        if (confirm('Are you sure you want to reset changes? Unsaved changes will be lost.')) {
            if (originalSettings) {
                setSettings(JSON.parse(JSON.stringify(originalSettings)));
            }
        }
    };

    const updateSection = (index: number, updates: Partial<HomePageSection>) => {
        if (!settings) return;
        const newSections = [...settings.sections];
        newSections[index] = { ...newSections[index], ...updates };
        setSettings({ ...settings, sections: newSections });
    };

    const moveSectionUp = (index: number) => {
        if (!settings || index === 0) return;
        const newSections = [...settings.sections];
        [newSections[index - 1], newSections[index]] = [newSections[index], newSections[index - 1]];
        // Update display orders
        newSections.forEach((section, idx) => {
            section.displayOrder = idx + 1;
        });
        setSettings({ ...settings, sections: newSections });
    };

    const moveSectionDown = (index: number) => {
        if (!settings || index === settings.sections.length - 1) return;
        const newSections = [...settings.sections];
        [newSections[index], newSections[index + 1]] = [newSections[index + 1], newSections[index]];
        // Update display orders
        newSections.forEach((section, idx) => {
            section.displayOrder = idx + 1;
        });
        setSettings({ ...settings, sections: newSections });
    };

    const addFeature = () => {
        if (!settings) return;
        const newFeature: FeatureCard = {
            icon: 'Star',
            title: 'New Feature',
            description: 'Feature description',
            isActive: true,
            displayOrder: settings.features.length + 1,
        };
        setSettings({ ...settings, features: [...settings.features, newFeature] });
    };

    const updateFeature = (index: number, updates: Partial<FeatureCard>) => {
        if (!settings) return;
        const newFeatures = [...settings.features];
        newFeatures[index] = { ...newFeatures[index], ...updates };
        setSettings({ ...settings, features: newFeatures });
    };

    const deleteFeature = (index: number) => {
        if (!settings) return;
        const newFeatures = settings.features.filter((_, idx) => idx !== index);
        // Update display orders
        newFeatures.forEach((feature, idx) => {
            feature.displayOrder = idx + 1;
        });
        setSettings({ ...settings, features: newFeatures });
    };

    const addFooterColumn = () => {
        if (!settings) return;
        const newColumn: FooterColumn = {
            title: 'New Column',
            links: [],
            displayOrder: settings.footer.columns.length + 1,
        };
        setSettings({
            ...settings,
            footer: {
                ...settings.footer,
                columns: [...settings.footer.columns, newColumn],
            },
        });
    };

    const updateFooterColumn = (index: number, updates: Partial<FooterColumn>) => {
        if (!settings) return;
        const newColumns = [...settings.footer.columns];
        newColumns[index] = { ...newColumns[index], ...updates };
        setSettings({
            ...settings,
            footer: { ...settings.footer, columns: newColumns },
        });
    };

    const deleteFooterColumn = (index: number) => {
        if (!settings) return;
        const newColumns = settings.footer.columns.filter((_, idx) => idx !== index);
        setSettings({
            ...settings,
            footer: { ...settings.footer, columns: newColumns },
        });
    };

    const addSocialLink = () => {
        if (!settings) return;
        const newLink: SocialLink = {
            platform: 'New Platform',
            url: '#',
            isActive: true,
        };
        setSettings({
            ...settings,
            footer: {
                ...settings.footer,
                socialLinks: [...settings.footer.socialLinks, newLink],
            },
        });
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-screen">
                <Loader2 className="animate-spin text-primary" size={48} />
            </div>
        );
    }

    if (!settings) {
        return (
            <div className="p-6">
                <div className="text-center">
                    <p className="text-gray-500">No settings found. Please create default settings.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="p-6 space-y-6">
            {/* Premium Hero Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-white p-8 rounded-[2.5rem] border border-primary/5 shadow-sm relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full -mr-32 -mt-32 blur-3xl group-hover:bg-primary/10 transition-colors duration-1000" />
                <div className="relative z-10 flex items-center gap-6">
                    <div className="w-16 h-16 rounded-[1.5rem] bg-primary flex items-center justify-center text-white shadow-xl shadow-primary/20">
                        <Layout size={32} />
                    </div>
                    <div>
                        <h1 className="text-3xl font-black text-primary tracking-tight uppercase font-mono">App Settings</h1>
                        <p className="text-sm text-gray-500 font-medium">Manage home page layout, features, and branding</p>
                    </div>
                </div>
                <div className="flex items-center gap-3 relative z-10">
                    <button
                        onClick={handleReset}
                        disabled={isSaving}
                        className="px-6 py-4 rounded-[2rem] bg-gray-50 border-2 border-gray-100 text-gray-500 hover:bg-gray-100 transition-all font-black uppercase text-[10px] tracking-widest flex items-center gap-2 shadow-xl shadow-gray-100/50 h-16"
                    >
                        <RotateCcw size={16} />
                        Reset
                    </button>
                    <button
                        onClick={handleSave}
                        disabled={isSaving}
                        className="px-8 py-4 rounded-[2rem] bg-primary text-white hover:bg-primary/90 transition-all font-black uppercase text-[10px] tracking-widest flex items-center gap-2 shadow-xl shadow-primary/30 h-16"
                    >
                        {isSaving ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
                        Save Changes
                    </button>
                </div>
            </div>

            {/* Tabs */}
            <div className="flex gap-4 overflow-x-auto pb-2">
                {[
                    { id: 'layout' as TabType, label: 'Home Layout', icon: Layout },
                    { id: 'features' as TabType, label: 'Features', icon: Star },
                    { id: 'footer' as TabType, label: 'Footer', icon: FileText },
                    { id: 'branding' as TabType, label: 'Branding', icon: Palette },
                ].map((tab) => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`flex-1 min-w-[140px] flex items-center justify-center gap-3 py-6 rounded-[2rem] font-black uppercase text-xs tracking-widest transition-all ${activeTab === tab.id
                            ? 'bg-white text-primary shadow-xl shadow-gray-100/50 border-2 border-primary/5'
                            : 'bg-transparent text-gray-400 hover:bg-white/50 border-2 border-transparent'
                            }`}
                    >
                        <tab.icon size={20} />
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* Tab Content */}
            <div className="bg-white rounded-[2rem] border border-primary/5 shadow-sm p-8">
                {/* Home Page Layout Tab */}
                {activeTab === 'layout' && (
                    <div className="space-y-6">
                        <div className="flex items-center gap-3 mb-2">
                            <div className="w-10 h-10 rounded-xl bg-primary/5 flex items-center justify-center text-primary">
                                <Layout size={20} />
                            </div>
                            <h2 className="text-lg font-black text-gray-900 uppercase tracking-tight">Home Page Sections</h2>
                        </div>
                        <div className="grid gap-4">
                            {settings.sections.map((section, index) => (
                                <div
                                    key={section.sectionId}
                                    className="border border-gray-100 rounded-2xl p-6 hover:border-primary/20 hover:shadow-lg transition-all bg-gray-50/30"
                                >
                                    <div className="flex items-start gap-6">
                                        <div className="flex flex-col gap-2 pt-2">
                                            <button
                                                onClick={() => moveSectionUp(index)}
                                                disabled={index === 0}
                                                className="p-2 hover:bg-gray-100 rounded-xl disabled:opacity-30 text-gray-400 hover:text-primary transition-colors"
                                            >
                                                <GripVertical size={16} className="rotate-180" />
                                            </button>
                                            <button
                                                onClick={() => moveSectionDown(index)}
                                                disabled={index === settings.sections.length - 1}
                                                className="p-2 hover:bg-gray-100 rounded-xl disabled:opacity-30 text-gray-400 hover:text-primary transition-colors"
                                            >
                                                <GripVertical size={16} />
                                            </button>
                                        </div>
                                        <div className="flex-1 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                            <div className="md:col-span-2 lg:col-span-1">
                                                <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">
                                                    Section ID
                                                </label>
                                                <input
                                                    type="text"
                                                    value={section.sectionId}
                                                    disabled
                                                    className="w-full p-3 border border-gray-200 rounded-xl bg-gray-100/50 text-gray-500 font-mono text-sm"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">
                                                    Title
                                                </label>
                                                <input
                                                    type="text"
                                                    value={section.title || ''}
                                                    onChange={(e) => updateSection(index, { title: e.target.value })}
                                                    className="w-full p-3 border border-gray-200 rounded-xl focus:border-primary focus:ring-4 focus:ring-primary/5 transition-all outline-none"
                                                    placeholder="Display Title"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">
                                                    Subtitle
                                                </label>
                                                <input
                                                    type="text"
                                                    value={section.subtitle || ''}
                                                    onChange={(e) => updateSection(index, { subtitle: e.target.value })}
                                                    className="w-full p-3 border border-gray-200 rounded-xl focus:border-primary focus:ring-4 focus:ring-primary/5 transition-all outline-none"
                                                    placeholder="Display Subtitle"
                                                />
                                            </div>
                                            <div className="hidden lg:block lg:col-span-3 h-px bg-gray-100 my-1" />
                                            <div>
                                                <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">
                                                    View All Link
                                                </label>
                                                <input
                                                    type="text"
                                                    value={section.viewAllLink || ''}
                                                    onChange={(e) => updateSection(index, { viewAllLink: e.target.value })}
                                                    className="w-full p-3 border border-gray-200 rounded-xl focus:border-primary focus:ring-4 focus:ring-primary/5 transition-all outline-none"
                                                    placeholder="/products"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">
                                                    Link Text
                                                </label>
                                                <input
                                                    type="text"
                                                    value={section.viewAllText || ''}
                                                    onChange={(e) => updateSection(index, { viewAllText: e.target.value })}
                                                    className="w-full p-3 border border-gray-200 rounded-xl focus:border-primary focus:ring-4 focus:ring-primary/5 transition-all outline-none"
                                                    placeholder="View All"
                                                />
                                            </div>
                                            <div className="flex items-center gap-4">
                                                <div className="flex-1">
                                                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">
                                                        Limit
                                                    </label>
                                                    <input
                                                        type="number"
                                                        value={section.limit || ''}
                                                        onChange={(e) => updateSection(index, { limit: parseInt(e.target.value) || undefined })}
                                                        className="w-full p-3 border border-gray-200 rounded-xl focus:border-primary focus:ring-4 focus:ring-primary/5 transition-all outline-none"
                                                        placeholder="8"
                                                    />
                                                </div>
                                                <div className="flex flex-col items-center pt-6">
                                                    <button
                                                        onClick={() => updateSection(index, { isVisible: !section.isVisible })}
                                                        className={`p-3 rounded-xl transition-all ${section.isVisible
                                                            ? 'bg-emerald-100 text-emerald-600 shadow-lg shadow-emerald-100/50'
                                                            : 'bg-gray-100 text-gray-400'
                                                            }`}
                                                        title={section.isVisible ? "Visible" : "Hidden"}
                                                    >
                                                        {section.isVisible ? <Eye size={20} /> : <EyeOff size={20} />}
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Feature Cards Tab */}
                {activeTab === 'features' && (
                    <div className="space-y-6">
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-primary/5 flex items-center justify-center text-primary">
                                    <Star size={20} />
                                </div>
                                <h2 className="text-lg font-black text-gray-900 uppercase tracking-tight">Feature Cards</h2>
                            </div>
                            <button
                                onClick={addFeature}
                                className="px-6 py-3 bg-white border-2 border-primary/10 text-primary rounded-[1.5rem] hover:bg-primary/5 flex items-center gap-2 font-bold uppercase text-xs tracking-widest transition-all shadow-sm"
                            >
                                <Plus size={16} />
                                Add Feature
                            </button>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {settings.features.map((feature, index) => (
                                <div
                                    key={index}
                                    className="border border-gray-100 rounded-2xl p-6 hover:border-primary/20 hover:shadow-xl transition-all bg-gray-50/30 group"
                                >
                                    <div className="space-y-4">
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 rounded-2xl bg-white border border-gray-100 flex items-center justify-center text-primary shadow-sm">
                                                <Star size={24} />
                                            </div>
                                            <div className="flex-1">
                                                <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-1">Icon (Lucide)</label>
                                                <input
                                                    type="text"
                                                    value={feature.icon}
                                                    onChange={(e) => updateFeature(index, { icon: e.target.value })}
                                                    className="w-full p-2 bg-transparent border-b-2 border-gray-200 focus:border-primary outline-none transition-colors font-medium"
                                                    placeholder="Truck"
                                                />
                                            </div>
                                        </div>

                                        <div>
                                            <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-1">Title</label>
                                            <input
                                                type="text"
                                                value={feature.title}
                                                onChange={(e) => updateFeature(index, { title: e.target.value })}
                                                className="w-full p-2 bg-transparent border-b-2 border-gray-200 focus:border-primary outline-none transition-colors font-bold text-lg"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-1">Description</label>
                                            <textarea
                                                value={feature.description}
                                                onChange={(e) => updateFeature(index, { description: e.target.value })}
                                                className="w-full p-3 bg-white border border-gray-200 rounded-xl focus:border-primary focus:ring-4 focus:ring-primary/5 outline-none transition-all resize-none text-sm text-gray-600"
                                                rows={2}
                                            />
                                        </div>

                                        <div className="flex items-center justify-between pt-2">
                                            <label className="flex items-center gap-2 cursor-pointer select-none">
                                                <div className={`w-10 h-6 rounded-full p-1 transition-colors ${feature.isActive ? 'bg-primary' : 'bg-gray-200'}`}>
                                                    <div className={`w-4 h-4 rounded-full bg-white shadow-sm transition-transform ${feature.isActive ? 'translate-x-4' : 'translate-x-0'}`} />
                                                </div>
                                                <input
                                                    type="checkbox"
                                                    checked={feature.isActive}
                                                    onChange={(e) => updateFeature(index, { isActive: e.target.checked })}
                                                    className="hidden"
                                                />
                                                <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Active</span>
                                            </label>
                                            <button
                                                onClick={() => deleteFeature(index)}
                                                className="p-2 text-gray-400 hover:text-rose-500 hover:bg-rose-50 rounded-xl transition-all opacity-0 group-hover:opacity-100"
                                            >
                                                <Trash2 size={18} />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Footer Management Tab */}
                {activeTab === 'footer' && (
                    <div className="space-y-10">
                        {/* Brand Section */}
                        <div className="space-y-6">
                            <div className="flex items-center gap-3 border-b border-gray-100 pb-4">
                                <div className="w-10 h-10 rounded-xl bg-primary/5 flex items-center justify-center text-primary">
                                    <FileText size={20} />
                                </div>
                                <h3 className="text-lg font-black text-gray-900 uppercase tracking-tight">Brand Information</h3>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">Brand Name</label>
                                    <input
                                        type="text"
                                        value={settings.footer.brand.name}
                                        onChange={(e) =>
                                            setSettings({
                                                ...settings,
                                                footer: {
                                                    ...settings.footer,
                                                    brand: { ...settings.footer.brand, name: e.target.value },
                                                },
                                            })
                                        }
                                        className="w-full p-3 border border-gray-200 rounded-xl focus:border-primary focus:ring-4 focus:ring-primary/5 transition-all outline-none"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">Tagline</label>
                                    <input
                                        type="text"
                                        value={settings.footer.brand.tagline}
                                        onChange={(e) =>
                                            setSettings({
                                                ...settings,
                                                footer: {
                                                    ...settings.footer,
                                                    brand: { ...settings.footer.brand, tagline: e.target.value },
                                                },
                                            })
                                        }
                                        className="w-full p-3 border border-gray-200 rounded-xl focus:border-primary focus:ring-4 focus:ring-primary/5 transition-all outline-none"
                                    />
                                </div>
                                <div className="col-span-1 md:col-span-2">
                                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">Description</label>
                                    <textarea
                                        value={settings.footer.brand.description}
                                        onChange={(e) =>
                                            setSettings({
                                                ...settings,
                                                footer: {
                                                    ...settings.footer,
                                                    brand: { ...settings.footer.brand, description: e.target.value },
                                                },
                                            })
                                        }
                                        className="w-full p-3 border border-gray-200 rounded-xl focus:border-primary focus:ring-4 focus:ring-primary/5 transition-all outline-none resize-none"
                                        rows={2}
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Contact Information */}
                        <div className="space-y-6">
                            <h3 className="text-lg font-black text-gray-900 uppercase tracking-tight border-b border-gray-100 pb-4">Contact Information</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">Address</label>
                                    <input
                                        type="text"
                                        value={settings.footer.contact.address}
                                        onChange={(e) =>
                                            setSettings({
                                                ...settings,
                                                footer: {
                                                    ...settings.footer,
                                                    contact: { ...settings.footer.contact, address: e.target.value },
                                                },
                                            })
                                        }
                                        className="w-full p-3 border border-gray-200 rounded-xl focus:border-primary focus:ring-4 focus:ring-primary/5 transition-all outline-none"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">Phone</label>
                                    <input
                                        type="text"
                                        value={settings.footer.contact.phone}
                                        onChange={(e) =>
                                            setSettings({
                                                ...settings,
                                                footer: {
                                                    ...settings.footer,
                                                    contact: { ...settings.footer.contact, phone: e.target.value },
                                                },
                                            })
                                        }
                                        className="w-full p-3 border border-gray-200 rounded-xl focus:border-primary focus:ring-4 focus:ring-primary/5 transition-all outline-none"
                                    />
                                </div>
                                <div className="col-span-1 md:col-span-2">
                                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">Email</label>
                                    <input
                                        type="email"
                                        value={settings.footer.contact.email}
                                        onChange={(e) =>
                                            setSettings({
                                                ...settings,
                                                footer: {
                                                    ...settings.footer,
                                                    contact: { ...settings.footer.contact, email: e.target.value },
                                                },
                                            })
                                        }
                                        className="w-full p-3 border border-gray-200 rounded-xl focus:border-primary focus:ring-4 focus:ring-primary/5 transition-all outline-none"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Social Links */}
                        <div className="space-y-6">
                            <div className="flex items-center justify-between border-b border-gray-100 pb-4">
                                <h3 className="text-lg font-black text-gray-900 uppercase tracking-tight">Social Links</h3>
                                <button
                                    onClick={addSocialLink}
                                    className="px-4 py-2 bg-white border-2 border-primary/10 text-primary rounded-[1rem] hover:bg-primary/5 flex items-center gap-2 font-bold uppercase text-xs tracking-widest transition-all"
                                >
                                    <Plus size={16} />
                                    Add Link
                                </button>
                            </div>
                            <div className="grid gap-3">
                                {settings.footer.socialLinks.map((link, index) => (
                                    <div key={index} className="flex gap-4 items-center bg-gray-50/50 p-2 pl-4 rounded-xl border border-gray-100 hover:border-primary/20 transition-colors">
                                        <div className="grid grid-cols-2 gap-4 flex-1">
                                            <input
                                                type="text"
                                                value={link.platform}
                                                onChange={(e) => {
                                                    const newLinks = [...settings.footer.socialLinks];
                                                    newLinks[index].platform = e.target.value;
                                                    setSettings({
                                                        ...settings,
                                                        footer: { ...settings.footer, socialLinks: newLinks },
                                                    });
                                                }}
                                                className="w-full p-2 bg-transparent border-b border-transparent focus:border-primary outline-none transition-all font-medium"
                                                placeholder="Platform Name"
                                            />
                                            <input
                                                type="text"
                                                value={link.url}
                                                onChange={(e) => {
                                                    const newLinks = [...settings.footer.socialLinks];
                                                    newLinks[index].url = e.target.value;
                                                    setSettings({
                                                        ...settings,
                                                        footer: { ...settings.footer, socialLinks: newLinks },
                                                    });
                                                }}
                                                className="w-full p-2 bg-transparent border-b border-transparent focus:border-primary outline-none transition-all text-gray-500 font-mono text-xs"
                                                placeholder="https://..."
                                            />
                                        </div>
                                        <button
                                            onClick={() => {
                                                const newLinks = settings.footer.socialLinks.filter((_, i) => i !== index);
                                                setSettings({
                                                    ...settings,
                                                    footer: { ...settings.footer, socialLinks: newLinks },
                                                });
                                            }}
                                            className="p-3 text-gray-400 hover:text-rose-500 hover:bg-rose-50 rounded-xl transition-all"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Footer Columns */}
                        <div className="space-y-6">
                            <div className="flex items-center justify-between border-b border-gray-100 pb-4">
                                <h3 className="text-lg font-black text-gray-900 uppercase tracking-tight">Navigation Columns</h3>
                                <button
                                    onClick={addFooterColumn}
                                    className="px-4 py-2 bg-white border-2 border-primary/10 text-primary rounded-[1rem] hover:bg-primary/5 flex items-center gap-2 font-bold uppercase text-xs tracking-widest transition-all"
                                >
                                    <Plus size={16} />
                                    Add Column
                                </button>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {settings.footer.columns.map((column, index) => (
                                    <div key={index} className="border border-gray-100 rounded-[1.5rem] p-5 bg-gray-50/30 hover:shadow-lg hover:border-primary/10 transition-all flex flex-col h-full">
                                        <div className="flex items-center justify-between mb-4 pb-4 border-b border-gray-100">
                                            <input
                                                type="text"
                                                value={column.title}
                                                onChange={(e) => updateFooterColumn(index, { title: e.target.value })}
                                                className="bg-transparent font-bold text-gray-900 focus:text-primary outline-none w-full"
                                                placeholder="Column Title"
                                            />
                                            <button
                                                onClick={() => deleteFooterColumn(index)}
                                                className="p-2 text-gray-400 hover:text-rose-500 hover:bg-rose-50 rounded-xl transition-all"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </div>

                                        <div className="space-y-3 flex-1">
                                            {column.links.map((link, linkIndex) => (
                                                <div key={linkIndex} className="flex gap-2 items-center group">
                                                    <div className="w-1.5 h-1.5 rounded-full bg-gray-200 group-hover:bg-primary transition-colors" />
                                                    <div className="flex-1 space-y-1">
                                                        <input
                                                            type="text"
                                                            value={link.label}
                                                            onChange={(e) => {
                                                                const newLinks = [...column.links];
                                                                newLinks[linkIndex].label = e.target.value;
                                                                updateFooterColumn(index, { links: newLinks });
                                                            }}
                                                            className="w-full text-sm bg-transparent border-none outline-none focus:text-primary font-medium"
                                                            placeholder="Link Label"
                                                        />
                                                        <input
                                                            type="text"
                                                            value={link.url}
                                                            onChange={(e) => {
                                                                const newLinks = [...column.links];
                                                                newLinks[linkIndex].url = e.target.value;
                                                                updateFooterColumn(index, { links: newLinks });
                                                            }}
                                                            className="w-full text-[10px] text-gray-400 bg-transparent border-none outline-none font-mono"
                                                            placeholder="URL"
                                                        />
                                                    </div>
                                                    <button
                                                        onClick={() => {
                                                            const newLinks = column.links.filter((_, i) => i !== linkIndex);
                                                            updateFooterColumn(index, { links: newLinks });
                                                        }}
                                                        className="opacity-0 group-hover:opacity-100 p-1 text-rose-400 hover:text-rose-600 transition-all"
                                                    >
                                                        <Trash2 size={12} />
                                                    </button>
                                                </div>
                                            ))}
                                            <button
                                                onClick={() => {
                                                    const newLinks = [...column.links, { label: 'New Link', url: '#', isActive: true }];
                                                    updateFooterColumn(index, { links: newLinks });
                                                }}
                                                className="w-full py-2 border border-dashed border-gray-200 rounded-lg text-xs font-bold text-gray-400 uppercase tracking-widest hover:border-primary hover:text-primary transition-all mt-4"
                                            >
                                                Add Link
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Copyright */}
                        <div className="pt-6 border-t border-gray-100">
                            <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">Copyright Text</label>
                            <input
                                type="text"
                                value={settings.footer.copyright}
                                onChange={(e) =>
                                    setSettings({
                                        ...settings,
                                        footer: { ...settings.footer, copyright: e.target.value },
                                    })
                                }
                                className="w-full p-4 border border-gray-200 rounded-xl focus:border-primary focus:ring-4 focus:ring-primary/5 transition-all outline-none bg-gray-50/50"
                            />
                        </div>
                    </div>
                )}

                {/* Branding Tab */}
                {activeTab === 'branding' && (
                    <div className="space-y-8 max-w-3xl">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="w-10 h-10 rounded-xl bg-primary/5 flex items-center justify-center text-primary">
                                <Palette size={20} />
                            </div>
                            <h2 className="text-lg font-black text-gray-900 uppercase tracking-tight">App Branding</h2>
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">App Name</label>
                            <input
                                type="text"
                                value={settings.appName}
                                onChange={(e) => setSettings({ ...settings, appName: e.target.value })}
                                className="w-full p-4 border border-gray-200 rounded-xl focus:border-primary focus:ring-4 focus:ring-primary/5 transition-all outline-none font-bold text-lg"
                            />
                            <p className="text-xs text-gray-400 mt-2 ml-1">Displayed in browser title bar and SEO tags.</p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="space-y-2">
                                <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">Logo</label>
                                <div className="border-2 border-dashed border-gray-200 rounded-2xl p-6 hover:border-primary/30 transition-colors bg-gray-50/30 text-center">
                                    <input
                                        type="text"
                                        value={settings.logo || ''}
                                        onChange={(e) => setSettings({ ...settings, logo: e.target.value })}
                                        className="w-full p-2 bg-transparent border-b border-gray-200 focus:border-primary outline-none text-center text-sm font-mono mb-4"
                                        placeholder="File Storage ID"
                                    />
                                    <div className="w-32 h-32 bg-gray-100 rounded-xl mx-auto flex items-center justify-center text-gray-300">
                                        <ImageIcon size={32} />
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">Favicon</label>
                                <div className="border-2 border-dashed border-gray-200 rounded-2xl p-6 hover:border-primary/30 transition-colors bg-gray-50/30 text-center">
                                    <input
                                        type="text"
                                        value={settings.favicon || ''}
                                        onChange={(e) => setSettings({ ...settings, favicon: e.target.value })}
                                        className="w-full p-2 bg-transparent border-b border-gray-200 focus:border-primary outline-none text-center text-sm font-mono mb-4"
                                        placeholder="File Storage ID"
                                    />
                                    <div className="w-16 h-16 bg-gray-100 rounded-xl mx-auto flex items-center justify-center text-gray-300">
                                        <ImageIcon size={20} />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default CustomerAppSettings;
