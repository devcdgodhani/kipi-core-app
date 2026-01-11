
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
    ArrowLeft,
    Save,
    Bell,
    Type,
    Image as ImageIcon,
    Link as LinkIcon,
    User as UserIcon,
    AlertCircle
} from 'lucide-react';
import { notificationService } from '../../services/notification.service';
import { NOTIFICATION_TYPE, NOTIFICATION_STATUS } from '../../types/notification.types';
import type { Notification } from '../../types/notification.types';
import axios from 'axios';
import toast from 'react-hot-toast';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';

const NotificationForm: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const isEdit = !!id;

    const [loading, setLoading] = useState(false);
    const [fetching, setFetching] = useState(isEdit);
    const [formData, setFormData] = useState<Partial<Notification>>({
        title: '',
        message: '',
        type: NOTIFICATION_TYPE.INFO,
        userId: '',
        imageUrl: '',
        actionUrl: '',
        status: NOTIFICATION_STATUS.ACTIVE,
    });

    useEffect(() => {
        if (isEdit) {
            const fetchNotification = async () => {
                try {
                    const response = await notificationService.getOne(id);
                    if (response && response.data) {
                        setFormData(response.data);
                    }
                } catch (error) {
                    console.error('Error fetching notification:', error);
                    toast.error('Failed to fetch notification details');
                    navigate('/notifications');
                } finally {
                    setFetching(false);
                }
            };
            fetchNotification();
        }
    }, [id, isEdit, navigate]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            setLoading(true);

            // Cleanup empty strings for optional fields
            const submissionData = { ...formData };
            if (!submissionData.userId) delete submissionData.userId;
            if (!submissionData.imageUrl) delete submissionData.imageUrl;
            if (!submissionData.actionUrl) delete submissionData.actionUrl;

            if (isEdit && id) {
                await notificationService.updateById(id, submissionData);
                toast.success('Notification updated successfully');
            } else {
                await notificationService.create(submissionData);
                toast.success('Notification sent successfully');
            }
            navigate('/notifications');
        } catch (error: unknown) {
            console.error('Error saving notification:', error);
            const message = axios.isAxiosError(error) ? error.response?.data?.message : 'Failed to save notification';
            toast.error(message || 'Failed to save notification');
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    if (fetching) {
        return (
            <div className="p-6 flex flex-col items-center justify-center min-h-[400px] text-gray-500 italic">
                <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin mb-4" />
                Retrieving notification data...
            </div>
        );
    }

    return (
        <div className="p-6 max-w-5xl mx-auto space-y-8">
            {/* Header with Back Button */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-[2rem] border border-primary/5 shadow-sm">
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => navigate('/notifications')}
                        className="p-3 text-gray-400 hover:text-primary hover:bg-primary/5 rounded-2xl transition-all border border-transparent hover:border-primary/10"
                    >
                        <ArrowLeft size={24} />
                    </button>
                    <div>
                        <h1 className="text-3xl font-black text-primary tracking-tight uppercase font-mono">{isEdit ? 'Edit Alert' : 'Broadcast Message'}</h1>
                        <p className="text-sm text-gray-500 font-medium">Configure and dispatch system notifications</p>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <Button
                        variant="ghost"
                        onClick={() => navigate('/notifications')}
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
                        <span>{loading ? 'Processing...' : (isEdit ? 'Update Alert' : 'Push / Send')}</span>
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Side: Main Details */}
                <div className="lg:col-span-2 space-y-8">
                    <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-xl shadow-gray-200/50 space-y-6">
                        <div className="flex items-center gap-3 pb-4 border-b border-gray-50">
                            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                                <Type size={20} />
                            </div>
                            <h2 className="text-lg font-black text-gray-900 uppercase tracking-tight">Content</h2>
                        </div>

                        <div className="space-y-3">
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">Notification Title *</label>
                            <Input
                                name="title"
                                value={formData.title}
                                onChange={handleInputChange}
                                placeholder="Alert Heading..."
                                required
                                className="font-bold text-lg h-14 bg-gray-50/50 border-2"
                            />
                        </div>

                        <div className="space-y-3">
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">Main Message *</label>
                            <textarea
                                name="message"
                                value={formData.message}
                                onChange={handleInputChange}
                                rows={4}
                                placeholder="Detailed description of the alert..."
                                required
                                className="w-full bg-gray-50/50 border-2 border-gray-100 rounded-[2rem] p-5 text-sm font-medium focus:outline-none focus:border-primary/20 transition-all resize-none"
                            />
                        </div>
                    </div>

                    <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-xl shadow-gray-200/50 space-y-6">
                        <div className="flex items-center gap-3 pb-4 border-b border-gray-50">
                            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                                <LinkIcon size={20} />
                            </div>
                            <h2 className="text-lg font-black text-gray-900 uppercase tracking-tight">Media & Interaction</h2>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="space-y-3">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">Image URL (Optional)</label>
                                <div className="relative">
                                    <ImageIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" size={18} />
                                    <Input
                                        name="imageUrl"
                                        value={formData.imageUrl}
                                        onChange={handleInputChange}
                                        placeholder="https://..."
                                        className="h-14 pl-12 bg-gray-50/50 border-2"
                                    />
                                </div>
                            </div>
                            <div className="space-y-3">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">Action Link (Optional)</label>
                                <div className="relative">
                                    <LinkIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" size={18} />
                                    <Input
                                        name="actionUrl"
                                        value={formData.actionUrl}
                                        onChange={handleInputChange}
                                        placeholder="/products/..."
                                        className="h-14 pl-12 bg-gray-50/50 border-2"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Side: Targeting & Classification */}
                <div className="space-y-8">
                    <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-xl shadow-gray-200/50 space-y-6">
                        <div className="flex items-center gap-3 pb-4 border-b border-gray-50">
                            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                                <Bell size={20} />
                            </div>
                            <h2 className="text-lg font-black text-gray-900 uppercase tracking-tight">Classification</h2>
                        </div>

                        <div className="space-y-6">
                            <div className="space-y-3">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">Alert Category</label>
                                <select
                                    name="type"
                                    value={formData.type}
                                    onChange={handleInputChange}
                                    className="w-full bg-gray-50/50 border-2 border-gray-100 rounded-2xl h-14 px-4 text-sm font-black uppercase tracking-widest focus:outline-none focus:border-primary/20 transition-all cursor-pointer"
                                >
                                    {Object.values(NOTIFICATION_TYPE).map(t => (
                                        <option key={t} value={t}>{t}</option>
                                    ))}
                                </select>
                            </div>

                            <div className="space-y-3">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">Hub Status</label>
                                <select
                                    name="status"
                                    value={formData.status}
                                    onChange={handleInputChange}
                                    className="w-full bg-gray-50/50 border-2 border-gray-100 rounded-2xl h-14 px-4 text-sm font-black uppercase tracking-widest focus:outline-none focus:border-primary/20 transition-all cursor-pointer"
                                >
                                    {Object.values(NOTIFICATION_STATUS).map(s => (
                                        <option key={s} value={s}>{s}</option>
                                    ))}
                                </select>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-xl shadow-gray-200/50 space-y-6">
                        <div className="flex items-center gap-3 pb-4 border-b border-gray-50">
                            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                                <UserIcon size={20} />
                            </div>
                            <h2 className="text-lg font-black text-gray-900 uppercase tracking-tight">Targeting</h2>
                        </div>

                        <div className="space-y-3">
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">Specific User ID</label>
                            <Input
                                name="userId"
                                value={formData.userId}
                                onChange={handleInputChange}
                                placeholder="Leave empty for all users"
                                className="h-14 bg-gray-50/50 border-2 font-mono text-xs uppercase"
                            />
                            <div className="flex items-start gap-2 mt-2 px-1">
                                <AlertCircle size={14} className="text-amber-500 shrink-0 mt-0.5" />
                                <p className="text-[9px] text-gray-400 font-bold italic leading-relaxed">
                                    Providing a User ID will target a single specific account. Leave blank to broadcast to every active user in the peripheral.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default NotificationForm;
