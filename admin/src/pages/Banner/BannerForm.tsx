
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
    ArrowLeft,
    Save,
    Image as ImageIcon,
    Type,
    Link as LinkIcon,
    ArrowUpDown,
    Users,
    Calendar,
    Eye,
    EyeOff
} from 'lucide-react';
import { bannerService } from '../../services/banner.service';
import { BANNER_STATUS, BANNER_LINK_TYPE, BANNER_TARGET_AUDIENCE } from '../../types/banner.types';
import type { Banner } from '../../types/banner.types';
import type { IFileStorage } from '../../types/fileStorage';
import axios from 'axios';
import toast from 'react-hot-toast';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import { FileManagerSelector } from '../../components/common/FileManagerSelector';

const BannerForm: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const isEdit = !!id;

    const [loading, setLoading] = useState(false);
    const [fetching, setFetching] = useState(isEdit);
    const [formData, setFormData] = useState<Partial<Banner>>({
        title: '',
        subtitle: '',
        imageId: '',
        mobileImageId: '',
        linkType: BANNER_LINK_TYPE.NONE,
        linkValue: '',
        displayOrder: 0,
        startDate: new Date().toISOString().split('T')[0],
        endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        isActive: true,
        targetAudience: BANNER_TARGET_AUDIENCE.ALL,
        status: BANNER_STATUS.ACTIVE,
    });

    const [isImageSelectorOpen, setIsImageSelectorOpen] = useState(false);
    const [isMobileImageSelectorOpen, setIsMobileImageSelectorOpen] = useState(false);
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [mobileImagePreview, setMobileImagePreview] = useState<string | null>(null);

    useEffect(() => {
        if (isEdit) {
            const fetchBanner = async () => {
                try {
                    const response = await bannerService.getOne(id);
                    if (response && response.data) {
                        const data = response.data;
                        setFormData({
                            ...data,
                            startDate: data.startDate ? new Date(data.startDate).toISOString().split('T')[0] : '',
                            endDate: data.endDate ? new Date(data.endDate).toISOString().split('T')[0] : '',
                        });

                        if (data.imageId) {
                            setImagePreview(`${(import.meta.env.VITE_API_URL || 'http://localhost:3000/api/v1/admin').replace('/admin', '')}/public/uploads/${data.imageId}`);
                        }
                        if (data.mobileImageId) {
                            setMobileImagePreview(`${(import.meta.env.VITE_API_URL || 'http://localhost:3000/api/v1/admin').replace('/admin', '')}/public/uploads/${data.mobileImageId}`);
                        }
                    }
                } catch (error) {
                    console.error('Error fetching banner:', error);
                    toast.error('Failed to fetch banner details');
                    navigate('/banners');
                } finally {
                    setFetching(false);
                }
            };
            fetchBanner();
        }
    }, [id, isEdit, navigate]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.imageId) {
            toast.error('Desktop Image is required');
            return;
        }

        try {
            setLoading(true);
            const submissionData = { ...formData };

            if (isEdit && id) {
                await bannerService.updateById(id, submissionData);
                toast.success('Banner updated successfully');
            } else {
                await bannerService.create(submissionData);
                toast.success('Banner created successfully');
            }
            navigate('/banners');
        } catch (error: unknown) {
            console.error('Error saving banner:', error);
            const message = axios.isAxiosError(error) ? error.response?.data?.message : 'Failed to save banner';
            toast.error(message || 'Failed to save banner');
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'number' ? parseInt(value) : (type === 'checkbox' ? (e.target as HTMLInputElement).checked : value)
        }));
    };

    const handleImageSelect = (file: IFileStorage, forMobile = false) => {
        if (forMobile) {
            setFormData(prev => ({ ...prev, mobileImageId: file._id }));
            setMobileImagePreview(file.preSignedUrl || `${(import.meta.env.VITE_API_URL || 'http://localhost:3000/api/v1/admin').replace('/admin', '')}/public/uploads/${file._id}`);
            setIsMobileImageSelectorOpen(false);
        } else {
            setFormData(prev => ({ ...prev, imageId: file._id }));
            setImagePreview(file.preSignedUrl || `${(import.meta.env.VITE_API_URL || 'http://localhost:3000/api/v1/admin').replace('/admin', '')}/public/uploads/${file._id}`);
            setIsImageSelectorOpen(false);
        }
    };

    if (fetching) {
        return (
            <div className="p-6 flex flex-col items-center justify-center min-h-[400px] text-gray-500 italic">
                <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin mb-4" />
                Retrieving banner intelligence...
            </div>
        );
    }

    return (
        <div className="p-6 max-w-5xl mx-auto space-y-8">
            {/* Header with Back Button */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-[2rem] border border-primary/5 shadow-sm">
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => navigate('/banners')}
                        className="p-3 text-gray-400 hover:text-primary hover:bg-primary/5 rounded-2xl transition-all border border-transparent hover:border-primary/10"
                    >
                        <ArrowLeft size={24} />
                    </button>
                    <div>
                        <h1 className="text-3xl font-black text-primary tracking-tight uppercase font-mono">{isEdit ? 'Edit Banner' : 'New Visual Assets'}</h1>
                        <p className="text-sm text-gray-500 font-medium">Design and schedule promotional display units</p>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <Button
                        variant="ghost"
                        onClick={() => navigate('/banners')}
                        className="rounded-2xl h-14 px-6 font-black uppercase text-[10px] tracking-widest"
                    >
                        Cancel
                    </Button>
                    <Button
                        onClick={handleSubmit}
                        disabled={loading}
                        className="rounded-2xl shadow-xl shadow-primary/20 h-14 px-8"
                    >
                        <Save size={20} className="mr-2" />
                        <span>{loading ? 'Processing...' : 'Execute / Save'}</span>
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Side: Main Configuration */}
                <div className="lg:col-span-2 space-y-8">
                    <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-xl shadow-gray-200/50 space-y-6">
                        <div className="flex items-center gap-3 pb-4 border-b border-gray-50">
                            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                                <Type size={20} />
                            </div>
                            <h2 className="text-lg font-black text-gray-900 uppercase tracking-tight">Identity</h2>
                        </div>

                        <div className="space-y-3">
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">Banner Title *</label>
                            <Input
                                name="title"
                                value={formData.title}
                                onChange={handleInputChange}
                                placeholder="Summer Collection 2026"
                                required
                                className="font-bold text-lg h-14 bg-gray-50/50 border-2"
                            />
                        </div>

                        <div className="space-y-3">
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">Subtitle / Call to Action</label>
                            <Input
                                name="subtitle"
                                value={formData.subtitle}
                                onChange={handleInputChange}
                                placeholder="Up to 70% off on all items"
                                className="h-14 bg-gray-50/50 border-2 font-medium"
                            />
                        </div>
                    </div>

                    <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-xl shadow-gray-200/50 space-y-6">
                        <div className="flex items-center gap-3 pb-4 border-b border-gray-50">
                            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                                <ImageIcon size={20} />
                            </div>
                            <h2 className="text-lg font-black text-gray-900 uppercase tracking-tight">Visual Assets</h2>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="space-y-4">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">Desktop Hero *</label>
                                <div
                                    onClick={() => setIsImageSelectorOpen(true)}
                                    className="w-full aspect-video rounded-[2rem] bg-gray-50 border-2 border-dashed border-gray-200 flex flex-col items-center justify-center cursor-pointer hover:bg-gray-100 hover:border-primary/20 transition-all overflow-hidden relative group"
                                >
                                    {imagePreview ? (
                                        <>
                                            <img src={imagePreview} alt="Desktop Preview" className="w-full h-full object-cover" />
                                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                                <span className="text-[10px] font-black text-white uppercase tracking-widest">Change Media</span>
                                            </div>
                                        </>
                                    ) : (
                                        <>
                                            <ImageIcon size={32} className="text-gray-300 mb-2" />
                                            <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Select Image</span>
                                        </>
                                    )}
                                </div>
                            </div>

                            <div className="space-y-4">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">Mobile Optimize</label>
                                <div
                                    onClick={() => setIsMobileImageSelectorOpen(true)}
                                    className="w-full aspect-video rounded-[2rem] bg-gray-50 border-2 border-dashed border-gray-200 flex flex-col items-center justify-center cursor-pointer hover:bg-gray-100 hover:border-primary/20 transition-all overflow-hidden relative group"
                                >
                                    {mobileImagePreview ? (
                                        <>
                                            <img src={mobileImagePreview} alt="Mobile Preview" className="w-full h-full object-cover" />
                                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                                <span className="text-[10px] font-black text-white uppercase tracking-widest">Change Media</span>
                                            </div>
                                        </>
                                    ) : (
                                        <>
                                            <ImageIcon size={32} className="text-gray-300 mb-2" />
                                            <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Select Image</span>
                                        </>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-xl shadow-gray-200/50 space-y-6">
                        <div className="flex items-center gap-3 pb-4 border-b border-gray-50">
                            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                                <LinkIcon size={20} />
                            </div>
                            <h2 className="text-lg font-black text-gray-900 uppercase tracking-tight">Interaction & Linkage</h2>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="space-y-3">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">Redirection Type</label>
                                <select
                                    name="linkType"
                                    value={formData.linkType}
                                    onChange={handleInputChange}
                                    className="w-full bg-gray-50/50 border-2 border-gray-100 rounded-2xl h-14 px-4 text-sm font-black uppercase tracking-widest focus:outline-none focus:border-primary/20 transition-all cursor-pointer"
                                >
                                    {Object.values(BANNER_LINK_TYPE).map(t => (
                                        <option key={t} value={t}>{t}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="space-y-3">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">Navigation Key / URL</label>
                                <Input
                                    name="linkValue"
                                    value={formData.linkValue}
                                    onChange={handleInputChange}
                                    placeholder="Product ID, Category Slug or URL..."
                                    className="h-14 bg-gray-50/50 border-2 font-mono text-xs uppercase"
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Side: Constraints & Logic */}
                <div className="space-y-8">
                    <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-xl shadow-gray-200/50 space-y-6">
                        <div className="flex items-center gap-3 pb-4 border-b border-gray-50">
                            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                                <ArrowUpDown size={20} />
                            </div>
                            <h2 className="text-lg font-black text-gray-900 uppercase tracking-tight">Logic & Priority</h2>
                        </div>

                        <div className="space-y-6">
                            <div className="space-y-3">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">Sequence Order</label>
                                <Input
                                    type="number"
                                    name="displayOrder"
                                    value={formData.displayOrder}
                                    onChange={handleInputChange}
                                    min={0}
                                    className="h-14 bg-gray-50/50 border-2 font-black text-lg"
                                />
                            </div>

                            <div className="space-y-3">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">Visibility Status</label>
                                <div className="flex items-center gap-4 bg-gray-50/50 p-4 rounded-2xl border-2 border-gray-100">
                                    <button
                                        type="button"
                                        onClick={() => setFormData(p => ({ ...p, isActive: !p.isActive }))}
                                        className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl transition-all font-black text-[10px] uppercase tracking-widest ${formData.isActive ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20' : 'bg-white text-gray-400'}`}
                                    >
                                        <Eye size={14} /> Visible
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setFormData(p => ({ ...p, isActive: !p.isActive }))}
                                        className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl transition-all font-black text-[10px] uppercase tracking-widest ${!formData.isActive ? 'bg-rose-500 text-white shadow-lg shadow-rose-500/20' : 'bg-white text-gray-400'}`}
                                    >
                                        <EyeOff size={14} /> Hidden
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-xl shadow-gray-200/50 space-y-6">
                        <div className="flex items-center gap-3 pb-4 border-b border-gray-50">
                            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                                <Users size={20} />
                            </div>
                            <h2 className="text-lg font-black text-gray-900 uppercase tracking-tight">Audience</h2>
                        </div>

                        <div className="space-y-3">
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">Target Group</label>
                            <select
                                name="targetAudience"
                                value={formData.targetAudience}
                                onChange={handleInputChange}
                                className="w-full bg-gray-50/50 border-2 border-gray-100 rounded-2xl h-14 px-4 text-sm font-black uppercase tracking-widest focus:outline-none focus:border-primary/20 transition-all cursor-pointer"
                            >
                                {Object.values(BANNER_TARGET_AUDIENCE).map(a => (
                                    <option key={a} value={a}>{a}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-xl shadow-gray-200/50 space-y-6">
                        <div className="flex items-center gap-3 pb-4 border-b border-gray-50">
                            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                                <Calendar size={20} />
                            </div>
                            <h2 className="text-lg font-black text-gray-900 uppercase tracking-tight">Timeline</h2>
                        </div>

                        <div className="space-y-6">
                            <div className="space-y-3">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">Start Date</label>
                                <Input
                                    type="date"
                                    name="startDate"
                                    value={formData.startDate}
                                    onChange={handleInputChange}
                                    className="h-14 bg-gray-50/50 border-2"
                                />
                            </div>
                            <div className="space-y-3">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">End Date</label>
                                <Input
                                    type="date"
                                    name="endDate"
                                    value={formData.endDate}
                                    onChange={handleInputChange}
                                    className="h-14 bg-gray-50/50 border-2"
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Selectors */}
            <FileManagerSelector
                isOpen={isImageSelectorOpen}
                onClose={() => setIsImageSelectorOpen(false)}
                onSelect={(file) => handleImageSelect(file, false)}
                title="Select Desktop Banner Media"
            />
            <FileManagerSelector
                isOpen={isMobileImageSelectorOpen}
                onClose={() => setIsMobileImageSelectorOpen(false)}
                onSelect={(file) => handleImageSelect(file, true)}
                title="Select Mobile Banner Media"
            />
        </div>
    );
};

export default BannerForm;
